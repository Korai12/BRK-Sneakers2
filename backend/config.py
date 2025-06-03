# Περιέχει όλες τις ρυθμίσεις για τη βάση δεδομένων, Flask και API.
import os


MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
MONGO_DB = os.environ.get('MONGO_DB', 'brk_sneakers')
MONGO_COLLECTION = os.environ.get('MONGO_COLLECTION', 'products')


DEBUG = os.environ.get('DEBUG', 'True') == 'True'
HOST = os.environ.get('HOST', '0.0.0.0')
PORT = int(os.environ.get('PORT', 5000))


CORS_ORIGINS = ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://localhost:8080']