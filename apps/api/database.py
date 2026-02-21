"""In-memory data store (swappable for Postgres later)."""
from __future__ import annotations

from typing import Optional
from models import Run, Step


class Database:
    """Simple in-memory store that mirrors future Postgres schema."""

    def __init__(self) -> None:
        self.runs: dict[str, Run] = {}
        self.steps: dict[str, Step] = {}  # keyed by step_id

    # ── Runs ─────────────────────────────────────────────────────────────

    def create_run(self, run: Run) -> Run:
        self.runs[run.run_id] = run
        return run

    def get_run(self, run_id: str) -> Optional[Run]:
        return self.runs.get(run_id)

    def list_runs(self, limit: int = 50) -> list[Run]:
        runs = sorted(self.runs.values(), key=lambda r: r.created_at, reverse=True)
        return runs[:limit]

    def update_run(self, run: Run) -> Run:
        self.runs[run.run_id] = run
        return run

    # ── Steps ────────────────────────────────────────────────────────────

    def create_step(self, step: Step) -> Step:
        self.steps[step.step_id] = step
        return step

    def get_step(self, step_id: str) -> Optional[Step]:
        return self.steps.get(step_id)

    def get_steps_for_run(self, run_id: str) -> list[Step]:
        return sorted(
            [s for s in self.steps.values() if s.run_id == run_id],
            key=lambda s: s.started_at,
        )

    def update_step(self, step: Step) -> Step:
        self.steps[step.step_id] = step
        return step


# Singleton
db = Database()
