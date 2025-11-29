#!/bin/bash
set -e # error 시 즉시 종료

ECR_REGISTRY=586421527844.dkr.ecr.ap-northeast-2.amazonaws.com
echo "[deploy.sh] start"

APP_DIR="$HOME/dorandoran-fe"

cd "$APP_DIR"

echo "[deploy.sh] ECR login"
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin $ECR_REGISTRY

docker compose pull
docker compose up -d

echo "[deploy.sh] done"