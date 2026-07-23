#!/bin/bash
# HabitForge Watchdog — keeps the site alive on port 3000
# If the server dies (crash, OOM, whatever), this restarts it immediately.

SITE_DIR="/home/team/shared/site"
CHECK_URL="http://localhost:3000"
HEALTH_URL="http://localhost:3000"
RESTART_COOLDOWN=3
LOG_FILE="$SITE_DIR/watchdog.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

restart_server() {
  log "RESTARTING SERVER..."
  
  # Kill any existing serve processes
  pkill -f "bun run serve.ts" 2>/dev/null || true
  pkill -f "bun.*serve" 2>/dev/null || true
  sleep 1
  
  # Kill anything still on port 3000
  local pid=$(lsof -ti:3000 2>/dev/null)
  if [ -n "$pid" ]; then
    kill -9 $pid 2>/dev/null || true
    sleep 1
  fi
  
  cd "$SITE_DIR"
  nohup bun run serve.ts >> "$LOG_FILE" 2>&1 &
  
  # Wait for startup
  for i in $(seq 1 15); do
    sleep 1
    if curl -s -o /dev/null -w "%{http_code}" "$CHECK_URL" 2>/dev/null | grep -q "200\|302\|304"; then
      log "Server started successfully (PID $!)"
      return 0
    fi
  done
  
  log "WARNING: Server started but not responding within 15s"
  return 1
}

# Trap exit to clean up
trap 'log "Watchdog stopping."; exit 0' INT TERM

log "🚀 HabitForge Watchdog started. Monitoring $CHECK_URL every 10s."

# Initial health check — if server isn't running, start it
if ! curl -s -o /dev/null --max-time 5 "$CHECK_URL" 2>/dev/null; then
  log "Server not running at startup — starting now."
  restart_server
fi

consecutive_failures=0

while true; do
  sleep 10
  
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$CHECK_URL" 2>/dev/null)
  
  if echo "$http_code" | grep -q "200\|302\|304\|401\|403\|404"; then
    # Server is responding — any HTTP response means it's alive
    if [ $consecutive_failures -gt 0 ]; then
      log "Server recovered after $consecutive_failures failures."
    fi
    consecutive_failures=0
  else
    consecutive_failures=$((consecutive_failures + 1))
    log "FAILURE #$consecutive_failures: Server returned $http_code or timed out"
    
    if [ $consecutive_failures -ge 2 ]; then
      restart_server
      consecutive_failures=0
      sleep $RESTART_COOLDOWN
    fi
  fi
done
