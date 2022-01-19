#!/bin/sh

aws --no-cli-pager ecs update-service --cluster $ECS_CLUSTER --service $APPLICATION_NAME --force-new-deployment
echo "Service ${APPLICATION_NAME} on cluster ${ECS_CLUSTER} updated"