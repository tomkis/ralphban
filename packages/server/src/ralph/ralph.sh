#!/bin/bash
set -e

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
    echo "Usage: $0 <working_directory> <prompt> <mcp_config_json>"
    exit 1
fi

WORKING_DIR="$1"
PROMPT="$2"
MCP_CONFIG_JSON="$3"

cd "$WORKING_DIR"

result=$(echo "$PROMPT" | claude --dangerously-skip-permissions --mcp-config "$MCP_CONFIG_JSON")

echo "$result"

if [[ $result == *"<promise>COMPLETE</promise>"* ]]; then
    echo "PRD is complete"
    exit 0
fi
