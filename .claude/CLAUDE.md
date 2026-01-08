# ralphban

## Project Goal

ralphban combines Ralph and Kanban into a unified development workflow.

**Ralph** is an agentic coding approach where an agent continuously works in a loop to implement product requirement documents (PRDs).

**ralphban** provides a Kanban board UI as a facade for the Ralph workflow. Users define PRDs through a traditional Kanban interface, while Ralph runs in the background loop to build the project based on those requirements.

## Architecture

**UI**: Kanban board for PRD management

**Server**: Cron job that:
- Reads tasks from database
- Creates agent specification
- Generates prd.json
- Launches ralph

## Development

`plans/` folder is for developing ralphban itself using Ralph approach. This project is built with the same methodology it enables for other apps.

### Rules
- Always run `pnpm typecheck` to validate
- Always run `pnpm lint` to run linter

## Tech Stack
- Project is using `pnpm`
- Project is monorepo using pnpm workspaces