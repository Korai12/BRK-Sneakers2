#!/usr/bin/env python3
"""
Comprehensive Database Debugger for BRK Sneakers Project
This script tests everything related to MongoDB database
"""

import sys
import json
import time
import socket
import subprocess
import platform
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure, OperationFailure
from bson.objectid import ObjectId

class DatabaseDebugger:
    def __init__(self):
        self.mongo_uri = 'mongodb://localhost:27017/'
        self.db_name = 'brk_sneakers'
        self.collection_name = 'products'
        self.client = None
        self.db = None
        self.collection = None
        self.test_results = []
        
    def log_result(self, test_name, status, message, details=None):
        """Log test result"""
        result = {
            'test': test_name,
            'status': status,  # 'PASS', 'FAIL', 'WARN', 'INFO'
            'message': message,
            'details': details,
            'timestamp': datetime.now().strftime('%H:%M:%S')
        }
        self.test_results.append(result)
        
        # Print result
        status_icons = {'PASS': '✅', 'FAIL': '❌', 'WARN': '⚠️', 'INFO': 'ℹ️'}
        icon = status_icons.get(status, '•')
        print(f"{icon} [{result['timestamp']}] {test_name}: {message}")
        
        if details:
            for line in details:
                print(f"   {line}")
        print()

    def check_system_info(self):
        """Check system information"""
        self.log_result("System Info", "INFO", f"Operating System: {platform.system()} {platform.release()}")
        self.log_result("System Info", "INFO", f"Python Version: {sys.version}")
        
        # Check if MongoDB is installed
        try:
            result = subprocess.run(['mongod', '--version'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                version_line = result.stdout.split('\n')[0]
                self.log_result("MongoDB Installation", "PASS", f"MongoDB found: {version_line}")
            else:
                self.log_result("MongoDB Installation", "FAIL", "MongoDB not found in PATH")
        except (FileNotFoundError, subprocess.TimeoutExpired):
            self.log_result("MongoDB Installation", "WARN", "MongoDB command not found in PATH")

    def check_mongodb_service(self):
        """Check if MongoDB service is running"""
        # Check if port 27017 is open
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', 27017))
        sock.close()
        
        if result == 0:
            self.log_result("MongoDB Service", "PASS", "MongoDB is listening on port 27017")
        else:
            self.log_result("MongoDB Service", "FAIL", "MongoDB is not running on port 27017", [
                "To start MongoDB:",
                "Windows: net start MongoDB",
                "macOS: brew services start mongodb-community",
                "Linux: sudo systemctl start mongod"
            ])
            return False
        return True

    def test_connection(self):
        """Test MongoDB connection"""
        try:
            self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000)
            # Test connection
            self.client.admin.command('ping')
            self.log_result("Database Connection", "PASS", f"Successfully connected to {self.mongo_uri}")
            
            # Get server info
            server_info = self.client.server_info()
            self.log_result("MongoDB Version", "INFO", f"Server version: {server_info['version']}")
            
            return True
        except ServerSelectionTimeoutError:
            self.log_result("Database Connection", "FAIL", "Connection timeout - MongoDB not responding")
            return False
        except ConnectionFailure as e:
            self.log_result("Database Connection", "FAIL", f"Connection failed: {e}")
            return False
        except Exception as e:
            self.log_result("Database Connection", "FAIL", f"Unexpected error: {e}")
            return False

    def check_database_existence(self):
        """Check if database exists"""
        try:
            db_list = self.client.list_database_names()
            if self.db_name in db_list:
                self.log_result("Database Existence", "PASS", f"Database '{self.db_name}' exists")
                self.db = self.client[self.db_name]
                return True
            else:
                self.log_result("Database Existence", "WARN", f"Database '{self.db_name}' does not exist", [
                    "Available databases: " + ", ".join(db_list),
                    "Database will be created when first document is inserted"
                ])
                self.db = self.client[self.db_name]  # Will create when first used
                return True
        except Exception as e:
            self.log_result("Database Existence", "FAIL", f"Error checking database: {e}")
            return False

    def check_collection_existence(self):
        """Check if collection exists"""
        try:
            collections = self.db.list_collection_names()
            if self.collection_name in collections:
                self.log_result("Collection Existence", "PASS", f"Collection '{self.collection_name}' exists")
                self.collection = self.db[self.collection_name]
                return True
            else:
                self.log_result("Collection Existence", "WARN", f"Collection '{self.collection_name}' does not exist", [
                    "Available collections: " + ", ".join(collections) if collections else "No collections found",
                    "Collection will be created when first document is inserted"
                ])
                self.collection = self.db[self.collection_name]  # Will create when first used
                return True
        except Exception as e:
            self.log_result("Collection Existence", "FAIL", f"Error checking collection: {e}")
            return False

    def check_data_count(self):
        """Check data count in collection"""
        try:
            count = self.collection.count_documents({})
            if count > 0:
                self.log_result("Data Count", "PASS", f"Found {count} documents in collection")
                return count
            else:
                self.log_result("Data Count", "WARN", "Collection is empty", [
                    "Run seed_database.py to populate with sample data"
                ])
                return 0
        except Exception as e:
            self.log_result("Data Count", "FAIL", f"Error counting documents: {e}")
            return -1

    def check_data_structure(self):
        """Check data structure of documents"""
        try:
            sample_doc = self.collection.find_one()
            if sample_doc:
                required_fields = ['name', 'description', 'price', 'image', 'category', 'likes']
                missing_fields = []
                
                for field in required_fields:
                    if field not in sample_doc:
                        missing_fields.append(field)
                
                if not missing_fields:
                    self.log_result("Data Structure", "PASS", "All required fields present in sample document")
                else:
                    self.log_result("Data Structure", "WARN", f"Missing fields: {missing_fields}")
                
                # Show sample document structure
                doc_fields = list(sample_doc.keys())
                self.log_result("Sample Document", "INFO", f"Fields: {doc_fields}")
                
                return True
            else:
                self.log_result("Data Structure", "WARN", "No documents to check structure")
                return False
        except Exception as e:
            self.log_result("Data Structure", "FAIL", f"Error checking structure: {e}")
            return False

    def check_indexes(self):
        """Check database indexes"""
        try:
            indexes = list(self.collection.list_indexes())
            index_names = [idx['name'] for idx in indexes]
            
            self.log_result("Indexes", "INFO", f"Found {len(indexes)} indexes: {index_names}")
            
            # Check for text index (needed for search)
            has_text_index = any('text' in idx.get('key', {}).values() for idx in indexes)
            if has_text_index:
                self.log_result("Text Index", "PASS", "Text search index exists")
            else:
                self.log_result("Text Index", "WARN", "No text search index found", [
                    "Search functionality may not work properly",
                    "Create index with: db.products.createIndex({'name': 'text'})"
                ])
            
            return True
        except Exception as e:
            self.log_result("Indexes", "FAIL", f"Error checking indexes: {e}")
            return False

    def test_basic_operations(self):
        """Test basic CRUD operations"""
        test_doc_id = None
        
        try:
            # Test INSERT
            test_doc = {
                'name': 'TEST_PRODUCT_DEBUG',
                'description': 'Test product for debugging',
                'price': 99.99,
                'image': 'test.jpg',
                'category': ['test'],
                'likes': 0
            }
            
            result = self.collection.insert_one(test_doc)
            test_doc_id = result.inserted_id
            self.log_result("Insert Operation", "PASS", f"Successfully inserted test document with ID: {test_doc_id}")
            
            # Test FIND
            found_doc = self.collection.find_one({'_id': test_doc_id})
            if found_doc:
                self.log_result("Find Operation", "PASS", "Successfully found inserted document")
            else:
                self.log_result("Find Operation", "FAIL", "Could not find inserted document")
            
            # Test UPDATE
            update_result = self.collection.update_one(
                {'_id': test_doc_id},
                {'$inc': {'likes': 1}}
            )
            if update_result.modified_count == 1:
                self.log_result("Update Operation", "PASS", "Successfully updated document")
            else:
                self.log_result("Update Operation", "FAIL", "Failed to update document")
            
            # Test SEARCH
            search_results = list(self.collection.find({'name': {'$regex': 'TEST', '$options': 'i'}}))
            if len(search_results) > 0:
                self.log_result("Search Operation", "PASS", f"Found {len(search_results)} documents in search")
            else:
                self.log_result("Search Operation", "WARN", "Search returned no results")
            
            return True
            
        except Exception as e:
            self.log_result("CRUD Operations", "FAIL", f"Error during operations: {e}")
            return False
        finally:
            # Clean up test document
            if test_doc_id:
                try:
                    self.collection.delete_one({'_id': test_doc_id})
                    self.log_result("Cleanup", "PASS", "Test document cleaned up")
                except:
                    self.log_result("Cleanup", "WARN", "Could not clean up test document")

    def test_text_search(self):
        """Test text search functionality"""
        try:
            # Try text search
            search_result = list(self.collection.find({'$text': {'$search': 'runner'}}))
            self.log_result("Text Search", "PASS", f"Text search returned {len(search_result)} results")
            return True
        except OperationFailure as e:
            if 'text index required' in str(e):
                self.log_result("Text Search", "FAIL", "Text index required for search", [
                    "Create text index with: db.products.createIndex({'name': 'text'})"
                ])
            else:
                self.log_result("Text Search", "FAIL", f"Text search error: {e}")
            return False
        except Exception as e:
            self.log_result("Text Search", "FAIL", f"Unexpected search error: {e}")
            return False

    def show_sample_data(self):
        """Show sample data from collection"""
        try:
            sample_docs = list(self.collection.find().limit(3))
            if sample_docs:
                self.log_result("Sample Data", "INFO", f"Showing {len(sample_docs)} sample products:")
                for i, doc in enumerate(sample_docs, 1):
                    details = [
                        f"Product {i}: {doc.get('name', 'No name')}",
                        f"  Price: €{doc.get('price', 0)}",
                        f"  Category: {doc.get('category', 'No category')}",
                        f"  Likes: {doc.get('likes', 0)}",
                        f"  ID: {doc.get('_id', 'No ID')}"
                    ]
                    for detail in details:
                        print(f"   {detail}")
                return True
            else:
                self.log_result("Sample Data", "WARN", "No data to display")
                return False
        except Exception as e:
            self.log_result("Sample Data", "FAIL", f"Error retrieving sample data: {e}")
            return False

    def test_aggregation(self):
        """Test aggregation operations"""
        try:
            # Test popular products aggregation (sort by likes)
            pipeline = [
                {'$sort': {'likes': -1}},
                {'$limit': 5},
                {'$project': {'name': 1, 'likes': 1, 'price': 1}}
            ]
            
            popular_products = list(self.collection.aggregate(pipeline))
            if popular_products:
                self.log_result("Aggregation", "PASS", f"Popular products aggregation returned {len(popular_products)} results")
                
                details = ["Top products by likes:"]
                for product in popular_products:
                    details.append(f"  {product.get('name', 'Unknown')}: {product.get('likes', 0)} likes")
                
                self.log_result("Popular Products", "INFO", "Top 5 most liked products", details)
            else:
                self.log_result("Aggregation", "WARN", "Aggregation returned no results")
            
            return True
        except Exception as e:
            self.log_result("Aggregation", "FAIL", f"Aggregation error: {e}")
            return False

    def check_performance(self):
        """Check basic performance metrics"""
        try:
            start_time = time.time()
            
            # Test query performance
            count = self.collection.count_documents({})
            count_time = time.time() - start_time
            
            start_time = time.time()
            sample = list(self.collection.find().limit(10))
            find_time = time.time() - start_time
            
            self.log_result("Performance", "INFO", f"Count query: {count_time:.3f}s, Find query: {find_time:.3f}s")
            
            if count_time > 1.0 or find_time > 1.0:
                self.log_result("Performance", "WARN", "Queries are slow - consider adding indexes")
            else:
                self.log_result("Performance", "PASS", "Query performance looks good")
            
            return True
        except Exception as e:
            self.log_result("Performance", "FAIL", f"Performance test error: {e}")
            return False

    def suggest_fixes(self):
        """Suggest fixes based on test results"""
        print("\n" + "="*60)
        print("🔧 SUGGESTED FIXES")
        print("="*60)
        
        failed_tests = [r for r in self.test_results if r['status'] == 'FAIL']
        warnings = [r for r in self.test_results if r['status'] == 'WARN']
        
        if not failed_tests and not warnings:
            print("✅ No issues found! Your database is working perfectly.")
            return
        
        if failed_tests:
            print("\n❌ CRITICAL ISSUES TO FIX:")
            for test in failed_tests:
                print(f"\n• {test['test']}: {test['message']}")
                if test['details']:
                    for detail in test['details']:
                        print(f"  {detail}")
        
        if warnings:
            print("\n⚠️ WARNINGS (optional improvements):")
            for test in warnings:
                print(f"\n• {test['test']}: {test['message']}")
                if test['details']:
                    for detail in test['details']:
                        print(f"  {detail}")
        
        print("\n💡 QUICK FIXES:")
        
        # Check for common issues
        has_connection_issue = any('Connection' in test['test'] for test in failed_tests)
        has_empty_db = any('Data Count' in test['test'] and 'empty' in test['message'] for test in warnings)
        has_no_text_index = any('Text Index' in test['test'] for test in warnings)
        
        if has_connection_issue:
            print("\n1. Start MongoDB:")
            print("   Windows: net start MongoDB")
            print("   macOS: brew services start mongodb-community")
            print("   Linux: sudo systemctl start mongod")
        
        if has_empty_db:
            print("\n2. Populate database:")
            print("   python seed_database.py")
        
        if has_no_text_index:
            print("\n3. Create text search index:")
            print("   mongo brk_sneakers --eval 'db.products.createIndex({\"name\": \"text\"})'")
        
        print("\n4. Run complete setup:")
        print("   python start_project.py")

    def generate_report(self):
        """Generate summary report"""
        print("\n" + "="*60)
        print("📊 DATABASE DIAGNOSTIC REPORT")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed = len([r for r in self.test_results if r['status'] == 'PASS'])
        failed = len([r for r in self.test_results if r['status'] == 'FAIL'])
        warnings = len([r for r in self.test_results if r['status'] == 'WARN'])
        
        print(f"\nTest Summary:")
        print(f"  Total Tests: {total_tests}")
        print(f"  ✅ Passed: {passed}")
        print(f"  ❌ Failed: {failed}")
        print(f"  ⚠️ Warnings: {warnings}")
        
        if failed == 0:
            if warnings == 0:
                print(f"\n🎉 EXCELLENT! All tests passed with no warnings.")
            else:
                print(f"\n✅ GOOD! All critical tests passed. {warnings} minor issues found.")
        else:
            print(f"\n❌ ISSUES FOUND! {failed} critical failures need attention.")
        
        # Save detailed report
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = f"database_report_{timestamp}.json"
        
        try:
            with open(report_file, 'w') as f:
                json.dump(self.test_results, f, indent=2, default=str)
            print(f"\n📄 Detailed report saved to: {report_file}")
        except Exception as e:
            print(f"\n⚠️ Could not save report: {e}")

    def run_all_tests(self):
        """Run all database tests"""
        print("🔍 BRK SNEAKERS DATABASE DEBUGGER")
        print("="*60)
        print("Testing all database components...\n")
        
        # Run all tests in order
        self.check_system_info()
        
        if not self.check_mongodb_service():
            print("\n❌ MongoDB service not running. Cannot continue with database tests.")
            self.suggest_fixes()
            return False
        
        if not self.test_connection():
            print("\n❌ Cannot connect to MongoDB. Check connection settings.")
            self.suggest_fixes()
            return False
        
        self.check_database_existence()
        self.check_collection_existence()
        
        data_count = self.check_data_count()
        
        if data_count > 0:
            self.check_data_structure()
            self.show_sample_data()
            self.test_aggregation()
            self.check_performance()
        
        self.check_indexes()
        self.test_basic_operations()
        self.test_text_search()
        
        # Generate final report
        self.generate_report()
        self.suggest_fixes()
        
        return True

def main():
    try:
        debugger = DatabaseDebugger()
        debugger.run_all_tests()
    except KeyboardInterrupt:
        print("\n\n❌ Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()