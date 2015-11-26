#!/usr/bin/env bash
cf push ms-eventhub-service -f manifest.yml --no-start
cf set-env ms-eventhub-service mongoDBURL mongodb://dondon:dondon@ds039404.mongolab.com:39404/event-hub
cf start ms-eventhub-service