// JavaScript for the products page functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Load all products on page load
    loadAllProducts();
    
    // Product search functionality
    const searchInput = document.getElementById('product-search');
    const searchButton = document.getElementById('search-button');
    const productsContainer = document.getElementById('products-container');
    
    // Filter functionality
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortBy = document.getElementById('sort-by');
    
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

     function setFiltersFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        // If category parameter exists in URL, set the category filter
        if (categoryParam && categoryFilter) {
            // Find the option that matches the category
            for (let i = 0; i < categoryFilter.options.length; i++) {
                if (categoryFilter.options[i].value === categoryParam) {
                    categoryFilter.selectedIndex = i;
                    break;
                }
            }
            
            // After setting the filter, apply it to show filtered products
            applyFilters();
        }
    }
    
    // Now call setFiltersFromURL after everything is defined
    setFiltersFromURL();

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
                        <p class="product-price">€${product.price.toFixed(2)}</p>
                        <div class="product-rating">
                            <span class="stars-container"></span>
                            <span>(${product.likes || 0})</span>
                        </div>
                    </div>
                </div>
            `;
            
            productsContainer.appendChild(productCard);
            
            // Update stars display for this product
            const starsContainer = productCard.querySelector('.stars-container');
            if (starsContainer) {
                const starRating = calculateStarRating(product.likes || 0);
                updateStarsDisplay(starsContainer, starRating);
            }
            
            // Add event listeners for this card
            addEventListenersToProductCard(productCard, product);
        });
        
        // Make the product cards clickable
        makeProductCardsClickable();

        
    }
    
    // Function to add event listeners to a product card
    function addEventListenersToProductCard(productCard, product) {
        // Add event listener for like button
        const likeButton = productCard.querySelector('.like-button');
        if (likeButton) {
            likeButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent card click
                // Toggle heart icon
                const heartIcon = this.querySelector('i');
                heartIcon.classList.toggle('far');
                heartIcon.classList.toggle('fas');
                heartIcon.classList.toggle('liked');
                
                // Send like request to API
                likeProduct(product._id);
            });
        }
        
        // Add event listener for quick view button
        const quickViewButton = productCard.querySelector('.quick-view');
        if (quickViewButton) {
            quickViewButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Prevent card click
                
                // Get product information
                const productImage = productCard.querySelector('.product-image img').src;
                const productName = productCard.querySelector('h3').textContent;
                
                // Show image modal
                showImageModal(productImage, productName);
            });
        }
        
        // Add event listener for add to cart button
        const addToCartButton = productCard.querySelector('.add-to-cart');
        if (addToCartButton) {
            addToCartButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent card click
                addToCart(product);
            });
        }
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
    
 // Function to send like request to API and update UI in products.js
function likeProduct(productId) {
    console.log("Liking product:", productId);
    
    // Send API request
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
        console.log('API response:', data);
        
        // IMPORTANT: Update the correct element for likes
        const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
        if (productCard) {
            // Update like button
            const likeButton = productCard.querySelector('.like-button');
            if (likeButton) {
                likeButton.style.pointerEvents = 'none';
                likeButton.style.opacity = '0.6';
                likeButton.disabled = true;
                
                // Update heart icon
                const heartIcon = likeButton.querySelector('i');
                if (heartIcon) {
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas', 'liked');
                }
            }
            
            // IMPORTANT: Make sure we're updating the correct element
            // This should be inside the .product-rating div, not near the price
            const ratingContainer = productCard.querySelector('.product-rating');
            if (ratingContainer) {
                const likesSpan = ratingContainer.querySelector('span:last-child');
                if (likesSpan) {
                    likesSpan.textContent = `(${data.likes})`;
                    
                    // Also update the stars if needed
                    const starsContainer = ratingContainer.querySelector('.stars-container');
                    if (starsContainer) {
                        const starRating = calculateStarRating(data.likes);
                        updateStarsDisplay(starsContainer, starRating);
                    }
                }
            }
        }
        
        showNotification('Thank you for liking this product!', 'success');
    })
    .catch(error => {
        console.error('API error:', error);
        showNotification('Failed to like product. Please try again.', 'error');
    });
}
    
    // Function to add product to cart
    function addToCart(product) {
        // In a real implementation, this would add the product to a cart object or send to backend
        console.log('Added to cart:', product);
        
        // Get cart from localStorage or initialize
        let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
        
        // Create cart item
        const cartItem = {
            id: product._id,
            name: product.name,
            price: product.price,
            image: `images/products/${product.image}`,
            size: '41', // Default size
            quantity: 1
        };
        
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
        
        if (existingItemIndex > -1) {
            // Update quantity if item exists
            cart[existingItemIndex].quantity++;
        } else {
            // Add new item
            cart.push(cartItem);
        }
        
        // Save to localStorage
        localStorage.setItem('brkCart', JSON.stringify(cart));
        
        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            let currentCount = parseInt(cartCount.textContent);
            currentCount++;
            cartCount.textContent = currentCount;
        }
        
        // Show success message
        showAddedToCartMessage();
    }
    
    // Function to show "Added to cart" message
    function showAddedToCartMessage() {
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
    
    // Function to make product cards clickable to navigate to product detail page
    function makeProductCardsClickable() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            // Get product info
            const productId = card.getAttribute('data-product-id');
            
            // Make the card clickable (except for buttons)
            card.addEventListener('click', function(e) {
                // Don't trigger navigation if clicking on buttons within the card
                if (e.target.closest('.product-actions') || 
                    e.target.tagName === 'BUTTON' || 
                    e.target.closest('button')) {
                    return;
                }
                
                // Navigate to product detail page
                window.location.href = `product-detail.html?product_id=${productId}`;
            });
            
            // Add cursor pointer to indicate card is clickable
            card.style.cursor = 'pointer';
        });
    }
    
    // Function to show image modal with larger product image
    function showImageModal(imageSrc, productName) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        
        // Create modal content
        modal.innerHTML = `
            <div class="image-modal-content">
                <span class="close-modal">&times;</span>
                <img src="${imageSrc}" alt="${productName}">
                <h3>${productName}</h3>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close modal when X is clicked
        const closeButton = modal.querySelector('.close-modal');
        closeButton.addEventListener('click', function() {
            closeImageModal(modal);
        });
        
        // Close modal when clicking outside the content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal(modal);
            }
        });
        
        // Close modal when ESC key is pressed
        document.addEventListener('keydown', function escFunction(e) {
            if (e.key === 'Escape') {
                closeImageModal(modal);
                document.removeEventListener('keydown', escFunction);
            }
        });
    }
    
    // Function to close image modal with animation
    function closeImageModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    }
    
    // Add CSS for image modal
    function addImageModalStyles() {
        if (document.getElementById('image-modal-styles')) {
            return; // Styles already added
        }
        
        const style = document.createElement('style');
        style.id = 'image-modal-styles';
        style.textContent = `
            .image-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s, visibility 0.3s;
            }
            
            .image-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .image-modal-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
                background-color: white;
                border-radius: 8px;
                overflow: hidden;
                transform: scale(0.9);
                transition: transform 0.3s;
            }
            
            .image-modal.active .image-modal-content {
                transform: scale(1);
            }
            
            .image-modal-content img {
                max-width: 100%;
                max-height: 80vh;
                display: block;
                object-fit: contain;
            }
            
            .image-modal-content h3 {
                padding: 15px;
                margin: 0;
                text-align: center;
                border-top: 1px solid #eee;
            }
            
            .image-modal .close-modal {
                position: absolute;
                top: 10px;
                right: 15px;
                font-size: 1.5rem;
                color: white;
                cursor: pointer;
                z-index: 10;
                background-color: rgba(0, 0, 0, 0.3);
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add image modal styles
    addImageModalStyles();
    updateAllProductRatings();
});

/**
 * Update stars display based on rating
 * @param {HTMLElement} container - Container element for stars
 * @param {number} rating - Rating value (0-5)
 */
function updateStarsDisplay(container, rating) {
    if (!container) return;
    
    // Clear existing stars
    container.innerHTML = '';
    
    // Add full stars
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
        const star = document.createElement('i');
        star.className = 'fas fa-star';
        container.appendChild(star);
    }
    
    // Add half star if needed
    const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
    if (hasHalfStar) {
        const halfStar = document.createElement('i');
        halfStar.className = 'fas fa-star-half-alt';
        container.appendChild(halfStar);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        const emptyStar = document.createElement('i');
        emptyStar.className = 'far fa-star';
        container.appendChild(emptyStar);
    }
}

/**
 * Calculate star rating based on likes - SIMPLIFIED VERSION
 * 1 like = 1 star (starting point)
 * Every 3 likes adds 0.5 stars
 * 30+ likes = full 5 stars
 * @param {number} likes - Number of product likes
 * @returns {number} Star rating from 0-5
 */
function calculateStarRating(likes) {
    if (likes === 0) return 0;
    if (likes >= 30) return 5;
    
    // Start with 1 star, add 0.5 for every 3 likes
    const rating = 1 + Math.floor(likes / 3) * 0.5;
    
    return Math.min(5, rating);
}

// In products.js file
function updateAllProductRatings() {
    // Find all product rating containers
    const ratingContainers = document.querySelectorAll('.product-rating');
    
    ratingContainers.forEach(container => {
        // Find the likes count from the span
        const likesSpan = container.querySelector('span');
        if (!likesSpan) return;
        
        // Extract likes count from the span text, e.g. "(24)" -> 24
        const likesMatch = likesSpan.textContent.match(/\((\d+)\)/);
        if (!likesMatch) return;
        
        const likes = parseInt(likesMatch[1]);
        
        // Create a new container for stars
        const starsContainer = document.createElement('span');
        starsContainer.className = 'stars-container';
        
        // Insert the stars container before the likes span
        container.insertBefore(starsContainer, likesSpan);
        
        // Remove the old star icons (all i elements)
        const oldStars = container.querySelectorAll('i.fa-star, i.fa-star-half-alt');
        oldStars.forEach(star => star.remove());
        
        // Calculate star rating based on likes
        const starRating = calculateStarRating(likes);
        
        // Update the stars display
        updateStarsDisplay(starsContainer, starRating);
    });
}