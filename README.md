# UAOP – Universal Agent Observability Platform

> Real-time observability for AI agent execution traces. Watch agent reasoning unfold as a live, growing DAG with full step inspection.

![Status](https://img.shields.io/badge/status-demo-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6)

---

## Overview

UAOP provides a production-grade observability UI for AI agent systems. It displays real-time execution traces as interactive DAG graphs, with full step inspection including prompts, completions, tool calls, errors, token counts, and costs.

### Key Features

- **Live Execution Graph** – React Flow-powered DAG that grows in real-time as agent steps execute
- **Node Status Coloring** – Blue (LLM), Purple (Tool), Amber (Plan), Green (Final), Red (Error)
- **Step Inspector** – Slide-over panel with full details: prompts, completions, tool args, errors, tokens, cost
- **Run Explorer Table** – Searchable/filterable table view with type and status filters
- **Header Stats** – Duration, total tokens, estimated cost for the current run
- **5 Demo Scenarios** – Flight booking (with retry), research summarizer, code assistant, customer support, simple happy path
- **Real-Time WebSockets** – Steps stream live from backend to frontend per-run
- **Dark Mode** – Dark by default with light mode toggle
- **Production-Grade UI** – shadcn/ui components, skeleton loaders, empty states, animations

---

## Architecture

```
┌─────────────┐     REST + WS      ┌──────────────┐
│   Next.js   │ ◄────────────────► │   FastAPI     │
│   (React)   │   /api/runs, etc.  │   (Python)    │
│   Port 3000 │   ws://…/ws/runs/  │   Port 8000   │
└─────────────┘                    └──────┬───────┘
                                         │
                                   In-Memory Store
                                   (swappable for Postgres)
```

### Data Model (Universal Contract)

**Run:**
```json
{
  "run_id": "uuid",
  "created_at": "iso",
  "updated_at": "iso",
  "status": "running|completed|failed",
  "system_type": "mock|openclaw|claude|other",
  "root_step_id": "uuid|null",
  "metadata": { "user_id": "demo", "tags": ["demo"] }
}
```

**Step:**
```json
{
  "step_id": "uuid",
  "run_id": "uuid",
  "parent_step_id": "uuid|null",
  "name": "string",
  "type": "llm|tool|plan|final|error",
  "status": "running|completed|failed|retrying",
  "started_at": "iso",
  "ended_at": "iso|null",
  "duration_ms": 0,
  "tokens_prompt": 0,
  "tokens_completion": 0,
  "cost_usd": 0,
  "input": {},
  "output": {},
  "error": { "message": "", "stack": null, "code": null } | null
}
```

---

## Quickstart

### Prerequisites

- **Node.js** 18+ and **pnpm** (or npm/yarn)
- **Python** 3.10+
- (Optional) **Docker** and **Docker Compose** for containerized setup

### 1. Clone & Install

```bash
git clone https://github.com/your-org/uaop-demo.git
cd uaop-demo

# Install frontend dependencies
cd apps/web
pnpm install
cd ../..

# Install backend dependencies
cd apps/api
pip install -r requirements.txt
cd ../..
```

### 2. Start the Backend (FastAPI)

```bash
cd apps/api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. You can verify with:
```bash
curl http://localhost:8000/api/health
```

### 3. Start the Frontend (Next.js)

```bash
cd apps/web
pnpm dev
```

The UI will be available at `http://localhost:3000`.

### 4. Run a Demo

1. Open `http://localhost:3000` in your browser
2. Click **"Start Demo Run"** in the left sidebar
3. Choose one of the 5 scenarios
4. Watch the execution graph build in real-time!
5. Click any node to open the inspector panel

---

## Docker Compose (Optional)

For a fully containerized setup with PostgreSQL:

```bash
docker compose up --build
```

This starts:
- **PostgreSQL** on port 5432
- **FastAPI** on port 8000
- **Next.js** on port 3000

> Note: The demo currently uses in-memory storage. PostgreSQL is provisioned for future use.

---

## Demo Scenarios

| Scenario | Description | Key Features |
|----------|-------------|--------------|
| **Flight Booking** | Agent books a flight, payment fails, retries with backup card | Error → retry flow, red nodes |
| **Research Summarizer** | Parallel web searches, synthesis, final summary | Branching tree, multiple tool calls |
| **Code Assistant** | Reads files, analyzes error, generates fix, runs tests | Deep chain, mixed tool/LLM steps |
| **Customer Support** | Classifies intent, retrieves KB, drafts response | Parallel retrieval, quality check |
| **Simple Happy Path** | Plan → Tool → LLM → Final | Clean linear flow |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/runs` | Create a run (optionally with scenario) |
| `GET` | `/api/runs` | List recent runs |
| `GET` | `/api/runs/{run_id}` | Get a single run |
| `GET` | `/api/runs/{run_id}/steps` | Get all steps for a run |
| `POST` | `/api/steps` | Create a step manually |
| `GET` | `/api/scenarios` | List available demo scenarios |
| `WS` | `/ws/runs/{run_id}` | Real-time step/run updates |

### WebSocket Messages

```json
{ "type": "step_update", "step": { ... } }
{ "type": "run_update", "run": { ... } }
```

---

## Cost Calculation

Token costs are computed per-step using hardcoded rates:

| Model | Prompt (per 1K) | Completion (per 1K) |
|-------|-----------------|---------------------|
| GPT-4 | $0.030 | $0.060 |
| Claude 3.5 | $0.003 | $0.015 |
| Default (demo) | $0.010 | $0.030 |

---

## Project Structure

```
Buildathon2026/
├── package.json                    # Root monorepo scripts
├── pnpm-workspace.yaml
├── docker-compose.yml
├── apps/
│   ├── api/                        # FastAPI backend
│   │   ├── main.py                 # App, routes, WebSocket
│   │   ├── models.py               # Pydantic models
│   │   ├── database.py             # In-memory store
│   │   ├── simulator.py            # Step emission engine
│   │   ├── scenarios.py            # 5 demo scenario trees
│   │   ├── websocket_manager.py    # WS connection manager
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── web/                        # Next.js frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx       # Root layout
│       │   │   ├── page.tsx         # Dashboard
│       │   │   ├── providers.tsx    # Query + Theme providers
│       │   │   ├── globals.css      # Tailwind + CSS vars
│       │   │   └── runs/[runId]/
│       │   │       └── page.tsx     # Run workspace
│       │   ├── components/
│       │   │   ├── ui/              # shadcn/ui components
│       │   │   ├── layout/          # Sidebar, HeaderStats, ThemeToggle
│       │   │   ├── graph/           # ExecutionGraph, StepNode, layout utils
│       │   │   ├── inspector/       # StepInspector slide-over
│       │   │   └── explorer/        # RunExplorer table
│       │   ├── hooks/               # useRuns, useSteps, useWebSocket
│       │   ├── lib/                 # api, websocket, utils, cost
│       │   └── types/               # TypeScript type definitions
│       ├── package.json
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── next.config.js
```

---

## Extending for Production

The demo is designed to be easily extended:

1. **Swap storage**: Replace `database.py` with a PostgreSQL-backed store using SQLAlchemy/asyncpg. The data model is already Postgres-compatible.

2. **Real agent ingestion**: Replace or supplement the simulator with real agent trace ingestion. The API endpoints (`POST /api/runs`, `POST /api/steps`) already accept the universal contract format.

3. **Authentication**: Add JWT auth middleware to FastAPI and corresponding token handling in the frontend.

4. **Multi-tenancy**: The `RunMetadata.user_id` field is already in the schema for filtering by user.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| Graph | React Flow, dagre |
| State | TanStack Query (React Query) |
| Real-time | WebSockets |
| Backend | FastAPI, Pydantic v2 |
| Storage | In-memory (Postgres-ready schema) |

---

## License

MITal Agent Observability Platform

> Real-time observability for AI agent execution traces. Watch agent reasoning unfold as a live, growing DAG with full step inspection.

![Status](https://img.shields.io/badge/status-demo-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6)

---

## Overview

UAOP provides a production-grade observability UI for AI agent systems. It displays real-time execution traces as interactive DAG graphs, with full step inspection including prompts, completions, tool calls, errors, token counts, and costs.

### Key Features

- **Live Execution Graph** – React Flow-powered DAG that grows in real-time as agent steps execute
- **Node Status Coloring** – Blue (LLM), Purple (Tool), Amber (Plan), Green (Final), Red (Error)
- **Step Inspector** – Slide-over panel with full details: prompts, completions, tool args, errors, tokens, cost
- **Run Explorer Table** – Searchable/filterable table view with type and status filters
- **Header Stats** – Duration, total tokens, estimated cost for the current run
- **5 Demo Scenarios** – Flight booking (with retry), research summarizer, code assistant, customer support, simple happy path
- **Real-Time WebSockets** – Steps stream live from backend to frontend per-run
- **Dark Mode** – Dark by default with light mode toggle
- **Production-Grade UI** – shadcn/ui components, skeleton loaders, empty states, animations

---

## Architecture

```
┌─────────────┐     REST + WS      ┌──────────────┐
│   Next.js   │ ◄────────────────► │   FastAPI     │
│   (React)   │   /api/runs, etc.  │   (Python)    │
│   Port 3000 │   ws://…/ws/runs/  │   Port 8000   │
└─────────────┘                    └──────┬───────┘
                                         │
                                   In-Memory Store
                                   (swappable for Postgres)
```

### Data Model (Universal Contract)

**Run:**
```json
{
  "run_id": "uuid",
  "created_at": "iso",
  "updated_at": "iso",
  "status": "running|completed|failed",
  "system_type": "mock|openclaw|claude|other",
  "root_step_id": "uuid|null",
  "metadata": { "user_id": "demo", "tags": ["demo"] }
}
```

**Step:**
```json
{
  "step_id": "uuid",
  "run_id": "uuid",
  "parent_step_id": "uuid|null",
  "name": "string",
  "type": "llm|tool|plan|final|error",
  "status": "running|completed|failed|retrying",
  "started_at": "iso",
  "ended_at": "iso|null",
  "duration_ms": 0,
  "tokens_prompt": 0,
  "tokens_completion": 0,
  "cost_usd": 0,
  "input": {},
  "output": {},
  "error": { "message": "", "stack": null, "code": null } | null
}
```

---

## Quickstart

### Prerequisites

- **Node.js** 18+ and **pnpm** (or npm/yarn)
- **Python** 3.10+
- (Optional) **Docker** and **Docker Compose** for containerized setup

### 1. Clone & Install

```bash
git clone https://github.com/your-org/uaop-demo.git
cd uaop-demo

# Install frontend dependencies
cd apps/web
pnpm install
cd ../..

# Install backend dependencies
cd apps/api
pip install -r requirements.txt
cd ../..
```

### 2. Start the Backend (FastAPI)

```bash
cd apps/api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. You can verify with:
```bash
curl http://localhost:8000/api/health
```

### 3. Start the Frontend (Next.js)

```bash
cd apps/web
pnpm dev
```

The UI will be available at `http://localhost:3000`.

### 4. Run a Demo

1. Open `http://localhost:3000` in your browser
2. Click **"Start Demo Run"** in the left sidebar
3. Choose one of the 5 scenarios
4. Watch the execution graph build in real-time!
5. Click any node to open the inspector panel

---

## Docker Compose (Optional)

For a fully containerized setup with PostgreSQL:

```bash
docker compose up --build
```

This starts:
- **PostgreSQL** on port 5432
- **FastAPI** on port 8000
- **Next.js** on port 3000

> Note: The demo currently uses in-memory storage. PostgreSQL is provisioned for future use.

---

## Demo Scenarios

| Scenario | Description | Key Features |
|----------|-------------|--------------|
| **Flight Booking** | Agent books a flight, payment fails, retries with backup card | Error → retry flow, red nodes |
| **Research Summarizer** | Parallel web searches, synthesis, final summary | Branching tree, multiple tool calls |
| **Code Assistant** | Reads files, analyzes error, generates fix, runs tests | Deep chain, mixed tool/LLM steps |
| **Customer Support** | Classifies intent, retrieves KB, drafts response | Parallel retrieval, quality check |
| **Simple Happy Path** | Plan → Tool → LLM → Final | Clean linear flow |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/runs` | Create a run (optionally with scenario) |
| `GET` | `/api/runs` | List recent runs |
| `GET` | `/api/runs/{run_id}` | Get a single run |
| `GET` | `/api/runs/{run_id}/steps` | Get all steps for a run |
| `POST` | `/api/steps` | Create a step manually |
| `GET` | `/api/scenarios` | List available demo scenarios |
| `WS` | `/ws/runs/{run_id}` | Real-time step/run updates |

### WebSocket Messages

```json
{ "type": "step_update", "step": { ... } }
{ "type": "run_update", "run": { ... } }
```

---

## Cost Calculation

Token costs are computed per-step using hardcoded rates:

| Model | Prompt (per 1K) | Completion (per 1K) |
|-------|-----------------|---------------------|
| GPT-4 | $0.030 | $0.060 |
| Claude 3.5 | $0.003 | $0.015 |
| Default (demo) | $0.010 | $0.030 |

---

## Project Structure

```
Buildathon2026/
├── package.json                    # Root monorepo scripts
├── pnpm-workspace.yaml
├── docker-compose.yml
├── apps/
│   ├── api/                        # FastAPI backend
│   │   ├── main.py                 # App, routes, WebSocket
│   │   ├── models.py               # Pydantic models
│   │   ├── database.py             # In-memory store
│   │   ├── simulator.py            # Step emission engine
│   │   ├── scenarios.py            # 5 demo scenario trees
│   │   ├── websocket_manager.py    # WS connection manager
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── web/                        # Next.js frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx       # Root layout
│       │   │   ├── page.tsx         # Dashboard
│       │   │   ├── providers.tsx    # Query + Theme providers
│       │   │   ├── globals.css      # Tailwind + CSS vars
│       │   │   └── runs/[runId]/
│       │   │       └── page.tsx     # Run workspace
│       │   ├── components/
│       │   │   ├── ui/              # shadcn/ui components
│       │   │   ├── layout/          # Sidebar, HeaderStats, ThemeToggle
│       │   │   ├── graph/           # ExecutionGraph, StepNode, layout utils
│       │   │   ├── inspector/       # StepInspector slide-over
│       │   │   └── explorer/        # RunExplorer table
│       │   ├── hooks/               # useRuns, useSteps, useWebSocket
│       │   ├── lib/                 # api, websocket, utils, cost
│       │   └── types/               # TypeScript type definitions
│       ├── package.json
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── next.config.js
```

---

## Extending for Production

The demo is designed to be easily extended:

1. **Swap storage**: Replace `database.py` with a PostgreSQL-backed store using SQLAlchemy/asyncpg. The data model is already Postgres-compatible.

2. **Real agent ingestion**: Replace or supplement the simulator with real agent trace ingestion. The API endpoints (`POST /api/runs`, `POST /api/steps`) already accept the universal contract format.

3. **Authentication**: Add JWT auth middleware to FastAPI and corresponding token handling in the frontend.

4. **Multi-tenancy**: The `RunMetadata.user_id` field is already in the schema for filtering by user.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| Graph | React Flow, dagre |
| State | TanStack Query (React Query) |
| Real-time | WebSockets |
| Backend | FastAPI, Pydantic v2 |
| Storage | In-memory (Postgres-ready schema) |

---

## License

MIT