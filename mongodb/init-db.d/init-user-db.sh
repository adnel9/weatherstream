#!/bin/bash

# Create the root user with full privileges if it doesn't exist
if ! mongosh admin --eval "db.getUser('${MONGO_INITDB_ROOT_USERNAME}')" >/dev/null 2>&1; then
    mongosh admin --eval "
        db.createUser({
            user: '${MONGO_INITDB_ROOT_USERNAME}',
            pwd: '${MONGO_INITDB_ROOT_PASSWORD}',
            roles: [{ role: 'root', db: 'admin' }]
        });
    "
fi

# Create the database (this will create it if it doesn't exist)
mongosh --eval "use ${MONGO_INITDB_DATABASE}; db.createCollection('dummyCollection');"

# Create the application user without checking if it exists
mongosh "${MONGO_INITDB_DATABASE}" --eval "
    db.createUser({
        user: '${MONGO_INITDB_DATABASE_USER}',
        pwd: '${MONGO_INITDB_DATABASE_PASSWORD}',
        roles: [
            { role: 'readWrite', db: '${MONGO_INITDB_DATABASE}' },
            { role: 'clusterMonitor', db: 'admin' }
        ]
    });
"
