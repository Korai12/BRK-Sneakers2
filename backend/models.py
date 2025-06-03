from pymongo import MongoClient
from bson.objectid import ObjectId 
import json
from config import MONGO_URI, MONGO_DB, MONGO_COLLECTION


client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
products_collection = db[MONGO_COLLECTION]

class Product:
    
    @staticmethod
    def get_all(sort_by='price', sort_order=1):
        """
        Getter όλων των προϊόντων από τη βάση δεδομένων
        """
        return list(products_collection.find().sort(sort_by, sort_order))
    
    @staticmethod
    def get_by_id(product_id):
        """
        Getter προϊόντος με βάση το ID του
        """
        try:
            return products_collection.find_one({'_id': ObjectId(product_id)})
        except:
            return None
    
    @staticmethod
    def search(query, sort_by='price', sort_order=1):
        """
        Αναζήτηση προϊόντων με βάση το όνομα
        """
        if not query:
            return Product.get_all(sort_by, sort_order)
        
        return list(products_collection.find(
            {'name': {'$regex': query, '$options': 'i'}}
        ).sort(sort_by, sort_order))
    
    @staticmethod
    def like(product_id):
        """
        Αύξηση των likes για το προϊόν
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
        Getter των πιο δημοφιλών προϊόντων
        """
        return list(products_collection.find().sort('likes', -1).limit(limit))
    
    @staticmethod
    def get_by_category(category, limit=None):
        """
        Getter προϊόντων ανά κατηγορία
        """
        query = products_collection.find({'category': category})
        
        if limit:
            query = query.limit(limit)
            
        return list(query)
    
    @staticmethod
    def to_json(product):
        """
        Μετατροπή του προϊόντος σε JSON format
        """
        if product:
            product['_id'] = str(product['_id'])
        return product