#!/bin/bash
Xvfb :99 -screen 0 1280x720x24 -ac &
/usr/bin/google-chrome --headless --no-sandbox --disable-dev-shm-usage --remote-debugging-port=9222 &
python olx-agent.py

