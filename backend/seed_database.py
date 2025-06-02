from pymongo import MongoClient
import os

# MongoDB connection
mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(mongo_uri)
db = client['brk_sneakers']
products_collection = db['products']

# Clear existing products
products_collection.delete_many({})

# Product data
products = [
    {
        "name": "BRK Runner Pro",
        "description": "Flagship running shoe designed for comfort and speed. Breathable mesh upper, responsive foam midsole.",
        "price": 129.99,
        "currency": "€",
        "image": "product1.jpg",
        "photos": ["product1.jpg", "product1-2.jpg"],
        "category": ["sports", "men"],
        "likes": 24,
        "sizes": [38, 39, 40, 41, 42, 43, 44],
        "tags": ["running", "performance", "cushioning"]
    },
    {
        "name": "BRK Urban Street",
        "description": "Street-style sneaker for everyday comfort. Classic design meets modern comfort technology.",
        "price": 99.99,
        "currency": "€",
        "image": "product2.jpg",
        "photos": ["product2.jpg"],
        "category": ["casual", "men", "women"],
        "likes": 18,
        "sizes": [36, 37, 38, 39, 40, 41, 42, 43, 44],
        "tags": ["casual", "streetwear", "comfort"]
    },
    {
        "name": "BRK Pro Athletic",
        "description": "Professional athletic shoe for serious performance. Enhanced grip and stability.",
        "price": 159.99,
        "currency": "€",
        "image": "product3.jpg",
        "photos": ["product3.jpg"],
        "category": ["sports", "men"],
        "likes": 32,
        "sizes": [39, 40, 41, 42, 43, 44, 45],
        "tags": ["athletic", "professional", "performance"]
    },
    {
        "name": "BRK Casual Slip-On",
        "description": "Comfortable slip-on for relaxed weekends. Easy wear with premium comfort.",
        "price": 79.99,
        "currency": "€",
        "image": "product4.jpg",
        "photos": ["product4.jpg"],
        "category": ["casual", "men", "women"],
        "likes": 12,
        "sizes": [36, 37, 38, 39, 40, 41, 42, 43],
        "tags": ["casual", "slip-on", "comfort"]
    },
    {
        "name": "BRK Air Max",
        "description": "Lightweight mesh design for maximum breathability. Perfect for summer activities.",
        "price": 119.99,
        "currency": "€",
        "image": "product5.jpg",
        "photos": ["product5.jpg"],
        "category": ["sports", "men", "women"],
        "likes": 16,
        "sizes": [37, 38, 39, 40, 41, 42, 43, 44],
        "tags": ["breathable", "lightweight", "summer"]
    },
    {
        "name": "BRK Trail Master",
        "description": "Rugged outdoor shoe with superior traction. Built for adventures.",
        "price": 149.99,
        "currency": "€",
        "image": "product6.jpg",
        "photos": ["product6.jpg"],
        "category": ["sports", "men"],
        "likes": 28,
        "sizes": [39, 40, 41, 42, 43, 44, 45],
        "tags": ["trail", "outdoor", "rugged"]
    },
    {
        "name": "BRK Canvas Classic",
        "description": "Classic canvas sneaker in various colors. Timeless style for any occasion.",
        "price": 59.99,
        "currency": "€",
        "image": "product7.jpg",
        "photos": ["product7.jpg"],
        "category": ["casual", "men", "women", "kids"],
        "likes": 20,
        "sizes": [35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
        "tags": ["canvas", "classic", "versatile"]
    },
    {
        "name": "BRK Flex Trainer",
        "description": "Ultra-flexible training shoe for gym sessions. Maximum mobility and support.",
        "price": 109.99,
        "currency": "€",
        "image": "product8.jpg",
        "photos": ["product8.jpg"],
        "category": ["sports", "men", "women"],
        "likes": 15,
        "sizes": [36, 37, 38, 39, 40, 41, 42, 43, 44],
        "tags": ["training", "flexible", "gym"]
    },
    {
        "name": "BRK Kids Runner",
        "description": "Specially designed for active kids. Durable and comfortable for all-day play.",
        "price": 69.99,
        "currency": "€",
        "image": "product9.jpg",
        "photos": ["product9.jpg"],
        "category": ["kids", "sports"],
        "likes": 10,
        "sizes": [28, 29, 30, 31, 32, 33, 34, 35],
        "tags": ["kids", "durable", "comfortable"]
    },
    {
        "name": "BRK Women's Elite",
        "description": "Premium women's athletic shoe. Designed specifically for women's comfort.",
        "price": 139.99,
        "currency": "€",
        "image": "product10.jpg",
        "photos": ["product10.jpg"],
        "category": ["women", "sports"],
        "likes": 25,
        "sizes": [35, 36, 37, 38, 39, 40, 41],
        "tags": ["women", "premium", "athletic"]
    },
    {
        "name": "BRK Retro High",
        "description": "Vintage-inspired high-top sneaker. Classic style with modern comfort.",
        "price": 89.99,
        "currency": "€",
        "image": "product11.jpg",
        "photos": ["product11.jpg"],
        "category": ["sneakers", "men", "women"],
        "likes": 22,
        "sizes": [36, 37, 38, 39, 40, 41, 42, 43, 44],
        "tags": ["retro", "high-top", "vintage"]
    },
    {
        "name": "BRK Speed Lite",
        "description": "Ultra-light racing shoe. Built for speed and performance.",
        "price": 169.99,
        "currency": "€",
        "image": "product12.jpg",
        "photos": ["product12.jpg"],
        "category": ["sports", "men"],
        "likes": 30,
        "sizes": [39, 40, 41, 42, 43, 44],
        "tags": ["racing", "lightweight", "speed"]
    },
    {
        "name": "BRK Comfort Walk",
        "description": "Maximum comfort walking shoe. Perfect for long walks and standing.",
        "price": 99.99,
        "currency": "€",
        "image": "product13.jpg",
        "photos": ["product13.jpg"],
        "category": ["casual", "men", "women"],
        "likes": 19,
        "sizes": [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
        "tags": ["walking", "comfort", "cushioning"]
    },
    {
        "name": "BRK Kids Canvas",
        "description": "Colorful canvas shoes for kids. Easy to clean and maintain.",
        "price": 49.99,
        "currency": "€",
        "image": "product14.jpg",
        "photos": ["product14.jpg"],
        "category": ["kids", "casual"],
        "likes": 8,
        "sizes": [25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
        "tags": ["kids", "canvas", "colorful"]
    },
    {
        "name": "BRK Basketball Pro",
        "description": "Professional basketball shoe. Superior ankle support and court grip.",
        "price": 179.99,
        "currency": "€",
        "image": "product15.jpg",
        "photos": ["product15.jpg"],
        "category": ["sports", "men"],
        "likes": 35,
        "sizes": [40, 41, 42, 43, 44, 45, 46],
        "tags": ["basketball", "professional", "support"]
    },
    {
        "name": "BRK Yoga Flex",
        "description": "Flexible shoe perfect for yoga and pilates. Barefoot feel with protection.",
        "price": 79.99,
        "currency": "€",
        "image": "product16.jpg",
        "photos": ["product16.jpg"],
        "category": ["women", "sports"],
        "likes": 14,
        "sizes": [35, 36, 37, 38, 39, 40, 41],
        "tags": ["yoga", "flexible", "minimalist"]
    },
    {
        "name": "BRK Skate Classic",
        "description": "Durable skate shoe with enhanced grip. Built to withstand skateboarding.",
        "price": 89.99,
        "currency": "€",
        "image": "product17.jpg",
        "photos": ["product17.jpg"],
        "category": ["sneakers", "men", "casual"],
        "likes": 21,
        "sizes": [38, 39, 40, 41, 42, 43, 44, 45],
        "tags": ["skate", "durable", "grip"]
    },
    {
        "name": "BRK Women's Casual",
        "description": "Stylish casual shoe for women. Perfect for everyday wear.",
        "price": 94.99,
        "currency": "€",
        "image": "product18.jpg",
        "photos": ["product18.jpg"],
        "category": ["women", "casual"],
        "likes": 17,
        "sizes": [35, 36, 37, 38, 39, 40, 41],
        "tags": ["women", "casual", "stylish"]
    },
    {
        "name": "BRK Tennis Court",
        "description": "Professional tennis shoe. Excellent court stability and lateral support.",
        "price": 139.99,
        "currency": "€",
        "image": "product19.jpg",
        "photos": ["product19.jpg"],
        "category": ["sports", "men", "women"],
        "likes": 23,
        "sizes": [36, 37, 38, 39, 40, 41, 42, 43, 44],
        "tags": ["tennis", "court", "stability"]
    },
    {
        "name": "BRK Winter Boot",
        "description": "Warm winter sneaker boot. Insulated for cold weather comfort.",
        "price": 129.99,
        "currency": "€",
        "image": "product20.jpg",
        "photos": ["product20.jpg"],
        "category": ["casual", "men", "women"],
        "likes": 27,
        "sizes": [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
        "tags": ["winter", "warm", "insulated"]
    }
]

# Insert products
result = products_collection.insert_many(products)
print(f"Inserted {len(result.inserted_ids)} products successfully!")

# Create text index for search
products_collection.create_index([("name", "text")])
print("Created text index for product search")

# Verify
count = products_collection.count_documents({})
print(f"Total products in database: {count}")

# Show a sample product
sample = products_collection.find_one()
print(f"\nSample product:")
print(f"Name: {sample['name']}")
print(f"Price: {sample['currency']}{sample['price']}")
print(f"Likes: {sample['likes']}")