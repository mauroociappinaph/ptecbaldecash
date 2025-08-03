# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Create startup script for development
RUN echo '#!/bin/sh\n\
set -e\n\
\n\
# Wait for backend to be ready\n\
echo "Waiting for backend..."\n\
while ! nc -z backend 8000; do\n\
    sleep 1\n\
done\n\
echo "Backend is ready!"\n\
\n\
# Start development server\n\
exec npm run dev -- --host 0.0.0.0 --port 3000' > /usr/local/bin/start-dev.sh

# Create startup script for production
RUN echo '#!/bin/sh\n\
set -e\n\
\n\
# Build application if not already built\n\
if [ ! -d ".output" ]; then\n\
    echo "Building application..."\n\
    npm run build\n\
fi\n\
\n\
# Start production server\n\
exec node .output/server/index.mjs' > /usr/local/bin/start-prod.sh

RUN chmod +x /usr/local/bin/start-dev.sh /usr/local/bin/start-prod.sh

# Install netcat for backend wait script
RUN apk add --no-cache netcat-openbsd

# Expose port 3000
EXPOSE 3000

# Default to development mode
CMD ["/usr/local/bin/start-dev.sh"]
