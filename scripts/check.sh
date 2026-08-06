#!/bin/bash
set -euo pipefail

echo "==> Typegen"
npx next typegen

echo "==> TypeScript"
npm exec tsc -- --noEmit

echo "==> Next build"
npm run build

echo "==> Worker module load"
node --input-type=module <<'EOF'
import('./worker/index.js')
  .then(() => console.log('worker_load_ok'))
  .catch((e) => { console.error(e.message); process.exit(1); });
EOF

echo "==> Worker bundle sanity check"
(
  cd worker
  npm install --no-audit --no-fund --prefer-offline >/dev/null 2>&1
  node -e "const d=require('./package.json'); console.log('worker_pkg_name='+d.name,'zod='+d.dependencies.zod)"
)
