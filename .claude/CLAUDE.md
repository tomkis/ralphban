# ralphban

## Project Goal

ralphban combines Ralph and Kanban into a unified development workflow.

**Ralph** is an agentic coding approach where an agent continuously works in a loop to implement product requirement documents (PRDs).

**ralphban** provides a Kanban board UI as a facade for the Ralph workflow. Users define PRDs through a traditional Kanban interface. User can then trigger Ralph to start, which initiate Ralph loop - picking a ticket from the backlog and working on that.

Ralphban is meant to be used as a `npx` tool. Basically you use it on your folder on your computer, this is supposed to be a git repo. Inside that folder you can start the ralphban via `npx` via `npx ralphban` it would create `.ralphban` folder and start up the server. Then it does all the development inside that folder.

## Architecture

**UI**: Kanban board for PRD management

**Server**: Express HTTP server that:
- Provides tRPC endpoints for Kanban board operations and Ralph control
- Exposes an MCP server with tools for Ralph to interact with tasks
- Manages tasks in PostgreSQL database
- Runs Ralph loop by spawning Claude with MCP configuration to pick and implement tasks from the backlog

## Development

`plans/` folder is for developing ralphban itself using Ralph approach. This project is built with the same methodology it enables for other apps.


## Tech Stack
- Project is using `pnpm`
- Project is monorepo using pnpm workspaces