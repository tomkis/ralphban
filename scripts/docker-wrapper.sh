#!/usr/bin/env bash

set -e

DOCKER_IMAGE="ghcr.io/tomkis/ralphban:latest"
DEFAULT_PORT=3001

if ! command -v docker &> /dev/null; then
  echo "Error: Docker is not available. Please install Docker to use ralphban." >&2
  exit 1
fi

PORT=$DEFAULT_PORT
CWD=$(pwd)

while [[ $# -gt 0 ]]; do
  case $1 in
    --port)
      PORT="$2"
      shift 2
      ;;
    --port=*)
      PORT="${1#*=}"
      shift
      ;;
    --cwd)
      CWD="$2"
      shift 2
      ;;
    --cwd=*)
      CWD="${1#*=}"
      shift
      ;;
    --help|-h)
      echo "Usage: ralphban [options]"
      echo ""
      echo "Options:"
      echo "  --port <number>  Port for HTTP server (default: 3001)"
      echo "  --cwd <path>     Working directory for Ralph execution (default: current dir)"
      echo "  --help, -h       Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

exec docker run --rm -it \
  -p "${PORT}:${PORT}" \
  -v "${CWD}:/workspace" \
  -e "SKIP_GIT_VALIDATION=true" \
  "${DOCKER_IMAGE}" \
  --cwd=/workspace
