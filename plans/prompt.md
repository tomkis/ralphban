# Ralph Agent Instructions

## Your Task

1. Read `@plans/prd.json`
2. Read `@plans/progress.txt`
   (check Codebase Patterns first)
4. Pick highest priority task from PRD
   where `passes: false`
5. Implement that ONE task
6. Run `pnpm typecheck` to verify no type errors
7. Fix any type errors if present
9. Update prd.json: `passes: true`
10. Append learnings to progress.txt
8. Commit: `[Category]: [ID] - [Title]`
11. Terminate, you are only supposed to work on ONE task, not more

If while implementing the feature, you notice PRD is complete, output <promise>COMPLETE</promise>.

## Progress Format

APPEND to progress.txt:

## [Date] - [Task ID]
- What was implemented
- Files changed
- **Learnings:**
  - Patterns discovered
  - Gotchas encountered
  - Proposed things to follow up with
---
