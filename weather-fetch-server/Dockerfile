# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install curl and other dependencies (Alpine is minimal, so we need to add curl)
RUN apk add --no-cache curl bash

# Copy package.json and package-lock.json to the container
COPY meteo-weather-fetch/package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY meteo-weather-fetch/ .

# Expose the port the app runs on (e.g., 3001)
EXPOSE 3001

# Define the command to run the server
CMD ["node", "fetch-weather-server.js"]
