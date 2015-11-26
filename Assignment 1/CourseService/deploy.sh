#!/usr/bin/env bash
cf push ms-course-service -f manifest.yml --no-start
cf set-env ms-course-service mongoDBURL mongodb://dondon:dondon@ds039404.mongolab.com:39404/course-service-1
cf start ms-course-service
