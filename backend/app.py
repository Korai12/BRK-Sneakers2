from flask import Flask, jsonify, request, send_from_directory
# Fix for the flask_cors import
try:
    from flask_cors import CORS
except ImportError:
    # If flask_cors is not available, use a placeholder
    class CORS:
        def __init__(self, app, **kwargs):
            print("Warning: flask_cors is not installed. CORS will not be enabled.")
            pass

import json
import os
from bson.objectid import ObjectId  # Updated import
from pymongo import MongoClient

# MongoDB connection with correct port
client = MongoClient('mongodb://localhost:27017/')
db = client['brk_sneakers']
products_collection = db['products']

# Custom JSON encoder to handle MongoDB ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super(JSONEncoder, self).default(obj)

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend')
app.json_encoder = JSONEncoder

# Enable CORS
CORS(app)

# Serve frontend files (remove render_template)
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# Serve static assets
@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# API Routes
@app.route('/api/search', methods=['GET'])
def search_products():
    """
    Search for products by name
    Parameters:
    - query: search term (string)
    Returns:
    - List of matching products sorted by price
    """
    query = request.args.get('query', '')
    
    if not query:
        # Return all products sorted by price if no query provided
        products = list(products_collection.find().sort('price', 1))
    else:
        # Search by name (case-insensitive)
        products = list(products_collection.find(
            {'name': {'$regex': query, '$options': 'i'}}
        ).sort('price', 1))
    
    return jsonify(products)

@app.route('/api/like', methods=['POST'])
def like_product():
    """
    Increase the likes count for a product
    Parameters:
    - product_id: ID of the product to like (string)
    Returns:
    - Updated product information
    """
    data = request.json
    product_id = data.get('product_id')
    
    if not product_id:
        return jsonify({'error': 'Product ID is required'}), 400
    
    # Update the product's likes count
    result = products_collection.update_one(
        {'_id': ObjectId(product_id)},
        {'$inc': {'likes': 1}}
    )
    
    if result.modified_count == 0:
        return jsonify({'error': 'Product not found'}), 404
    
    # Get the updated product
    product = products_collection.find_one({'_id': ObjectId(product_id)})
    
    return jsonify(product)

@app.route('/api/popular-products', methods=['GET'])
def get_popular_products():
    """
    Get the top 5 most liked products
    Returns:
    - List of the 5 most liked products
    """
    popular_products = list(products_collection.find().sort('likes', -1).limit(5))
    
    return jsonify(popular_products)

# Additional routes to enhance functionality
@app.route('/api/products', methods=['GET'])
def get_all_products():
    """
    Get all products with optional sorting
    Parameters:
    - sort_by: field to sort by (default: price)
    - sort_order: 1 for ascending, -1 for descending (default: 1)
    Returns:
    - List of all products
    """
    sort_by = request.args.get('sort_by', 'price')
    sort_order = int(request.args.get('sort_order', 1))
    
    products = list(products_collection.find().sort(sort_by, sort_order))
    
    return jsonify(products)

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """
    Get details for a specific product
    Parameters:
    - product_id: ID of the product (in URL)
    Returns:
    - Product details
    """
    try:
        product = products_collection.find_one({'_id': ObjectId(product_id)})
    except:
        return jsonify({'error': 'Invalid product ID'}), 400
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify(product)

@app.route('/api/products/category/<category>', methods=['GET'])
def get_products_by_category(category):
    """
    Get products by category
    Parameters:
    - category: product category (in URL)
    - limit: maximum number of products to return (optional)
    Returns:
    - List of products in the category
    """
    limit = request.args.get('limit')
    
    if limit:
        limit = int(limit)
        products = list(products_collection.find({'category': category}).limit(limit))
    else:
        products = list(products_collection.find({'category': category}))
    
    return jsonify(products)

# Run the app
if __name__ == '__main__':
    print(f"Frontend folder path: {os.path.abspath(app.static_folder)}")
    print(f"API running at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)