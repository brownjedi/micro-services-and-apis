#!/usr/bin/env bash
cf push ms-student-service-instance-1 -f manifest.yml
cf push ms-student-service-instance-2 -f manifest.yml
cf push ms-student-service-instance-3 -f manifest.yml
