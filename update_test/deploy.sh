#!/bin/bash
#DEPRECATED
  
set -e

cd /data

./reset-env.sh
#tsc set-env.ts --environment=prod
ng build --aot=true --prod 
rm -rf /usr/share/nginx/www/* && cp -rf /data/dist/* /usr/share/nginx/www
nginx -g 'daemon off;'
  
