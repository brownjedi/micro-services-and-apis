#!/usr/bin/env bash
cf push ms-student-service-instance-1 -f manifest.yml --no-start
cf push ms-student-service-instance-2 -f manifest.yml --no-start
cf push ms-student-service-instance-3 -f manifest.yml --no-start

cf set-env ms-student-service-instance-1 mongoDBURL mongodb://dondon:dondon@ds039404.mongolab.com:39404/student-service-1
cf set-env ms-student-service-instance-2 mongoDBURL mongodb://dondon:dondon@ds057934.mongolab.com:57934/student-service-2
cf set-env ms-student-service-instance-3 mongoDBURL mongodb://dondon:dondon@ds057234.mongolab.com:57234/student-service-3

cf start ms-student-service-instance-1
cf start ms-student-service-instance-2
cf start ms-student-service-instance-3