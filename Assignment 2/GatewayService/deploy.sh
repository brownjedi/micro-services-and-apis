#!/usr/bin/env bash
cf push ms-api-gateway-service -f manifest.yml --no-start
cf set-env ms-api-gateway-service mongoDBURL <MongoDBURL>
cf set-env ms-api-gateway-service AWS_ACCESS_KEY_ID <AWS_ACCESS_KEY_ID>
cf set-env ms-api-gateway-service AWS_SECRET_ACCESS_KEY <AWS_SECRET_ACCESS_KEY>
cf set-env ms-api-gateway-service AWS_REGION <AWS_REGION>
cf start ms-api-gateway-service