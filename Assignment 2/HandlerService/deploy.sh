#!/usr/bin/env bash
cf push ms-handler-service-finance -f manifest.yml --no-start

cf set-env ms-handler-service-finance mongoDBURL mongodb://dondon:dondon@ds027335.mongolab.com:27335/finance-handler-service

cf start ms-handler-service-finance