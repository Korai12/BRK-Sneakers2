from flask import Flask, Response, request, send_from_directory
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

# Helper function to manually convert MongoDB documents to dictionaries
def make_json_serializable(obj):
    """Make a document JSON serializable by converting ObjectIds to strings"""
    if isinstance(obj, dict):
        return {k: make_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_serializable(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend')

# Enable CORS
CORS(app)

# Serve frontend files
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

# API Routes - note we're using Response directly, not jsonify
@app.route('/api/search', methods=['GET'])
def search_products():
    try:
        query = request.args.get('query', '')
        
        if not query:
            # Return all products sorted by price if no query provided
            cursor = products_collection.find().sort('price', 1)
        else:
            # Search by name (case-insensitive)
            cursor = products_collection.find(
                {'name': {'$regex': query, '$options': 'i'}}
            ).sort('price', 1)
        
        # Convert MongoDB documents to JSON-serializable dictionaries
        products = [make_json_serializable(product) for product in cursor]
        
        # Return a manually created JSON response
        return Response(
            json.dumps(products), 
            mimetype='application/json'
        )
    except Exception as e:
        print(f"Error in search_products: {str(e)}")
        return Response(
            json.dumps({"error": str(e)}),
            mimetype='application/json',
            status=500
        )

@app.route('/api/like', methods=['POST'])
def like_product():
    try:
        data = request.json
        product_id = data.get('product_id')
        
        if not product_id:
            return Response(
                json.dumps({'error': 'Product ID is required'}),
                mimetype='application/json',
                status=400
            )
        
        # Update the product's likes count
        result = products_collection.update_one(
            {'_id': ObjectId(product_id)},
            {'$inc': {'likes': 1}}
        )
        
        if result.modified_count == 0:
            return Response(
                json.dumps({'error': 'Product not found'}),
                mimetype='application/json',
                status=404
            )
        
        # Get the updated product
        product = products_collection.find_one({'_id': ObjectId(product_id)})
        
        # Convert to serializable dictionary
        product_dict = make_json_serializable(product)
        
        return Response(
            json.dumps(product_dict),
            mimetype='application/json'
        )
    except Exception as e:
        print(f"Error in like_product: {str(e)}")
        return Response(
            json.dumps({"error": str(e)}),
            mimetype='application/json',
            status=500
        )

@app.route('/api/popular-products', methods=['GET'])
def get_popular_products():
    try:
        cursor = products_collection.find().sort('likes', -1).limit(5)
        
        # Convert to serializable dictionaries
        products = [make_json_serializable(product) for product in cursor]
        
        return Response(
            json.dumps(products),
            mimetype='application/json'
        )
    except Exception as e:
        print(f"Error in get_popular_products: {str(e)}")
        return Response(
            json.dumps({"error": str(e)}),
            mimetype='application/json',
            status=500
        )

@app.route('/api/products', methods=['GET'])
def get_all_products():
    try:
        sort_by = request.args.get('sort_by', 'price')
        sort_order = int(request.args.get('sort_order', 1))
        
        # Get cursor from MongoDB
        cursor = products_collection.find().sort(sort_by, sort_order)
        
        # Convert to serializable dictionaries
        products = [make_json_serializable(product) for product in cursor]
        
        # Return a direct JSON response
        return Response(
            json.dumps(products),
            mimetype='application/json'
        )
    except Exception as e:
        print(f"Error in get_all_products: {str(e)}")
        return Response(
            json.dumps({"error": str(e)}),
            mimetype='application/json',
            status=500
        )

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = products_collection.find_one({'_id': ObjectId(product_id)})
        
        if not product:
            return Response(
                json.dumps({'error': 'Product not found'}),
                mimetype='application/json',
                status=404
            )
        
        # Convert to serializable dictionary
        product_dict = make_json_serializable(product)
        
        return Response(
            json.dumps(product_dict),
            mimetype='application/json'
        )
    except Exception as e:
        print(f"Error in get_product: {str(e)}")
        return Response(
            json.dumps({"error": "Invalid product ID or " + str(e)}),
            mimetype='application/json',
            status=400
        )

@app.route('/api/products/category/<category>', methods=['GET'])
def get_products_by_category(category):
    try:
        limit = request.args.get('limit')
        
        # Create the query
        if limit:
            limit = int(limit)
            cursor = products_collection.find({'category': category}).limit(limit)
        else:
            cursor = products_collection.find({'category': category})
        
        # Convert to serializable dictionaries
        products = [make_json_serializable(product) for product in cursor]
        
        return Response(
            json.dumps(products),
            mimetype='application/json'
        )
    except Exception as e:
        print(f"Error in get_products_by_category: {str(e)}")
        return Response(
            json.dumps({"error": str(e)}),
            mimetype='application/json',
            status=500
        )

# Run the app
if __name__ == '__main__':
    print(f"Frontend folder path: {os.path.abspath(app.static_folder)}")
    print(f"API running at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)