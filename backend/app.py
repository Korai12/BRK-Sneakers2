# Υλοποιεί το REST API με όλα τα απαιτούμενα endpoints και διαχειρίζει την επικοινωνία με τη MongoDB και εξυπηρετεί το frontend.
from flask import Flask, Response, request, send_from_directory

try:
    from flask_cors import CORS
except ImportError:
    class CORS:
        def __init__(self, app, **kwargs):
            print("Warning: flask_cors is not installed. CORS will not be enabled.")
            pass

import json
import os
from bson.objectid import ObjectId  
from pymongo import MongoClient


import os
mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(mongo_uri)
db = client['brk_sneakers']
products_collection = db['products']

# Μετατρέπει τα έγγραφα της MongoDB σε μορφή συμβατή με JSON.
def make_json_serializable(obj):
    if isinstance(obj, dict):
        return {k: make_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_serializable(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

# Δημιουργεί το Flask app και ρυθμίζει τον φάκελο για τα στατικά αρχεία.
app = Flask(__name__, static_folder='../frontend')

CORS(app)


@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# API Endpoints
@app.route('/api/search', methods=['GET'])
def search_products():
    try:
        query = request.args.get('query', '')
        
        if not query:
            # Επιστρεφει όλα τα προϊόντα ταξινομημένα κατά τιμή αν δεν δόθηκε query
            cursor = products_collection.find().sort('price', 1)
        else:
            # Αναζήτηση κατά όνομα
            cursor = products_collection.find(
                {'name': {'$regex': query, '$options': 'i'}}
            ).sort('price', 1)
        
    
        products = [make_json_serializable(product) for product in cursor]
        
        # Επιστρέφει τα αποτελέσματα ως JSON
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
        
        # Getter του ενημερωμένου προϊόντος
        product = products_collection.find_one({'_id': ObjectId(product_id)})
        
        # Μετατροπή του προϊόντος σε JSON συμβατό με το API
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
        
        
        cursor = products_collection.find().sort(sort_by, sort_order)
        

        products = [make_json_serializable(product) for product in cursor]
        
        
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
        
        
        cursor = products_collection.find({"category": category})
        
        if limit:
            limit = int(limit)
            cursor = cursor.limit(limit)
        
        
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


if __name__ == '__main__':
    # Ρυθμίσεις για το Flask app
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'True') == 'True'
    
    print(f"Frontend folder path: {os.path.abspath(app.static_folder)}")
    print(f"API running at http://{host}:{port}")
    app.run(debug=debug, host=host, port=port)