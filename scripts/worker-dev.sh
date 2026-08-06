#!/bin/bash
set -euo pipefail

if [ ! -d "worker/node_modules" ]; then
  echo "==> Installing worker dependencies"
  npm install -C worker
fi

cd worker
echo "==> Starting local worker with wrangler dev"
exec npx wrangler dev --port 9001
