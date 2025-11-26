#!/bin/bash
# Quick start script for Vimlantis development

echo "🚢 Starting Vimlantis..."
echo ""
echo "Server will start on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

node server/index.js --port 3000 --cwd "$(pwd)"
