from pymongo import MongoClient
from bson.objectid import ObjectId  # Use this instead of directly from bson
import json
from config import MONGO_URI, MONGO_DB, MONGO_COLLECTION

# MongoDB Connection
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
products_collection = db[MONGO_COLLECTION]

class Product:
    """
    Model class for Product objects in the database
    """
    
    @staticmethod
    def get_all(sort_by='price', sort_order=1):
        """
        Get all products from the database
        """
        return list(products_collection.find().sort(sort_by, sort_order))
    
    @staticmethod
    def get_by_id(product_id):
        """
        Get a product by its ID
        """
        try:
            return products_collection.find_one({'_id': ObjectId(product_id)})
        except:
            return None
    
    @staticmethod
    def search(query, sort_by='price', sort_order=1):
        """
        Search for products by name
        """
        if not query:
            return Product.get_all(sort_by, sort_order)
        
        return list(products_collection.find(
            {'name': {'$regex': query, '$options': 'i'}}
        ).sort(sort_by, sort_order))
    
    @staticmethod
    def like(product_id):
        """
        Increment the likes count for a product
        """
        try:
            result = products_collection.update_one(
                {'_id': ObjectId(product_id)},
                {'$inc': {'likes': 1}}
            )
            
            if result.modified_count == 0:
                return None
            
            return Product.get_by_id(product_id)
        except:
            return None
    
    @staticmethod
    def get_popular(limit=5):
        """
        Get the most liked products
        """
        return list(products_collection.find().sort('likes', -1).limit(limit))
    
    @staticmethod
    def get_by_category(category, limit=None):
        """
        Get products by category
        """
        query = products_collection.find({'category': category})
        
        if limit:
            query = query.limit(limit)
            
        return list(query)
    
    @staticmethod
    def to_json(product):
        """
        Convert a product object to JSON-serializable format
        """
        if product:
            product['_id'] = str(product['_id'])
        return product