#!/bin/bash

# Start ClickHouse for graph.org.ai data ingestion

set -e

echo "🚀 Starting ClickHouse server..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if container already exists
if docker ps -a | grep -q clickhouse-server; then
    echo "📦 ClickHouse container already exists"

    # Check if it's running
    if docker ps | grep -q clickhouse-server; then
        echo "✅ ClickHouse is already running"
    else
        echo "🔄 Starting existing ClickHouse container..."
        docker start clickhouse-server
        echo "✅ ClickHouse started"
    fi
else
    echo "📥 Creating new ClickHouse container..."
    docker run -d \
      --name clickhouse-server \
      -p 8123:8123 \
      -p 9000:9000 \
      -v clickhouse_data:/var/lib/clickhouse \
      -v clickhouse_logs:/var/log/clickhouse-server \
      --ulimit nofile=262144:262144 \
      clickhouse/clickhouse-server

    echo "⏳ Waiting for ClickHouse to be ready..."
    sleep 5
fi

# Wait for ClickHouse to be ready
echo "🔍 Checking ClickHouse health..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8123/ping > /dev/null 2>&1; then
        echo "✅ ClickHouse is ready!"
        break
    fi

    attempt=$((attempt + 1))
    echo "⏳ Waiting for ClickHouse... ($attempt/$max_attempts)"
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ ClickHouse failed to start"
    exit 1
fi

# Show connection info
echo ""
echo "📊 ClickHouse Connection Info:"
echo "  HTTP:   http://localhost:8123"
echo "  Native: localhost:9000"
echo ""
echo "🔧 Useful Commands:"
echo "  Connect to client:  docker exec -it clickhouse-server clickhouse-client"
echo "  View logs:          docker logs -f clickhouse-server"
echo "  Stop server:        docker stop clickhouse-server"
echo "  Remove container:   docker rm clickhouse-server"
echo ""
echo "📝 To run Wikidata ingestion:"
echo "  docker exec -i clickhouse-server clickhouse-client < .scripts/ingest-wikidata.sql"
echo ""
