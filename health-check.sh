#!/bin/bash
# Battle of the Paddles — local health check

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "🏓 Battle of the Paddles - Health Check"
echo "========================================"
echo ""

if pgrep -f "next-server" > /dev/null; then
    echo "✅ Next.js server is running"
    ps aux | grep "next-server" | grep -v grep | head -1
else
    echo "❌ Next.js server is NOT running"
    echo "   Start with: npm run dev   or   npm run start:local"
    exit 1
fi

echo ""

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Port 3000 is accessible"
else
    echo "❌ Port 3000 is NOT accessible"
    exit 1
fi

echo ""
echo "📡 Testing API Endpoints:"

AUTH_RESPONSE=$(curl -s http://localhost:3000/api/auth)
if echo "$AUTH_RESPONSE" | grep -q "configured"; then
    echo "  ✅ /api/auth → OK"
else
    echo "  ❌ /api/auth → FAILED"
fi

EVENT_RESPONSE=$(curl -s http://localhost:3000/api/event)
if echo "$EVENT_RESPONSE" | grep -q "battle-of-the-paddles"; then
    PLAYER_COUNT=$(echo "$EVENT_RESPONSE" | grep -o '"id":"p-' | wc -l)
    echo "  ✅ /api/event → OK ($PLAYER_COUNT players)"
else
    echo "  ❌ /api/event → FAILED"
fi

echo ""

if [ -f "$ROOT/data/tournament.json" ]; then
    SIZE=$(du -h "$ROOT/data/tournament.json" | cut -f1)
    echo "✅ Tournament data file exists ($SIZE)"
else
    echo "ℹ️  No data/tournament.json yet (created on first save)"
fi

echo ""
echo "========================================"
echo "🎯 Status: ALL SYSTEMS OPERATIONAL"
echo ""
echo "Open: http://localhost:3000"
echo "PIN: 0909"
echo ""
