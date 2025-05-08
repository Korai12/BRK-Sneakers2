from pymongo import MongoClient
import random

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['brk_sneakers']
products_collection = db['products']

# Clear existing products
products_collection.delete_many({})

# Sample product data
products = [
    {
        "name": "BRK Runner",
        "description": "Lightweight running shoe with responsive cushioning for maximum comfort on long runs.",
        "category": "sports",
        "price": 129.99,
        "image": "product1.jpg",
        "likes": random.randint(10, 50),
        "colors": ["blue", "red", "black"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["running", "cushioning", "lightweight"]
    },
    {
        "name": "BRK Urban",
        "description": "Street-style sneaker for everyday comfort and fashion-forward looks.",
        "category": "casual",
        "price": 99.99,
        "image": "product2.jpg",
        "likes": random.randint(10, 50),
        "colors": ["white", "gray", "black"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["street", "fashion", "everyday"]
    },
    {
        "name": "BRK Pro",
        "description": "Professional athletic shoe for serious performance and endurance training.",
        "category": "sports",
        "price": 159.99,
        "image": "product3.jpg",
        "likes": random.randint(10, 50),
        "colors": ["blue", "green", "black"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["professional", "training", "performance"]
    },
    {
        "name": "BRK Casual",
        "description": "Comfortable slip-on for relaxed weekends and casual outings.",
        "category": "casual",
        "price": 79.99,
        "image": "product4.jpg",
        "likes": random.randint(10, 50),
        "colors": ["brown", "navy", "black"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["slip-on", "comfort", "weekend"]
    },
    {
        "name": "BRK Air",
        "description": "Lightweight mesh design for maximum breathability in hot weather.",
        "category": "sneakers",
        "price": 119.99,
        "image": "product5.jpg",
        "likes": random.randint(10, 50),
        "colors": ["blue", "white", "gray"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["breathable", "lightweight", "summer"]
    },
    {
        "name": "BRK Trail",
        "description": "Rugged outdoor shoe with superior traction for hiking and trail running.",
        "category": "sports",
        "price": 149.99,
        "image": "product6.jpg",
        "likes": random.randint(10, 50),
        "colors": ["green", "brown", "gray"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["hiking", "trail", "outdoor"]
    },
    {
        "name": "BRK Canvas",
        "description": "Classic canvas sneaker available in various colors for versatile styling.",
        "category": "casual",
        "price": 59.99,
        "image": "product7.jpg",
        "likes": random.randint(10, 50),
        "colors": ["red", "blue", "black", "white"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["canvas", "classic", "colorful"]
    },
    {
        "name": "BRK Flex",
        "description": "Ultra-flexible training shoe for gym sessions and cross-training.",
        "category": "sports",
        "price": 109.99,
        "image": "product8.jpg",
        "likes": random.randint(10, 50),
        "colors": ["black", "gray", "blue"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["training", "flexible", "gym"]
    },
    {
        "name": "BRK Elite",
        "description": "Premium performance shoe with advanced cushioning and support.",
        "category": "sports",
        "price": 179.99,
        "image": "product9.jpg",
        "likes": random.randint(10, 50),
        "colors": ["black", "silver", "gold"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["premium", "cushioning", "support"]
    },
    {
        "name": "BRK Lite",
        "description": "Super lightweight shoe for speed training and race day.",
        "category": "sports",
        "price": 139.99,
        "image": "product10.jpg",
        "likes": random.randint(10, 50),
        "colors": ["yellow", "blue", "black"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["lightweight", "racing", "speed"]
    },
    {
        "name": "BRK Retro",
        "description": "Vintage-inspired sneaker with modern comfort technology.",
        "category": "sneakers",
        "price": 99.99,
        "image": "product11.jpg",
        "likes": random.randint(10, 50),
        "colors": ["white", "red", "blue"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["retro", "vintage", "classic"]
    },
    {
        "name": "BRK Slip",
        "description": "Easy slip-on shoe for effortless style and comfort.",
        "category": "casual",
        "price": 69.99,
        "image": "product12.jpg",
        "likes": random.randint(10, 50),
        "colors": ["black", "white", "gray"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["slip-on", "easy", "comfort"]
    },
    {
        "name": "BRK Hike",
        "description": "Waterproof hiking boot for all-terrain adventures.",
        "category": "sports",
        "price": 169.99,
        "image": "product13.jpg",
        "likes": random.randint(10, 50),
        "colors": ["brown", "green", "black"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["hiking", "waterproof", "boot"]
    },
    {
        "name": "BRK Glide",
        "description": "Smooth, cushioned shoe for long-distance running comfort.",
        "category": "sports",
        "price": 134.99,
        "image": "product14.jpg",
        "likes": random.randint(10, 50),
        "colors": ["blue", "orange", "black"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["running", "cushioned", "long-distance"]
    },
    {
        "name": "BRK Swift",
        "description": "Responsive and lightweight shoe designed for speed and agility.",
        "category": "sports",
        "price": 124.99,
        "image": "product15.jpg",
        "likes": random.randint(10, 50),
        "colors": ["red", "black", "white"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["speed", "agility", "lightweight"]
    },
    {
        "name": "BRK Women's Active",
        "description": "Performance shoe designed specifically for women's feet.",
        "category": "women",
        "price": 119.99,
        "image": "product16.jpg",
        "likes": random.randint(10, 50),
        "colors": ["pink", "purple", "white"],
        "sizes": [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9],
        "tags": ["women", "active", "performance"]
    },
    {
        "name": "BRK Kids Sport",
        "description": "Durable and comfortable sports shoe for active kids.",
        "category": "kids",
        "price": 69.99,
        "image": "product17.jpg",
        "likes": random.randint(10, 50),
        "colors": ["blue", "red", "green"],
        "sizes": [3, 3.5, 4, 4.5, 5, 5.5, 6],
        "tags": ["kids", "sport", "durable"]
    },
    {
        "name": "BRK Boost",
        "description": "Energy-returning cushioning for a responsive and bouncy feel.",
        "category": "sports",
        "price": 149.99,
        "image": "product18.jpg",
        "likes": random.randint(10, 50),
        "colors": ["black", "orange", "blue"],
        "sizes": [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        "tags": ["cushioning", "energy", "responsive"]
    },
    {
        "name": "BRK Women's Casual",
        "description": "Stylish and comfortable everyday shoe for women.",
        "category": "women",
        "price": 89.99,
        "image": "product19.jpg",
        "likes": random.randint(10, 50),
        "colors": ["white", "beige", "black"],
        "sizes": [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9],
        "tags": ["women", "casual", "everyday"]
    },
    {
        "name": "BRK Kids Casual",
        "description": "Fun and comfortable shoes for everyday wear for children.",
        "category": "kids",
        "price": 59.99,
        "image": "product20.jpg",
        "likes": random.randint(10, 50),
        "colors": ["blue", "pink", "green"],
        "sizes": [3, 3.5, 4, 4.5, 5, 5.5, 6],
        "tags": ["kids", "casual", "comfortable"]
    }
]

# Insert products into the database
products_collection.insert_many(products)

print(f"Database seeded with {len(products)} products.")