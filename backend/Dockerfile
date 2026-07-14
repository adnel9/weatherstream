# Use the official Node.js image as the base for running a Node.js application
FROM node:18-alpine

# Set the working directory within the container to /app
# This directory will be created if it doesn’t exist and used for all subsequent commands
WORKDIR /app

# Install curl and other dependencies (Alpine is minimal, so we need to add curl)
RUN apk add --no-cache curl bash

# Copy only the package files to the working directory
# This allows Docker to cache dependencies and avoid re-installing them unless these files change
COPY meteo-backend/package*.json ./

# Install the dependencies specified in package.json
# This populates the /app/node_modules directory with the required packages
RUN npm install

# Copy the entire backend source code into the container
# This includes application code, configuration files, and other assets
COPY meteo-backend/ .

# Expose port 3000, assuming the backend server listens on this port
EXPOSE 3000

# This runs the backend server using the start script defined in package.json
CMD ["npm", "start"]
