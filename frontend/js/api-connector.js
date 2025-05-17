/**
 * API Connector - Enhanced for BRK Sneakers
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
     * Get related products
     * @param {string} category - Category to find related products
     * @param {string} excludeId - ID of product to exclude from results
     * @param {number} limit - Maximum number of related products to return
     * @returns {Promise} Promise with related products
     */
    getRelatedProducts(category, excludeId, limit = 4) {
        return fetch(`${this.baseUrl}/products/category/${category}?limit=${limit}`)
            .then(this.handleResponse)
            .then(products => {
                // Filter out the current product
                return products.filter(product => product._id !== excludeId);
            })
            .catch(this.handleError);
    }

    /**
     * Get recently viewed products
     * @param {Array} productIds - Array of product IDs
     * @returns {Promise} Promise with recently viewed products
     */
    getRecentlyViewedProducts(productIds) {
        // If no product IDs, return empty array
        if (!productIds || productIds.length === 0) {
            return Promise.resolve([]);
        }

        // Get each product by ID
        const promises = productIds.map(id => this.getProductById(id));
        
        // Return all products
        return Promise.all(promises).catch(error => {
            console.error('Error fetching recently viewed products:', error);
            return [];
        });
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

/**
 * Global price formatting utility for consistent currency display
 * Should be added to a shared utility file or api-connector.js
 */

// Format price with the € symbol
function formatPrice(price) {
    // Ensure price is a number
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '€0.00';
    
    // Format with 2 decimal places and € symbol
    return `€${numPrice.toFixed(2)}`;
}

// Function to update all price displays in the DOM
function updateAllPriceDisplays() {
    // Find all product price elements
    const priceElements = document.querySelectorAll('.product-price');
    
    priceElements.forEach(priceElement => {
        // Get the current text
        const currentText = priceElement.textContent.trim();
        
        // Skip if already formatted correctly
        if (currentText.startsWith('€')) return;
        
        // Replace $ or EUR with € symbol
        let numericPart = currentText.replace(/[$€EUR\s]/g, '');
        
        // Parse the numeric part
        const price = parseFloat(numericPart);
        if (!isNaN(price)) {
            // Update the element's text
            priceElement.textContent = formatPrice(price);
        }
    });
}

window.formatPrice = formatPrice;
window.updateAllPriceDisplays = updateAllPriceDisplays;

// Create and export a singleton instance
const apiConnector = new ApiConnector();

// Add to window object for global access
window.apiConnector = apiConnector;