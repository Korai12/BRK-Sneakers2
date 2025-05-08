/**
 * API Connector - Centralized API communication for BRK Sneakers
 * This file handles all connections to the backend API
 */

class ApiConnector {
    constructor() {
        this.baseUrl = '/api';
    }

    /**
     * Search for products
     * @param {string} query - Search term
     * @returns {Promise} Promise with search results
     */
    searchProducts(query = '') {
        return fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`)
            .then(this.handleResponse)
            .catch(this.handleError);
    }

    /**
     * Like a product
     * @param {string} productId - ID of the product to like
     * @returns {Promise} Promise with updated product
     */
    likeProduct(productId) {
        return fetch(`${this.baseUrl}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: productId }),
        })
            .then(this.handleResponse)
            .catch(this.handleError);
    }

    /**
     * Get popular products
     * @returns {Promise} Promise with popular products
     */
    getPopularProducts() {
        return fetch(`${this.baseUrl}/popular-products`)
            .then(this.handleResponse)
            .catch(this.handleError);
    }

    /**
     * Get all products
     * @param {string} sortBy - Field to sort by (default: price)
     * @param {number} sortOrder - 1 for ascending, -1 for descending (default: 1)
     * @returns {Promise} Promise with all products
     */
    getAllProducts(sortBy = 'price', sortOrder = 1) {
        return fetch(`${this.baseUrl}/products?sort_by=${sortBy}&sort_order=${sortOrder}`)
            .then(this.handleResponse)
            .catch(this.handleError);
    }

    /**
     * Get products by category
     * @param {string} category - Product category
     * @param {number} limit - Maximum number of products to return (optional)
     * @returns {Promise} Promise with products in category
     */
    getProductsByCategory(category, limit = null) {
        let url = `${this.baseUrl}/products/category/${category}`;
        if (limit) {
            url += `?limit=${limit}`;
        }
        return fetch(url)
            .then(this.handleResponse)
            .catch(this.handleError);
    }

    /**
     * Get product by ID
     * @param {string} productId - ID of the product
     * @returns {Promise} Promise with product details
     */
    getProductById(productId) {
        return fetch(`${this.baseUrl}/products/${productId}`)
            .then(this.handleResponse)
            .catch(this.handleError);
    }

    /**
     * Handle API response
     * @param {Response} response - Fetch API response
     * @returns {Promise} Promise with response data
     */
    handleResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Handle API error
     * @param {Error} error - Error object
     * @throws {Error} Rethrows the error
     */
    handleError(error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Create and export a singleton instance
const apiConnector = new ApiConnector();

// Add to window object for global access
window.apiConnector = apiConnector;