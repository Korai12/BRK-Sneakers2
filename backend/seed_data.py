from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['brk_sneakers']
products_collection = db['products']

# Clear previous data
products_collection.delete_many({})

products = [
    {
        "name": "BRK Runner",
        "description": "Flagship running shoe designed for comfort and speed.",
        "details": (
            "Breathable mesh upper, responsive foam midsole, 8mm drop for natural movement. "
            "Durable rubber outsole for excellent grip on all surfaces. Ideal for daily runs and races."
        ),
        "features": [
            "Mesh upper for maximum airflow",
            "Lightweight design (270g EUR 43)",
            "Responsive cushioning",
            "8mm heel-to-toe drop",
            "High-grip rubber outsole"
        ],
        "specs": {
            "Material": "Synthetic mesh upper, rubber outsole",
            "Weight": "270g (EUR 43)",
            "Drop": "8mm",
            "Cushioning": "Responsive foam"
        },
        "category": "sports",
        "price": 119.99,
        "currency": "EUR",
        "image": "product1.jpg",
        "photos": ["product1.jpg", "product1-2.jpg", "product1-3.jpg"],
        "likes": 0,
        "sizes": [39, 40, 41, 42, 43, 44, 45],
        "tags": ["running", "cushioning", "lightweight"]
    },
    {
        "name": "BRK Urban",
        "description": "Street-style sneaker for everyday comfort and style.",
        "details": (
            "Premium canvas upper, classic rubber sole, padded collar. "
            "Perfect for city walks and casual outings."
        ),
        "features": [
            "Durable canvas",
            "Flexible rubber sole",
            "Padded collar",
            "Timeless design"
        ],
        "specs": {
            "Material": "Canvas, rubber",
            "Weight": "320g (EUR 42)",
            "Cushioning": "Foam insole"
        },
        "category": "casual",
        "price": 84.90,
        "currency": "EUR",
        "image": "product2.jpg",
        "photos": ["product2.jpg", "product2-2.jpg"],
        "likes": 0,
        "sizes": [38, 39, 40, 41, 42, 43, 44],
        "tags": ["street", "fashion", "everyday"]
    },
    {
        "name": "BRK Pro",
        "description": "Performance athletic shoe for serious training.",
        "details": (
            "Engineered mesh, stabilizing overlays, high-rebound midsole foam. "
            "Ideal for interval and tempo workouts."
        ),
        "features": [
            "Lightweight support",
            "High energy return",
            "Stabilizing overlays",
            "Designed for high intensity"
        ],
        "specs": {
            "Material": "Mesh, TPU, rubber",
            "Weight": "255g (EUR 44)",
            "Drop": "6mm",
            "Support": "Medium"
        },
        "category": "sports",
        "price": 139.00,
        "currency": "EUR",
        "image": "product3.jpg",
        "photos": ["product3.jpg", "product3-2.jpg", "product3-3.jpg"],
        "likes": 0,
        "sizes": [40, 41, 42, 43, 44, 45],
        "tags": ["professional", "training", "performance"]
    },
    {
        "name": "BRK Casual",
        "description": "Slip-on shoe for relaxed weekends and casual style.",
        "details": (
            "Soft textile upper, elastic side panels, ultra-flexible sole. "
            "Easy on, easy off—great for any relaxed day."
        ),
        "features": [
            "Slip-on comfort",
            "Flexible outsole",
            "Low-weight (210g EUR 41)",
            "Weekend ready"
        ],
        "specs": {
            "Material": "Textile, synthetic sole",
            "Weight": "210g (EUR 41)",
            "Closure": "Slip-on"
        },
        "category": "casual",
        "price": 59.90,
        "currency": "EUR",
        "image": "product4.jpg",
        "photos": ["product4.jpg", "product4-2.jpg"],
        "likes": 0,
        "sizes": [38, 39, 40, 41, 42],
        "tags": ["slip-on", "comfort", "weekend"]
    },
    {
        "name": "BRK Air",
        "description": "Ultra-breathable sneaker for hot weather and summer adventures.",
        "details": (
            "Lightweight mesh upper, featherweight EVA sole, available in cool summer colors. "
            "Perfect for travel and long walks."
        ),
        "features": [
            "Air mesh for ventilation",
            "Featherweight design",
            "Summer style colors"
        ],
        "specs": {
            "Material": "Mesh, EVA",
            "Weight": "215g (EUR 42)",
            "Cushioning": "Basic"
        },
        "category": "sneakers",
        "price": 72.50,
        "currency": "EUR",
        "image": "product5.jpg",
        "photos": ["product5.jpg", "product5-2.jpg"],
        "likes": 0,
        "sizes": [39, 40, 41, 42, 43],
        "tags": ["breathable", "lightweight", "summer"]
    },
    {
        "name": "BRK Trail",
        "description": "Outdoor shoe with rugged sole for hiking and trail running.",
        "details": (
            "Reinforced toe cap, aggressive outsole lugs, waterproof upper. "
            "Provides secure footing even in rough terrain."
        ),
        "features": [
            "Aggressive grip outsole",
            "Waterproof upper",
            "Rugged design",
            "Toe protection"
        ],
        "specs": {
            "Material": "Synthetic, rubber",
            "Weight": "330g (EUR 44)",
            "Waterproof": "Yes"
        },
        "category": "sports",
        "price": 109.00,
        "currency": "EUR",
        "image": "product6.jpg",
        "photos": ["product6.jpg"],
        "likes": 0,
        "sizes": [41, 42, 43, 44, 45],
        "tags": ["hiking", "trail", "outdoor"]
    },
    {
        "name": "BRK Canvas",
        "description": "Classic canvas sneaker in versatile colors.",
        "details": (
            "Canvas upper, vulcanized rubber sole, classic lace-up style. "
            "Ideal for everyday use."
        ),
        "features": [
            "Canvas upper",
            "Vulcanized sole",
            "Multiple color options"
        ],
        "specs": {
            "Material": "Canvas, rubber",
            "Weight": "280g (EUR 42)"
        },
        "category": "casual",
        "price": 44.99,
        "currency": "EUR",
        "image": "product7.jpg",
        "photos": ["product7.jpg"],
        "likes": 0,
        "sizes": [38, 39, 40, 41, 42, 43],
        "tags": ["canvas", "classic", "colorful"]
    },
    {
        "name": "BRK Flex",
        "description": "Ultra-flexible training shoe for gym and cross-training.",
        "details": (
            "Stretch-knit upper, grippy sole, sock-like fit. "
            "Perfect for dynamic movement."
        ),
        "features": [
            "Stretch-knit upper",
            "Flexible sole",
            "Gym ready"
        ],
        "specs": {
            "Material": "Knit, rubber",
            "Weight": "235g (EUR 42)"
        },
        "category": "sports",
        "price": 97.00,
        "currency": "EUR",
        "image": "product8.jpg",
        "photos": ["product8.jpg", "product8-2.jpg"],
        "likes": 0,
        "sizes": [39, 40, 41, 42, 43, 44],
        "tags": ["training", "flexible", "gym"]
    },
    {
        "name": "BRK Elite",
        "description": "Premium running shoe with advanced support and cushioning.",
        "details": (
            "Reinforced heel, multi-layer midsole, shock absorption for high-mileage runners."
        ),
        "features": [
            "Reinforced heel",
            "Advanced cushioning",
            "Supportive midsole"
        ],
        "specs": {
            "Material": "Synthetic, rubber",
            "Weight": "310g (EUR 44)"
        },
        "category": "sports",
        "price": 169.99,
        "currency": "EUR",
        "image": "product9.jpg",
        "photos": ["product9.jpg"],
        "likes": 0,
        "sizes": [41, 42, 43, 44, 45],
        "tags": ["premium", "cushioning", "support"]
    },
    {
        "name": "BRK Lite",
        "description": "Super lightweight shoe for speed training and race day.",
        "details": (
            "Ultra-light mesh upper, race-tuned sole, minimalist support for fast runs."
        ),
        "features": [
            "Ultra-light mesh",
            "Minimalist support",
            "Speed tuned"
        ],
        "specs": {
            "Material": "Mesh, synthetic sole",
            "Weight": "195g (EUR 42)"
        },
        "category": "sports",
        "price": 112.00,
        "currency": "EUR",
        "image": "product10.jpg",
        "photos": ["product10.jpg"],
        "likes": 0,
        "sizes": [40, 41, 42, 43, 44],
        "tags": ["lightweight", "racing", "speed"]
    },
    {
        "name": "BRK Retro",
        "description": "Vintage-inspired sneaker with modern comfort.",
        "details": (
            "Classic suede and nylon mix, foam cushioning, old-school design."
        ),
        "features": [
            "Retro look",
            "Foam midsole",
            "Modern comfort"
        ],
        "specs": {
            "Material": "Suede, nylon, rubber",
            "Weight": "290g (EUR 42)"
        },
        "category": "sneakers",
        "price": 89.00,
        "currency": "EUR",
        "image": "product11.jpg",
        "photos": ["product11.jpg", "product11-2.jpg"],
        "likes": 0,
        "sizes": [39, 40, 41, 42, 43],
        "tags": ["retro", "vintage", "classic"]
    },
    {
        "name": "BRK Slip",
        "description": "Easy slip-on for effortless daily style and comfort.",
        "details": (
            "Elastic side gores, breathable lining, low-profile sole."
        ),
        "features": [
            "Slip-on entry",
            "Breathable lining",
            "Lightweight"
        ],
        "specs": {
            "Material": "Textile, rubber",
            "Weight": "205g (EUR 41)"
        },
        "category": "casual",
        "price": 42.90,
        "currency": "EUR",
        "image": "product12.jpg",
        "photos": ["product12.jpg"],
        "likes": 0,
        "sizes": [38, 39, 40, 41, 42, 43],
        "tags": ["slip-on", "easy", "comfort"]
    },
    {
        "name": "BRK Hike",
        "description": "Waterproof hiking boot for adventurous trails.",
        "details": (
            "Waterproof construction, deep-lug sole, padded ankle support."
        ),
        "features": [
            "Waterproof membrane",
            "Deep-lug outsole",
            "Ankle support"
        ],
        "specs": {
            "Material": "Leather, synthetic, rubber",
            "Weight": "420g (EUR 44)"
        },
        "category": "sports",
        "price": 144.00,
        "currency": "EUR",
        "image": "product13.jpg",
        "photos": ["product13.jpg", "product13-2.jpg"],
        "likes": 0,
        "sizes": [40, 41, 42, 43, 44, 45],
        "tags": ["hiking", "waterproof", "boot"]
    },
    {
        "name": "BRK Glide",
        "description": "Smooth, cushioned shoe for long-distance running comfort.",
        "details": (
            "Seamless mesh upper, plush foam, 10mm drop for endurance runners."
        ),
        "features": [
            "Plush foam",
            "10mm drop",
            "Smooth ride"
        ],
        "specs": {
            "Material": "Mesh, synthetic sole",
            "Weight": "265g (EUR 43)"
        },
        "category": "sports",
        "price": 98.00,
        "currency": "EUR",
        "image": "product14.jpg",
        "photos": ["product14.jpg"],
        "likes": 0,
        "sizes": [40, 41, 42, 43, 44],
        "tags": ["running", "cushioned", "long-distance"]
    },
    {
        "name": "BRK Swift",
        "description": "Responsive lightweight shoe for speed and agility.",
        "details": (
            "Mesh upper, EVA midsole, flexible forefoot for dynamic moves."
        ),
        "features": [
            "Flexible forefoot",
            "Agile design",
            "Lightweight"
        ],
        "specs": {
            "Material": "Mesh, EVA",
            "Weight": "220g (EUR 42)"
        },
        "category": "sports",
        "price": 99.00,
        "currency": "EUR",
        "image": "product15.jpg",
        "photos": ["product15.jpg"],
        "likes": 0,
        "sizes": [39, 40, 41, 42, 43, 44],
        "tags": ["speed", "agility", "lightweight"]
    },
    {
        "name": "BRK Women's Active",
        "description": "Performance shoe designed for women’s feet and style.",
        "details": (
            "Contoured last, lightweight mesh, extra arch support."
        ),
        "features": [
            "Women's specific fit",
            "Lightweight mesh",
            "Extra arch support"
        ],
        "specs": {
            "Material": "Mesh, synthetic sole",
            "Weight": "195g (EUR 39)"
        },
        "category": "women",
        "price": 109.90,
        "currency": "EUR",
        "image": "product16.jpg",
        "photos": ["product16.jpg"],
        "likes": 0,
        "sizes": [36, 37, 38, 39, 40, 41],
        "tags": ["women", "active", "performance"]
    },
    {
        "name": "BRK Kids Sport",
        "description": "Durable sports shoe for active kids.",
        "details": (
            "Reinforced toe, non-marking sole, fun colors. Made for school and play."
        ),
        "features": [
            "Reinforced toe",
            "Non-marking sole",
            "Fun colors"
        ],
        "specs": {
            "Material": "Synthetic, rubber",
            "Weight": "160g (EUR 35)"
        },
        "category": "kids",
        "price": 47.90,
        "currency": "EUR",
        "image": "product17.jpg",
        "photos": ["product17.jpg"],
        "likes": 0,
        "sizes": [31, 32, 33, 34, 35, 36, 37],
        "tags": ["kids", "sport", "durable"]
    },
    {
        "name": "BRK Boost",
        "description": "Energy-return cushioning for a responsive, bouncy feel.",
        "details": (
            "Springy midsole, impact-absorbing heel, modern styling."
        ),
        "features": [
            "Springy midsole",
            "Impact absorbing",
            "Modern style"
        ],
        "specs": {
            "Material": "Mesh, synthetic sole",
            "Weight": "250g (EUR 43)"
        },
        "category": "sports",
        "price": 112.90,
        "currency": "EUR",
        "image": "product18.jpg",
        "photos": ["product18.jpg"],
        "likes": 0,
        "sizes": [39, 40, 41, 42, 43, 44, 45],
        "tags": ["cushioning", "energy", "responsive"]
    },
    {
        "name": "BRK Women's Casual",
        "description": "Stylish everyday shoe for women, easy to match with any outfit.",
        "details": (
            "Soft upper, feminine design, versatile color options."
        ),
        "features": [
            "Feminine design",
            "Soft upper",
            "All-day comfort"
        ],
        "specs": {
            "Material": "Synthetic, textile",
            "Weight": "170g (EUR 38)"
        },
        "category": "women",
        "price": 58.50,
        "currency": "EUR",
        "image": "product19.jpg",
        "photos": ["product19.jpg"],
        "likes": 0,
        "sizes": [36, 37, 38, 39, 40, 41],
        "tags": ["women", "casual", "everyday"]
    },
    {
        "name": "BRK Kids Casual",
        "description": "Comfortable, fun shoes for kids' everyday wear.",
        "details": (
            "Colorful uppers, easy Velcro closure, cushioned insole."
        ),
        "features": [
            "Colorful design",
            "Velcro closure",
            "Cushioned insole"
        ],
        "specs": {
            "Material": "Synthetic, textile",
            "Weight": "145g (EUR 34)"
        },
        "category": "kids",
        "price": 39.99,
        "currency": "EUR",
        "image": "product20.jpg",
        "photos": ["product20.jpg"],
        "likes": 0,
        "sizes": [29, 30, 31, 32, 33, 34, 35],
        "tags": ["kids", "casual", "comfortable"]
    }
]

products_collection.insert_many(products)
print(f"Database seeded with {len(products)} products (with unique details and EUR sizes).")
