### STAGE 1: Build ###
# Use Node.js as the base image
FROM node:14.19.0 AS build

# Set npm registry to default
RUN npm config set registry http://registry.npmjs.org/ 

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Expose your application port
EXPOSE 3004

# Install MongoDB
RUN apt-get update && \
    apt-get install -y mongodb && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Start MongoDB
RUN mkdir -p /data/db

# Command to start MongoDB and your Node.js application
CMD mongod & node app.js
