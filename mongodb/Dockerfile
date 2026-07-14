# Use the official MongoDB image as the base
FROM mongo:latest

# Expose the default MongoDB port
EXPOSE 27017

# Copy initialization scripts
COPY ./init-db.d/ /docker-entrypoint-initdb.d/

# Make the shell script executable
RUN chmod +x /docker-entrypoint-initdb.d/init-user-db.sh

# Default command (handled by the mongo image)
CMD ["mongod", "--bind_ip_all"]
