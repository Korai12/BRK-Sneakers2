//Χειρίζονται όλες οι συνδέσεις με το backend API

class ApiConnector {
    constructor() {
        this.baseUrl = '/api';
    }

    //Αναζητεί προϊόντα με βάση το text στο search bar
    searchProducts(query = '') {
        return fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`)
            .then(this.handleResponse)
            .catch(this.handleError);
    }

    // Like σε προϊόν 
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

    //Getter δημοφιλων προϊόντων
    getPopularProducts() {
        return fetch(`${this.baseUrl}/popular-products`)
            .then(this.handleResponse)
            .catch(this.handleError);
    }

    //Getter για όλα τα προϊόντα με ταξινόμηση
    getAllProducts(sortBy = 'price', sortOrder = 1) {
        return fetch(`${this.baseUrl}/products?sort_by=${sortBy}&sort_order=${sortOrder}`)
            .then(this.handleResponse)
            .catch(this.handleError);
    }

    // Getter για προϊόντα με βάση την κατηγορία
    getProductsByCategory(category, limit = null) {
        let url = `${this.baseUrl}/products/category/${category}`;
        if (limit) {
            url += `?limit=${limit}`;
        }
        return fetch(url)
            .then(this.handleResponse)
            .catch(this.handleError);
    }

    //Getter προϊόντος ανά ID
    getProductById(productId) {
        return fetch(`${this.baseUrl}/products/${productId}`)
            .then(this.handleResponse)
            .catch(this.handleError);
    }

   // Getter σχετικών προϊόντων
    getRelatedProducts(category, excludeId, limit = 4) {
        return fetch(`${this.baseUrl}/products/category/${category}?limit=${limit}`)
            .then(this.handleResponse)
            .then(products => {
                return products.filter(product => product._id !== excludeId);
            })
            .catch(this.handleError);
    }

    // Getter για προϊόντα που έχουν προβληθεί πρόσφατα
    getRecentlyViewedProducts(productIds) {
        if (!productIds || productIds.length === 0) {
            return Promise.resolve([]);
        }

        
        const promises = productIds.map(id => this.getProductById(id));
        
        
        return Promise.all(promises).catch(error => {
            console.error('Error fetching recently viewed products:', error);
            return [];
        });
    }

    // Χειρισμός απάντησης API
    handleResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }

    // Χειρισμός σφαλμάτων API
    handleError(error) {
        console.error('API Error:', error);
        throw error;
    }



    
}

// Μορφοποίηση τιμής με το σύμβολο €
function formatPrice(price) {
    
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '€0.00';
    
    
    return `€${numPrice.toFixed(2)}`;
}

// Ενημέρωση εμφανισης όλων των τιμών προϊόντων στη σελίδα
function updateAllPriceDisplays() {
   
    const priceElements = document.querySelectorAll('.product-price');
    
    priceElements.forEach(priceElement => {
        
        const currentText = priceElement.textContent.trim();
        
        
        if (currentText.startsWith('€')) return;
        
        
        let numericPart = currentText.replace(/[$€EUR\s]/g, '');
        
        
        const price = parseFloat(numericPart);
        if (!isNaN(price)) {
            
            priceElement.textContent = formatPrice(price);
        }
    });
}

window.formatPrice = formatPrice;
window.updateAllPriceDisplays = updateAllPriceDisplays;


const apiConnector = new ApiConnector();

// Εξαγωγή του apiConnector για χρήση σε άλλα αρχεία
window.apiConnector = apiConnector;