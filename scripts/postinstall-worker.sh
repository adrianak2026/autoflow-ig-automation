#!/bin/bash
set -euo pipefail

if [ ! -f worker/index.js ]; then
  echo "worker/index.js not found; skipping worker setup." >&2
  exit 0
fi

if [ ! -f worker/package.json ]; then
  echo "worker/package.json not found; skipping worker setup." >&2
  exit 0
fi

if [ ! -d worker/node_modules ]; then
  echo "==> Installing worker dependencies"
  npm install -C worker --no-audit --no-fund
else
  echo "==> Worker dependencies already present"
fi

echo "worker package: $(node -e "const d=require('./worker/package.json');console.log(d.name+'/'+d.version)")"
