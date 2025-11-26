#!/bin/bash
# Vimlantis global command
# Save the current directory (where user runs the command)
CURRENT_DIR="$(pwd)"
# Change to vimlantis directory to run the server
VIMLANTIS_DIR="c:/Users/Jared/Desktop/vimlantis"
cd "$VIMLANTIS_DIR"
# Run server with the user's current directory
node server/index.js --port 3000 --cwd "$CURRENT_DIR" --open "$@"
