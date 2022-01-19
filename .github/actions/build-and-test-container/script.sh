#!/bin/sh
if [[ "$RUN_TESTS" -eq "1" ]]; then
    docker build -t $APPLICATION_NAME:latest . --target test
fi

HOST_PORT="10000"

docker build -t $APPLICATION_NAME:latest .
docker run -e DISABLE_LOGS=1 -d -p $HOST_PORT:$PORT $APPLICATION_NAME:latest

sleep 5
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" localhost:$HOST_PORT/health)
if [ $STATUS_CODE -ne "200" ]; then echo "Healthcheck failed with code: $STATUS_CODE"; exit 1; fi
