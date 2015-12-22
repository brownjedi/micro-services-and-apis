#!/usr/bin/env bash
cf push ms-k12-service -f manifest.yml --no-start
cf set-env ms-k12-service AWS_ACCESS_KEY_ID <AWS_ACCESS_KEY_ID>
cf set-env ms-k12-service AWS_SECRET_ACCESS_KEY <AWS_SECRET_ACCESS_KEY>
cf set-env ms-k12-service AWS_REGION <AWS_REGION>
cf start ms-k12-service
