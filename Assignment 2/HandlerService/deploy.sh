#!/usr/bin/env bash
cf push ms-handler-service-k12 -f manifest.yml --no-start
cf set-env ms-handler-service-k12 mongoDBURL <MongoDBURL>
cf set-env ms-handler-service-k12 queueUrl <QueueURL>
cf set-env ms-handler-service-k12 AWS_ACCESS_KEY_ID <AWS_ACCESS_KEY_ID>
cf set-env ms-handler-service-k12 AWS_SECRET_ACCESS_KEY <AWS_SECRET_ACCESS_KEY>
cf set-env ms-handler-service-k12 AWS_REGION <AWS_REGION>
cf start ms-handler-service-k12