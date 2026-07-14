# Use the official lightweight Node.js image (Alpine Linux-based) as the base image
# Node version 18 is specified to ensure compatibility with the app
FROM node:18-alpine

# Set the working directory within the container to /app
# All subsequent commands will be run from this directory
WORKDIR /app

# Copy only the package files to the container
# This is done first to optimize build caching for npm install
# If only source code changes, Docker will cache this step and reuse npm install
COPY meteo-frontend/package*.json ./

# Install the dependencies as specified in package.json
# This runs npm install to download all necessary packages into /app/node_modules
RUN npm install

# Copy the entire frontend project directory into the container
# This includes all application code and assets
COPY meteo-frontend/ .

# Expose port 5173 to allow access to the Vite development server
# This is the default port for Vite, but it can be configured if needed
EXPOSE 5173

# Set the default command to run the Vite development server
# This will start the frontend application in development mode
# the -- host is for Dev mod only, allowing the server to listen
# on all interfaces !!!! MUST CHANGE IT FOR PRODUCTION !!!
CMD ["npm", "run", "dev", "--", "--host"]
