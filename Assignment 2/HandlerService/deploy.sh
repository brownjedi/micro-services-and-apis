#!/usr/bin/env bash
cf push ms-handler-service-course -f manifest.yml --no-start
cf push ms-handler-service-student -f manifest.yml --no-start

cf set-env ms-handler-service-course mongoDBURL mongodb://dondon:dondon@ds041404.mongolab.com:41404/course-handler-service
cf set-env ms-handler-service-student mongoDBURL mongodb://dondon:dondon@ds059654.mongolab.com:59654/student-handler-service

cf start ms-handler-service-course
cf start ms-handler-service-student