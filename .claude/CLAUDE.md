# RalphBan

## Project Goal

RalphBan combines Ralph and Kanban into a unified development workflow.

**Ralph** is an agentic coding approach where an agent continuously works in a loop to implement product requirement documents (PRDs).

**RalphBan** provides a Kanban board UI as a facade for the Ralph workflow. Users define PRDs through a traditional Kanban interface, while Ralph runs in the background loop to build the project based on those requirements.

## Architecture

**UI**: Kanban board for PRD management

**Server**: Cron job that:
- Reads tasks from database
- Creates agent specification
- Generates prd.json
- Launches ralph

## Development

`plans/` folder is for developing RalphBan itself using Ralph approach. This project is built with the same methodology it enables for other apps.
