#!/bin/sh

echo "Building $ECR_REGISTRY/$APPLICATION_NAME:$IMAGE_TAG"
cd examples/express-app
docker build --build-arg COMMIT_SHA=$IMAGE_TAG -t $ECR_REGISTRY/$APPLICATION_NAME:$IMAGE_TAG -t $ECR_REGISTRY/$APPLICATION_NAME:latest .
docker push $ECR_REGISTRY/$APPLICATION_NAME --all-tags
echo "::set-output name=image::$ECR_REGISTRY/$APPLICATION_NAME:$IMAGE_TAG"