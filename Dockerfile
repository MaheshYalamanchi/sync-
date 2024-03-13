### STAGE 1: Build ###
#FROM node:12.7-alpine AS build
FROM ubuntu:latest
FROM node:14.19.0 AS build

RUN npm config set registry http://registry.npmjs.org/ 
# Update package lists and install MongoDB tools
RUN  apt-get install -y mongodb-tools

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app


EXPOSE 3004

# CMD ["node","app.js"]
CMD ["node", "app.js"]