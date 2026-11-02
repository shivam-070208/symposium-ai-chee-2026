#!/bin/bash
set -e

# ========================================================
# AI-CHHE 2026 - Email Worker EC2 Deployment Script
# Place this file on EC2 at: ~/aichee-email-worker/deploy.sh
# ========================================================

IMAGE_NAME="aichee-email-worker"
DOCKERHUB_USER="shivam070208"
APP_DIR="$HOME/aichee-email-worker"

echo "📦 Pulling latest Docker Image..."
docker pull $DOCKERHUB_USER/$IMAGE_NAME:latest

echo "🛑 Stopping existing worker container..."
OLD_CONTAINER=$(docker ps -aq --filter "name=^/${IMAGE_NAME}$")
if [ -n "$OLD_CONTAINER" ]; then
    docker stop $OLD_CONTAINER
    docker rm $OLD_CONTAINER
    echo "✅ Stopped and removed old $IMAGE_NAME container"
else
    echo "⚠️ No container currently running with name $IMAGE_NAME"
fi

echo "🚀 Starting new container..."
docker run -d \
  --name $IMAGE_NAME \
  --restart unless-stopped \
  --env-file "$APP_DIR/.env" \
  $DOCKERHUB_USER/$IMAGE_NAME:latest

echo "🔍 Showing container status:"
docker ps -a | grep $IMAGE_NAME

echo "🧹 Pruning unused Docker resources..."
docker system prune -af --volumes

echo "✨ Deployment Step Finished"
