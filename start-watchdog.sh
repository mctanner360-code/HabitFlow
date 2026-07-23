#!/bin/bash
# One-command launcher for HabitForge + watchdog
# Run this after a sandbox restart to get everything back up.

echo "🔧 Starting HabitForge with watchdog supervision..."
cd /home/team/shared/site

# Kill anything on port 3000
kill $(lsof -ti:3000 2>/dev/null) 2>/dev/null || true
sleep 1

# Launch watchdog (which auto-starts the server)
nohup ./watchdog.sh &
echo "✅ Watchdog launched. Site will be live in a few seconds."
echo "   Logs: tail -f watchdog.log"
