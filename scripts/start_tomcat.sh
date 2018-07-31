#!/bin/bash

cp ~ubuntu/portal/target/geoscience-portal.war /var/lib/tomcat8/webapps/ROOT.war
service tomcat8 start
