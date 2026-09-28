#!/bin/bash
# ChoZen Studio launcher. Double-click this file (or the desktop icon pointing
# at it) to start the app. Replaces the old studio.sh menu.
cd "$(dirname "$0")" || exit 1

printf '\n  ChoZen Studio\n'
printf '  starting...\n\n'

if ! command -v node >/dev/null 2>&1; then
  printf '  Node.js is not installed.\n'
  printf '  Install it from https://nodejs.org (LTS), then run this again.\n\n'
  read -r -p '  Press return to close.' _
  exit 1
fi

MAJOR=$(node -p 'process.versions.node.split(".")[0]')
if [ "$MAJOR" -lt 18 ]; then
  printf '  Node 18 or newer is required (found %s).\n\n' "$(node -v)"
  read -r -p '  Press return to close.' _
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  printf '  Created .env — add your kie.ai API key to it, then run this again.\n'
  open -t .env 2>/dev/null
  read -r -p '  Press return to close.' _
  exit 1
fi

PORT=$(node -p 'require("fs").existsSync(".env") ? (require("fs").readFileSync(".env","utf8").match(/^PORT=(\d+)/m)?.[1] || 4173) : 4173')

node server/index.js &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null' EXIT INT TERM

sleep 1
open "http://localhost:${PORT}"

printf '  Running. Close this window or press Ctrl-C to stop.\n\n'
wait $SERVER_PID
