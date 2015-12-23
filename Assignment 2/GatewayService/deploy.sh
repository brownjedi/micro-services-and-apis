#!/usr/bin/env bash
cf push ms-api-gateway-service -f manifest.yml --no-start
cf set-env ms-api-gateway-service mongoDBURL mongodb://dondon:dondon@ds059804.mongolab.com:59804/api-gateway-service
cf start ms-api-gateway-service