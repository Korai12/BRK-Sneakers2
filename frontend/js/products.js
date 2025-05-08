// JavaScript for the products page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load all products on page load
    loadAllProducts();
    
    // Product search functionality
    const searchInput = document.getElementById('product-search');
    const searchButton = document.getElementById('search-button');
    const productsContainer = document.getElementById('products-container');
    
    if (searchInput && searchButton) {
        // Search when button is clicked
        searchButton.addEventListener('click', function() {
            searchProducts();
        });
        
        // Search when Enter key is pressed
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
        
        // Live search as user types (optional)
        searchInput.addEventListener('input', function() {
            if (this.value.length >= 3 || this.value.length === 0) {
                searchProducts();
            }
        });
    }
    
    function searchProducts() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // Call the API for search
        fetch(`/api/search?query=${encodeURIComponent(searchTerm)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(products => {
                // Update products display
                displayProducts(products);
            })
            .catch(error => {
                console.error('Error searching products:', error);
                // Show error message
                displayErrorMessage("There was a problem searching for products. Please try again later.");
            });
    }
    
    // Load all products initially
    function loadAllProducts() {
        fetch('/api/products')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(products => {
                // Update products display
                displayProducts(products);
            })
            .catch(error => {
                console.error('Error loading products:', error);
                // Show error message
                displayErrorMessage("There was a problem loading products. Please try again later.");
            });
    }
    
    // Function to display products in the container
    function displayProducts(products) {
        if (!productsContainer) return;
        
        // Clear existing products
        productsContainer.innerHTML = '';
        
        if (products.length === 0) {
            // Display no results message
            const noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-results-message';
            noResultsMessage.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>We couldn't find any products matching "${searchInput.value}"</p>
                <button class="clear-search">Clear Search</button>
            `;
            
            productsContainer.appendChild(noResultsMessage);
            
            // Add event listener to clear search button
            const clearButton = noResultsMessage.querySelector('.clear-search');
            clearButton.addEventListener('click', function() {
                searchInput.value = '';
                loadAllProducts();
            });
            
            return;
        }
        
        // Display products
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-product-id', product._id); // Store product ID for like functionality
            
            // Create HTML for product card
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="images/products/${product.image}" alt="${product.name}">
                    ${product.tag ? `<div class="product-tag ${product.tag.toLowerCase()}">${product.tag}</div>` : ''}
                    <div class="product-actions">
                        <button class="like-button"><i class="far fa-heart"></i></button>
                        <button class="quick-view"><i class="fas fa-eye"></i></button>
                        <button class="add-to-cart"><i class="fas fa-shopping-cart"></i></button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-bottom">
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <div class="product-rating">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                            <span>(${product.likes})</span>
                        </div>
                    </div>
                </div>
            `;
            
            productsContainer.appendChild(productCard);
            
            // Add event listener for like button
            const likeButton = productCard.querySelector('.like-button');
            likeButton.addEventListener('click', function() {
                // Toggle heart icon
                const heartIcon = this.querySelector('i');
                heartIcon.classList.toggle('far');
                heartIcon.classList.toggle('fas');
                heartIcon.classList.toggle('liked');
                
                // Send like request to API
                likeProduct(product._id);
            });
            
            // Add event listener for quick view button
            const quickViewButton = productCard.querySelector('.quick-view');
            quickViewButton.addEventListener('click', function() {
                openQuickView(product);
            });
            
            // Add event listener for add to cart button
            const addToCartButton = productCard.querySelector('.add-to-cart');
            addToCartButton.addEventListener('click', function() {
                addToCart(product);
            });
        });
        
        // Reattach event listeners for newly created buttons
        attachEventListeners();
    }
    
    // Function to display error message
    function displayErrorMessage(message) {
        if (!productsContainer) return;
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        `;
        
        productsContainer.innerHTML = '';
        productsContainer.appendChild(errorMessage);
    }
    
    // Function to send like request to API
    function likeProduct(productId) {
        fetch('/api/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: productId }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Product liked:', data);
            
            // Update the likes count in the UI
            const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
            if (productCard) {
                const likesSpan = productCard.querySelector('.product-rating span');
                if (likesSpan) {
                    likesSpan.textContent = `(${data.likes})`;
                }
            }
        })
        .catch(error => {
            console.error('Error liking product:', error);
        });
    }
    
    // Function to open quick view modal
    function openQuickView(product) {
        const quickViewModal = document.getElementById('quick-view-modal');
        if (!quickViewModal) return;
        
        // Update modal with product information
        const modalImage = document.getElementById('modal-product-image');
        const modalName = document.getElementById('modal-product-name');
        const modalPrice = document.getElementById('modal-product-price');
        const modalDescription = document.getElementById('modal-product-description');
        const modalSku = document.getElementById('modal-sku');
        const modalCategory = document.getElementById('modal-category');
        const modalTags = document.getElementById('modal-tags');
        
        if (modalImage) modalImage.src = `images/products/${product.image}`;
        if (modalName) modalName.textContent = product.name;
        if (modalPrice) modalPrice.textContent = `$${product.price.toFixed(2)}`;
        if (modalDescription) modalDescription.textContent = product.description;
        if (modalSku) modalSku.textContent = `BRK-${product.name.substring(4, 6).toUpperCase()}-00${product._id.substring(0, 1)}`;
        if (modalCategory) modalCategory.textContent = product.category;
        if (modalTags) modalTags.textContent = product.tags ? product.tags.join(', ') : '';
        
        // Show modal
        quickViewModal.style.display = 'block';
    }
    
    // Function to add product to cart
    function addToCart(product) {
        // In a real implementation, this would add the product to a cart object or send to backend
        console.log('Added to cart:', product);
        
        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            let currentCount = parseInt(cartCount.textContent);
            currentCount++;
            cartCount.textContent = currentCount;
        }
        
        // Show success message
        const message = document.createElement('div');
        message.className = 'cart-message';
        message.innerHTML = '<i class="fas fa-check"></i> Added to cart!';
        document.body.appendChild(message);
        
        // Show and hide message with animation
        setTimeout(() => {
            message.classList.add('active');
            
            setTimeout(() => {
                message.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(message);
                }, 300);
            }, 2000);
        }, 10);
    }
    
    // Filter functionality
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortBy = document.getElementById('sort-by');
    
    // Add event listeners to filter controls
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', applyFilters);
    }
    
    // Function to apply filters
    function applyFilters() {
        // Get filter values
        const category = categoryFilter ? categoryFilter.value : 'all';
        const priceRange = priceFilter ? priceFilter.value : 'all';
        const sortOption = sortBy ? sortBy.value : 'popularity';
        
        // Construct API URL with filters
        let apiUrl = '/api/products';
        
        // Add category filter
        if (category !== 'all') {
            apiUrl = `/api/products/category/${category}`;
        }
        
        // Add sort parameter
        let sortParam = '';
        let sortOrder = 1; // ascending
        
        switch (sortOption) {
            case 'price-low':
                sortParam = 'price';
                sortOrder = 1;
                break;
            case 'price-high':
                sortParam = 'price';
                sortOrder = -1;
                break;
            case 'popularity':
                sortParam = 'likes';
                sortOrder = -1;
                break;
            case 'newest':
                // For demo purposes, we'll sort by ID which is roughly insertion order
                sortParam = '_id';
                sortOrder = -1;
                break;
        }
        
        // Add sort parameters to URL
        if (sortParam) {
            apiUrl += `?sort_by=${sortParam}&sort_order=${sortOrder}`;
        }
        
        // Fetch filtered products
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(products => {
                // Apply price filter on client-side (since the API doesn't support it directly)
                if (priceRange !== 'all') {
                    products = filterByPrice(products, priceRange);
                }
                
                // Update products display
                displayProducts(products);
            })
            .catch(error => {
                console.error('Error applying filters:', error);
                displayErrorMessage("There was a problem filtering products. Please try again later.");
            });
    }
    
    // Function to filter products by price on client-side
    function filterByPrice(products, priceRange) {
        return products.filter(product => {
            const price = product.price;
            
            switch (priceRange) {
                case 'under-50':
                    return price < 50;
                case '50-100':
                    return price >= 50 && price <= 100;
                case '100-150':
                    return price > 100 && price <= 150;
                case 'over-150':
                    return price > 150;
                default:
                    return true;
            }
        });
    }
    
    // Function to attach event listeners to dynamically created elements
    function attachEventListeners() {
        // Attach event listeners to like buttons
        document.querySelectorAll('.like-button').forEach(button => {
            button.addEventListener('click', function() {
                const productCard = this.closest('.product-card');
                const productId = productCard.getAttribute('data-product-id');
                
                // Toggle heart icon
                const heartIcon = this.querySelector('i');
                heartIcon.classList.toggle('far');
                heartIcon.classList.toggle('fas');
                
                // Send like request to API
                if (productId) {
                    likeProduct(productId);
                }
            });
        });
        
        // Attach event listeners to quick view buttons
        document.querySelectorAll('.quick-view').forEach(button => {
            button.addEventListener('click', function() {
                const productCard = this.closest('.product-card');
                const productId = productCard.getAttribute('data-product-id');
                
                // Get product details from API
                if (productId) {
                    fetch(`/api/products/${productId}`)
                        .then(response => response.json())
                        .then(product => {
                            openQuickView(product);
                        })
                        .catch(error => {
                            console.error('Error fetching product details:', error);
                        });
                }
            });
        });
    }
    
    // Add CSS for error message
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            padding: 40px 20px;
            background-color: #f8d7da;
            border-radius: 8px;
            margin: 20px 0;
            grid-column: 1 / -1;
            text-align: center;
            color: #721c24;
        }
        
        .error-message i {
            font-size: 3rem;
            margin-bottom: 15px;
        }
        
        .no-results-message {
            text-align: center;
            padding: 40px 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            margin: 20px 0;
            grid-column: 1 / -1;
        }
        
        .no-results-message i {
            font-size: 3rem;
            color: #b2bec3;
            margin-bottom: 15px;
        }
        
        .no-results-message h3 {
            margin-bottom: 10px;
            font-size: 1.3rem;
        }
        
        .no-results-message p {
            color: #636e72;
            margin-bottom: 20px;
        }
        
        .clear-search {
            background-color: var(--primary-color);
            color: white;
            padding: 8px 20px;
            border-radius: 4px;
            font-family: 'Poppins', sans-serif;
        }
        
        .clear-search:hover {
            background-color: #ff5252;
        }
        
        .cart-message {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #2ecc71;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .cart-message.active {
            transform: translateX(0);
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
});