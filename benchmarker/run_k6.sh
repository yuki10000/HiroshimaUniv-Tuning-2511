#!/usr/bin/env bash
set -euo pipefail

# Wrapper to run the Node orchestrator (main.js)
HERE="$(cd "$(dirname "$0")" && pwd)"
NODE_CMD="$(command -v node || true)"
if [ -z "$NODE_CMD" ]; then
  echo "node not found in PATH. Please install Node.js to use this wrapper (or run k6 directly)." >&2
  exit 2
fi

# Ensure logs directory exists
mkdir -p "$HERE/logs"

# Timestamp for summary file
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUTFILE="$HERE/logs/test-summary-${TIMESTAMP}.txt"

echo "Running Node orchestrator and writing human-readable summary to: $OUTFILE"

# Run main.js, tee both stdout and stderr to OUTFILE, and preserve node's exit code
"$NODE_CMD" "$HERE/main.js" "$@" 2>&1 | tee "$OUTFILE"
RC=${PIPESTATUS[0]}
exit $RC
