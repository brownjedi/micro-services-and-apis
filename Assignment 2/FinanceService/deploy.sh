#!/usr/bin/env bash
cf push ms-finance-service -f manifest.yml --no-start
cf set-env ms-finance-service mongoDBURL mongodb://dondon:dondon@ds029595.mongolab.com:29595/finance-service
cf start ms-finance-service
