// MongoDB import script for Docker initialization
print("=== BRK Sneakers Database Import Starting ===");

// Switch to brk_sneakers database
db = db.getSiblingDB('brk_sneakers');

// Check if products collection already exists
const existingCount = db.products.countDocuments();
print(`Current products count: ${existingCount}`);

if (existingCount === 0) {
    print("No existing products found. Ready to import...");
    
    // The actual import will be handled by mongorestore in the container
    // This script just ensures the database is ready
    
    print("Database prepared for BSON import via mongorestore");
    print("Import will be handled by the container initialization process");
} else {
    print(`Database already contains ${existingCount} products`);
    print("Skipping import to avoid duplicates");
}

print("=== Import preparation completed ===");