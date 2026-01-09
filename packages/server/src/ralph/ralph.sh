#!/bin/bash
set -e

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <working_directory> <prompt>"
    exit 1
fi

WORKING_DIR="$1"
PROMPT="$2"

cd "$WORKING_DIR"

result=$(claude --dangerously-skip-permissions "$PROMPT")

echo "$result"

if [[ $result == *"<promise>COMPLETE</promise>"* ]]; then
    echo "PRD is complete"
    exit 0
fi
