set -e

claude --dangerously-skip-permissions "$(cat ./plans/prompt.md)"