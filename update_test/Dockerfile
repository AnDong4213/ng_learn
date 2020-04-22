FROM registry-pub.appadhoc.com:30443/frontbasenew:latest

ARG ENV=production

RUN echo $ENV

RUN apt-get install -y expect

COPY ./package.json /data/package.json
COPY ./npm-install.sh /data/npm-install.sh

RUN cd /data && ./npm-install.sh && npm update -g npm
RUN cd /data && npm install --unsafe-perm --ignore-scripts --no-optional
RUN cd /data && npm install node-sass
RUN cd /data && npm install lodash.assign

COPY . /data

RUN cd /data && ng build --aot=true --prod --configuration=$ENV
RUN cp -rf /data/dist/* /var/www/html 

CMD ["nginx", "-g", "daemon off;"]
