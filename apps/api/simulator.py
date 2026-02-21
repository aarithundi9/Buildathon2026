"""Simulator that walks a scenario tree and emits steps over time."""
from __future__ import annotations

import asyncio
import uuid
import logging
from datetime import datetime, timezone

from models import Run, Step, RunStatus, StepStatus, StepType, StepError
from database import db
from websocket_manager import manager
from scenarios import ScenarioStep, SCENARIOS

logger = logging.getLogger(__name__)

# Cost per 1K tokens (USD)
COST_RATES = {
    "gpt-4": {"prompt": 0.03, "completion": 0.06},
    "claude-3.5": {"prompt": 0.003, "completion": 0.015},
    "default": {"prompt": 0.01, "completion": 0.03},
}

MODEL_KEY = "default"  # Change to "gpt-4" or "claude-3.5" for different pricing


def compute_cost(tokens_prompt: int, tokens_completion: int) -> float:
    """Compute cost in USD for given token counts."""
    rates = COST_RATES[MODEL_KEY]
    return round(
        (tokens_prompt / 1000) * rates["prompt"]
        + (tokens_completion / 1000) * rates["completion"],
        6,
    )


async def emit_step(
    run_id: str,
    scenario_step: ScenarioStep,
    parent_step_id: str | None = None,
) -> str:
    """Emit a single step: create it as running, wait, then complete it."""

    step_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    # Determine status for creation
    initial_status = StepStatus.running
    step_type = StepType(scenario_step.type)

    # If this is an error step, we still start as running
    cost = compute_cost(scenario_step.tokens_prompt, scenario_step.tokens_completion)

    step = Step(
        step_id=step_id,
        run_id=run_id,
        parent_step_id=parent_step_id,
        name=scenario_step.name,
        type=step_type,
        status=initial_status,
        started_at=now,
        tokens_prompt=scenario_step.tokens_prompt,
        tokens_completion=scenario_step.tokens_completion,
        cost_usd=cost,
        input=scenario_step.input_data,
    )
    db.create_step(step)

    # Broadcast the "running" step
    await manager.broadcast(run_id, {
        "type": "step_update",
        "step": step.model_dump(),
    })

    # Simulate processing time
    await asyncio.sleep(scenario_step.delay_s)

    # Complete or fail the step
    end_time = datetime.now(timezone.utc).isoformat()
    step.ended_at = end_time
    step.duration_ms = scenario_step.duration_ms

    if scenario_step.should_fail:
        step.status = StepStatus.failed
        step.type = StepType.error
        if scenario_step.error_data:
            step.error = StepError(**scenario_step.error_data)
        else:
            step.error = StepError(message="Step failed unexpectedly")
        step.output = {}
    elif scenario_step.retry_of:
        step.status = StepStatus.completed
        step.output = scenario_step.output_data
    else:
        step.status = StepStatus.completed
        step.output = scenario_step.output_data

    db.update_step(step)

    # Broadcast the completed/failed step
    await manager.broadcast(run_id, {
        "type": "step_update",
        "step": step.model_dump(),
    })

    return step_id


async def walk_scenario(
    run_id: str,
    scenario_step: ScenarioStep,
    parent_step_id: str | None = None,
    is_root: bool = False,
) -> None:
    """Recursively walk the scenario tree and emit steps."""

    step_id = await emit_step(run_id, scenario_step, parent_step_id)

    # If root, update run's root_step_id
    if is_root:
        run = db.get_run(run_id)
        if run:
            run.root_step_id = step_id
            db.update_run(run)
            await manager.broadcast(run_id, {
                "type": "run_update",
                "run": run.model_dump(),
            })

    # Process children
    if scenario_step.children:
        # Check if children can be parallelized (siblings at same level)
        # For simplicity, we run children sequentially to show the tree building
        for child in scenario_step.children:
            await walk_scenario(run_id, child, step_id)


async def run_simulation(run_id: str, scenario_name: str) -> None:
    """Run a full simulation for a given scenario."""
    scenario = SCENARIOS.get(scenario_name)
    if not scenario:
        logger.error(f"Unknown scenario: {scenario_name}")
        return

    try:
        logger.info(f"Starting simulation: {scenario_name} for run {run_id}")
        await walk_scenario(run_id, scenario, is_root=True)

        # Complete the run
        run = db.get_run(run_id)
        if run:
            run.status = RunStatus.completed
            run.updated_at = datetime.now(timezone.utc).isoformat()
            db.update_run(run)
            await manager.broadcast(run_id, {
                "type": "run_update",
                "run": run.model_dump(),
            })

        logger.info(f"Simulation completed: {scenario_name} for run {run_id}")

    except Exception as e:
        logger.exception(f"Simulation error: {e}")
        run = db.get_run(run_id)
        if run:
            run.status = RunStatus.failed
            run.updated_at = datetime.now(timezone.utc).isoformat()
            db.update_run(run)
            await manager.broadcast(run_id, {
                "type": "run_update",
                "run": run.model_dump(),
            })
