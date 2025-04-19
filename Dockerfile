# Use official Python image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# If requirements.txt doesn't exist, create it
RUN if [ ! -f requirements.txt ]; then \
    echo "browser-use" > requirements.txt; \
    fi

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers - browser-use utilizes playwright
RUN pip install playwright && \
    playwright install --with-deps chromium

# Install required dependencies for running Chrome (for headless and no-sandbox)
RUN apt-get update && apt-get install -y \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxi6 \
    libgdk-pixbuf2.0-0 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libgbm1 \
    fonts-liberation \
    xdg-utils \
    ca-certificates \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copy necessary files
COPY olx-agent.py .
COPY list-items.md .
COPY upload-images.md .
COPY ./images ./images

# Environment variables
ENV PLAYWRIGHT_HEADLESS=true
ENV DISPLAY=:99
ENV CHROME_BIN=/usr/bin/google-chrome
ENV OPENAI_API_KEY=

# Add entrypoint script to run Chrome in headless mode with --no-sandbox flag
RUN echo '#!/bin/bash\nXvfb :99 -screen 0 1280x720x24 -ac &\n/usr/bin/google-chrome --headless --no-sandbox --disable-dev-shm-usage --remote-debugging-port=9222 &\npython olx-agent.py\n' > entrypoint.sh && \
    chmod +x entrypoint.sh

# Run the agent
CMD ["./entrypoint.sh"]
