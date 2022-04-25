#!/bin/sh

cd $APP_PATH

if [ "$RUN_TESTS" -eq "1" ]; then
    docker build -t $APPLICATION_NAME:latest . --target test
fi

HOST_PORT="10000"

if [ ! -z "$BUILD_SCRIPT" ]; then
    $BUILD_SCRIPT
else
    docker build -t $APPLICATION_NAME:latest .
fi

if [ ! -z "$RUN_SCRIPT" ]; then
    $RUN_SCRIPT $HOST_PORT
else
    docker run -e DISABLE_LOGS=1 -d -p $HOST_PORT:$PORT $APPLICATION_NAME:latest
fi

sleep 5
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" localhost:$HOST_PORT/health)
if [ $STATUS_CODE -ne "200" ]; then echo "Healthcheck failed with code: $STATUS_CODE"; exit 1; fi
