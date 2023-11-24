#!/bin/bash

if [[ ! " prod staging " =~ " $1 " ]]; then
  echo "Please provide environment to use: prod or staging"
  exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_DEFAULT_REGION="us-east-1"
REPOS=( "graduatenu-rails" "graduatenu-node" )
CURRENT_HASH=$(git ls-remote https://github.com/sandboxnu/graduatenu.git main | awk '{ print $1 }')
ECS_CLUSTER="$1-graduatenu"
TASK_FAMILIES=( "${ECS_CLUSTER}-api" "${ECS_CLUSTER}-web" )
SERVICES=( "${ECS_CLUSTER}-api" "${ECS_CLUSTER}-web" )

INDEXES=(0 1)

if [[ "frontend" = $2 ]]; then
  echo "INFO: Deploying frontend only."
  INDEXES=(1)
fi

if [[ "backend" = $2 ]]; then
  echo "INFO: Deploying backend only."
  INDEXES=(0)
fi

if [[ "current" = $3 ]]; then
  echo "INFO: Using current hash!"
  CURRENT_HASH=$(git rev-parse HEAD)
fi

# Disable aws from sending stdout to less
export AWS_PAGER=""

echo "Redeploying services for cluster: ${ECS_CLUSTER} with last pushed image"


for ii in "${!INDEXES[@]}"; do
    echo "Deploying ${INDEXES[ii]}..."
    i=${INDEXES[ii]}
    # Last pushed image should always be tagged with the latest commit hash on main 
    ECR_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${REPOS[$i]}:${CURRENT_HASH}"
    TASK_FAMILY="${TASK_FAMILIES[$i]}"
    SERVICE="${SERVICES[$i]}"
    # fetch template for task definition 
    TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition "$TASK_FAMILY" --region "$AWS_DEFAULT_REGION")
    # update the template's image to use the latest ECR_IMAGE
    NEW_TASK_DEFINTIION=$(echo $TASK_DEFINITION | jq --arg IMAGE "$ECR_IMAGE" '.taskDefinition | .containerDefinitions[0].image = $IMAGE | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)')
    # register the new revision for the task definition 
    NEW_TASK_INFO=$(aws ecs register-task-definition --region "$AWS_DEFAULT_REGION" --cli-input-json "$NEW_TASK_DEFINTIION")
    NEW_REVISION=$(echo $NEW_TASK_INFO | jq '.taskDefinition.revision')
    # update the service to replace tasks with the latest revision using the latest image
    aws ecs update-service --cluster ${ECS_CLUSTER} \
                        --service ${SERVICE} \
                        --task-definition ${TASK_FAMILY}:${NEW_REVISION}
done

echo "Check AWS Console for logs"