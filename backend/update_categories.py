from pymongo import MongoClient
from bson.objectid import ObjectId

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['brk_sneakers']
products_collection = db['products']

# Step 1: Convert all single categories to arrays
print("Converting all product categories to arrays...")
result1 = products_collection.update_many(
    {"category": {"$exists": True, "$type": "string"}},
    [{"$set": {"category": ["$category"]}}]
)
print(f"Modified {result1.modified_count} documents in Step 1")

# Step 3: Update specific categories more widely
# Add "men" category to ALL products that CONTAIN sports, casual, or sneakers in their category array
print("Adding 'men' category to all sports, casual, and sneakers products...")
result2 = products_collection.update_many(
    {
        "$or": [
            {"category": {"$in": ["sports"]}},
            {"category": {"$in": ["casual"]}},
            {"category": {"$in": ["sneakers"]}}
        ]
    },
    {"$addToSet": {"category": "men"}}
)
print(f"Modified {result2.modified_count} documents in Step 3")

# Print a few examples of updated documents
print("\nExample of updated products:")
for product in products_collection.find({"category": "men"}).limit(3):
    print(f"- {product['name']}: {product['category']}")

print("\nCategory updates complete!")