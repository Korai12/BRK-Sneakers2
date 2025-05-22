#!/bin/bash
set -e

echo "=== Starting MongoDB Data Restoration ==="

# Wait for MongoDB to be fully ready
echo "Waiting for MongoDB to start..."
until mongosh --quiet --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
    sleep 2
    echo "Still waiting for MongoDB..."
done

echo "MongoDB is ready!"

# Check if data already exists
EXISTING_COUNT=$(mongosh brk_sneakers --quiet --eval "db.products.countDocuments()" 2>/dev/null || echo "0")
echo "Current products count: $EXISTING_COUNT"

if [ "$EXISTING_COUNT" = "0" ]; then
    echo "No existing data found. Starting import..."
    
    # Restore the BSON data
    if [ -d "/docker-entrypoint-initdb.d/brk_sneakers" ]; then
        echo "Found BSON data directory, importing..."
        mongorestore --db brk_sneakers /docker-entrypoint-initdb.d/brk_sneakers
        
        # Verify the import
        NEW_COUNT=$(mongosh brk_sneakers --quiet --eval "db.products.countDocuments()")
        echo "Import completed! Products imported: $NEW_COUNT"
        
        # Show a sample product
        echo "Sample product:"
        mongosh brk_sneakers --quiet --eval "JSON.stringify(db.products.findOne(), null, 2)"
    else
        echo "ERROR: No BSON data directory found at /docker-entrypoint-initdb.d/brk_sneakers"
        exit 1
    fi
else
    echo "Data already exists ($EXISTING_COUNT products). Skipping import."
fi

echo "=== Data restoration completed ==="