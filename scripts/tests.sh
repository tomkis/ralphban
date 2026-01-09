#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_LOG="$PROJECT_ROOT/.server-test.log"

cleanup() {
  [ -n "$TAIL_PID" ] && kill $TAIL_PID 2>/dev/null

  if [ -n "$SERVER_PID" ]; then
    kill -TERM $SERVER_PID 2>/dev/null
    for i in {1..5}; do
      kill -0 $SERVER_PID 2>/dev/null || break
      sleep 1
    done
    kill -KILL $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
  fi

  echo ""
  echo "Server log: $SERVER_LOG"
}

trap cleanup EXIT

find_available_port() {
  local port
  port=$(python3 -c 'import socket; s=socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()')
  echo "$port"
}

wait_for_server() {
  local port=$1
  local max_attempts=30
  local attempt=0

  echo "Waiting for server to be ready on port $port..."
  while [ $attempt -lt $max_attempts ]; do
    if curl -s "http://localhost:$port/mcp" -X POST -H "Content-Type: application/json" -d '{}' >/dev/null 2>&1; then
      echo "Server is ready!"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 1
  done

  echo "Server failed to start within $max_attempts seconds"
  return 1
}

PORT=$(find_available_port)
echo "Using port: $PORT"

echo "Starting server..."
cd "$PROJECT_ROOT"
PORT=$PORT pnpm --filter @ralphban/server dev > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!

sleep 1
tail -f "$SERVER_LOG" | sed 's/^/[SERVER] /' &
TAIL_PID=$!

wait_for_server $PORT

echo ""
echo "Running integration tests..."
RALPH_API_URL=http://localhost:$PORT SERVER_PORT=$PORT pnpm --filter @ralphban/integration-tests test
TEST_EXIT_CODE=$?

echo ""
echo "Tests completed with exit code: $TEST_EXIT_CODE"
exit $TEST_EXIT_CODE
