#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
python3 -m http.server 4173 &
SERVER_PID=$!
sleep 1
open "http://localhost:4173" 2>/dev/null || xdg-open "http://localhost:4173" 2>/dev/null || true
wait "$SERVER_PID"
