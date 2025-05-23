/**
 * Product Detail Page JavaScript
 * Handles all product detail page functionality including:
 * - Image gallery
 * - Size and color selection
 * - Quantity controls
 * - Tab switching
 * - Add to cart
 * - Loading product data from API
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product_id');
    
    if (productId) {
        // Load product data
        loadProductDetails(productId);
    } else {
        console.warn('No product ID provided in URL');
    }
    
    // Initialize image gallery
    initImageGallery();
    
    // Initialize size and color selection
    initSizeSelection();
    initColorSelection();
    
    // Initialize quantity controls
    initQuantityControls();
    
    // Initialize tab switching
    initTabs();
    
    // Initialize add to cart functionality
    initAddToCart();

    // Initialize wishlist button
    initWishlistButton();
});

function loadProductDetails(productId) {
    // Show loading state
    showLoading(true);
    
    // Check if productId is a valid MongoDB ObjectId (24-character hex string)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productId);
    
    let apiUrl = '';
    if (isValidObjectId) {
        apiUrl = `/api/products/${productId}`;
    } else {
        // For demo products that might use product-1, product-2 format
        if (productId.startsWith('product-')) {
            // Use sample product or index-based endpoint
            const productIndex = productId.replace('product-', '');
            apiUrl = `/api/products?product_index=${productIndex}`;
        } else {
            // Fallback
            useSampleProductData(productId);
            return; // Exit early since we're using sample data
        }
    }
    
    console.log("Fetching product from:", apiUrl);
    
    // Fetch product details from API
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(product => {
            if (!product) {
                throw new Error('Product data is empty');
            }
            
            console.log("Received product data:", product);
            updateProductUI(product);
            showLoading(false);
            
            // Add this product to recently viewed
            addToRecentlyViewed(product._id);
            
            // Load related products
            loadRelatedProducts(product.category, product._id);
            
            // Load recently viewed products
            loadRecentlyViewedProducts(product._id);
        })
        .catch(error => {
            console.error('Error loading product details:', error);
            showLoading(false);
            
            // Use sample data as fallback
            useSampleProductData(productId);
        });
}

// Fallback function to use sample product data when API fails
function useSampleProductData(productId) {
    // Extract product number if format is "product-X"
    const productNum = productId.includes('-') ? 
        parseInt(productId.split('-')[1]) : 1;
    
    // Sample product data
    const sampleProduct = {
        _id: productId,
        name: `BRK Sample Product ${productNum}`,
        description: "This is a sample product when API data is not available.",
        price: 99.99,
        currency: "€",
        category: "sample",
        image: `product${productNum}.jpg`,
        photos: [`product${productNum}.jpg`, `product${productNum}-2.jpg`],
        likes: Math.floor(Math.random() * 30),
        sizes: [38, 39, 40, 41, 42, 43, 44],
        tags: ["sample", "demo", "placeholder"]
    };
    
    // Update UI with sample data
    updateProductUI(sampleProduct);
    
    // Show a warning that this is sample data
    const container = document.querySelector('.product-detail-container');
    if (container) {
        const warning = document.createElement('div');
        warning.className = 'sample-data-warning';
        warning.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Using sample data: API connection failed.';
        container.prepend(warning);
    }
}

/**
 * Update UI with product details
 * @param {Object} product - Product data from API
 */
function updateProductUI(product) {
    console.log('Updating UI with product:', product);
    
    // Update page title
    document.title = `BRK Sneakers - ${product.name}`;
    
    // Update breadcrumb
    const breadcrumbName = document.getElementById('product-breadcrumb-name');
    if (breadcrumbName) {
        breadcrumbName.textContent = product.name;
    }

    // Update category breadcrumb
    const categoryBreadcrumb = document.getElementById('product-category-breadcrumb');
    if (categoryBreadcrumb && product.category) {
        // Get the first category if it's an array
        let displayCategory = Array.isArray(product.category) ? product.category[0] : product.category;
        
        // Capitalize first letter
        displayCategory = displayCategory.charAt(0).toUpperCase() + displayCategory.slice(1);
        
        // Update text and href
        categoryBreadcrumb.textContent = displayCategory;
        categoryBreadcrumb.href = `products.html?category=${Array.isArray(product.category) ? product.category[0] : product.category}`;
    }

    
    // Update product name
    const productName = document.getElementById('product-name');
    if (productName) {
        productName.textContent = product.name;
    }
    
    // Update product images
    updateProductImages(product.photos || [product.image]);
    
    // Update product rating based on likes
    updateProductRating(product.likes || 0);
    
    // FIX: Use querySelector with class selector instead of getElementById
    const priceElement = document.querySelector('.product-price');
    if (priceElement) {
        const currentPrice = priceElement.querySelector('.current-price');
        if (currentPrice) {
            // Ensure we have a valid price
            const price = typeof product.price === 'number' ? product.price : 
                           parseFloat(product.price) || 99.99;
            
            // Format price with currency symbol
            currentPrice.textContent = `${product.currency || '€'}${price.toFixed(2)}`;
            console.log("Updated price element to:", currentPrice.textContent);
        } else {
            console.error('Current price element not found within price container');
            // Try to create it if it doesn't exist
            priceElement.innerHTML = `<span class="current-price">${product.currency || '€'}${product.price.toFixed(2)}</span>`;
        }
    } else {
        console.error('Product price element not found with class .product-price');
        // Let's log all available elements for debugging
        console.log("Available elements:", {
            productInfo: document.querySelector('.product-information'),
            allPriceElements: document.querySelectorAll('[class*="price"]')
        });
    }
    
    // Update product description
    const descriptionElement = document.getElementById('product-description');
    if (descriptionElement) {
        descriptionElement.textContent = product.description;
    }
    
    // Update sizes
    updateSizes(product.sizes || []);
    
    // Update product meta information
    const skuElement = document.getElementById('product-sku');
    if (skuElement) {
        skuElement.textContent = product._id || 'BRK-001';
    }
    
    const categoryElement = document.getElementById('product-category');
    if (categoryElement) {
        categoryElement.textContent = product.category || 'Sneakers';
    }
    
    const tagsElement = document.getElementById('product-tags');
    if (tagsElement) {
        tagsElement.textContent = product.tags ? product.tags.join(', ') : '';
    }
    
    // Update the detailed description tab
    const descriptionTab = document.getElementById('description');
    if (descriptionTab) {
        // Keep the heading
        const heading = descriptionTab.querySelector('h3');
        let descriptionHTML = '';
        
        if (heading) {
            descriptionHTML += heading.outerHTML;
        }
        
        // Add description
        descriptionHTML += `<p>${product.description}</p>`;
        
        // Add detailed description if available
        if (product.details) {
            descriptionHTML += `<p>${product.details}</p>`;
        }
        
        // Add features list if available
        if (product.features && product.features.length > 0) {
            descriptionHTML += '<ul class="product-features">';
            product.features.forEach(feature => {
                descriptionHTML += `<li><i class="fas fa-check"></i> ${feature}</li>`;
            });
            descriptionHTML += '</ul>';
        }
        
        descriptionTab.innerHTML = descriptionHTML;
    }
    
    // Update specifications tab
    const specsTab = document.getElementById('specifications');
    if (specsTab && product.specs) {
        // Keep the heading
        const heading = specsTab.querySelector('h3');
        let specsHTML = '';
        
        if (heading) {
            specsHTML += heading.outerHTML;
        }
        
        // Add specifications table
        specsHTML += '<table class="specifications-table">';
        
        for (const [key, value] of Object.entries(product.specs)) {
            specsHTML += `
                <tr>
                    <th>${key}</th>
                    <td>${value}</td>
                </tr>
            `;
        }
        
        specsHTML += '</table>';
        specsTab.innerHTML = specsHTML;
    }
    
    // Update reviews tab to show likes instead
    const reviewsTab = document.getElementById('reviews');
    if (reviewsTab) {
        // Update heading
        const heading = reviewsTab.querySelector('h3');
        if (heading) {
            heading.textContent = 'Product Popularity';
        }
        
        // Update average rating based on likes
        const ratingNumber = reviewsTab.querySelector('.rating-number');
        if (ratingNumber) {
            // Convert likes to a 0-5 scale for display purposes
            // This is just for visualization since we don't have actual ratings
            const likesRating = Math.min(5, Math.max(0, Math.log10(product.likes + 1) * 2.5)).toFixed(1);
            ratingNumber.textContent = likesRating;
        }
        
        // Update review count text
        const reviewCount = reviewsTab.querySelector('.review-count');
        if (reviewCount) {
            reviewCount.textContent = `Based on ${product.likes} likes`;
        }
    }
}

/**
 * Update product images in gallery
 * @param {Array} photos - Array of product photo filenames
 */
function updateProductImages(photos) {
    // Update main image
    const mainImage = document.getElementById('main-product-image');
    if (mainImage && photos.length > 0) {
        mainImage.src = `images/products/${photos[0]}`;
        mainImage.alt = document.getElementById('product-name')?.textContent || 'Product Image';
    }
    
    // Update thumbnail gallery
    const thumbnailGallery = document.querySelector('.thumbnail-gallery');
    if (thumbnailGallery && photos.length > 0) {
        // Clear existing thumbnails
        thumbnailGallery.innerHTML = '';
        
        // Add thumbnails for each photo
        photos.forEach((photo, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.setAttribute('data-img', `images/products/${photo}`);
            
            thumbnail.innerHTML = `<img src="images/products/${photo}" alt="Thumbnail ${index + 1}">`;
            thumbnailGallery.appendChild(thumbnail);
        });
        
        // Reinitialize thumbnail click events
        initImageGallery();
    }
}

/**
 * Update available sizes
 * @param {Array} sizes - Array of available sizes (EU)
 */
function updateSizes(sizes) {
    const sizeOptions = document.querySelector('.size-options');
    if (sizeOptions && sizes.length > 0) {
        // Clear existing size buttons
        sizeOptions.innerHTML = '';
        
        // Add size buttons for each available size
        sizes.forEach((size, index) => {
            const sizeBtn = document.createElement('button');
            sizeBtn.className = `size-btn ${index === 0 ? 'active' : ''}`;
            sizeBtn.textContent = size;
            sizeOptions.appendChild(sizeBtn);
        });
        
        // Reinitialize size selection
        initSizeSelection();
    }
}

/**
 * Show/hide loading state
 * @param {boolean} isLoading - Whether loading state should be shown
 */
function showLoading(isLoading) {
    // Remove existing loading indicator if any
    const existingIndicator = document.querySelector('.loading-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    if (isLoading) {
        // Create loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        
        // Add to container
        const container = document.querySelector('.product-detail-container');
        if (container) {
            // Hide container temporarily
            container.style.opacity = '0.5';
            
            // Insert loading indicator before container
            container.parentNode.insertBefore(loadingIndicator, container);
        } else {
            // If container doesn't exist yet, add to product detail section
            const section = document.querySelector('.product-detail-section');
            if (section) {
                section.insertBefore(loadingIndicator, section.firstChild);
            }
        }
    } else {
        // Show container again
        const container = document.querySelector('.product-detail-container');
        if (container) {
            container.style.opacity = '1';
        }
    }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
    `;
    
    // Insert error message at the top of the product detail section
    const container = document.querySelector('.product-detail-container');
    if (container) {
        container.parentNode.insertBefore(errorDiv, container);
    }
}

function initImageGallery() {
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (!mainImage || thumbnails.length === 0) {
        console.error('Missing elements for gallery functionality');
        return;
    }
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Get image source from data attribute
            const imageSrc = this.getAttribute('data-image');
            if (imageSrc && mainImage) {
                // Update main image
                mainImage.src = imageSrc;
                
                // Update active thumbnail
                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    console.log('Gallery functionality initialized');
}

/**
 * Initialize size selection
 */
function initSizeSelection() {
    // Get all size buttons
    const sizeButtons = document.querySelectorAll('.size-btn');
    
    // Add click event to size buttons
    sizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active size
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

/**
 * Initialize color selection
 */
function initColorSelection() {
    // Get all color buttons
    const colorButtons = document.querySelectorAll('.color-btn');
    const selectedColorText = document.getElementById('selected-color-text');
    
    // Add click event to color buttons
    colorButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active color
            colorButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update selected color text
            if (selectedColorText) {
                const colorName = this.getAttribute('data-color') || 'Blue';
                selectedColorText.textContent = colorName;
            }
        });
    });
}

/**
 * Initialize quantity controls
 */
function initQuantityControls() {
    // Get quantity input and buttons
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    
    // Remove any existing event listeners to prevent duplication
    if (minusBtn) {
        const newMinusBtn = minusBtn.cloneNode(true);
        minusBtn.parentNode.replaceChild(newMinusBtn, minusBtn);
        
        // Add click event to minus button
        newMinusBtn.addEventListener('click', function() {
            let quantity = parseInt(quantityInput.value) || 1;
            if (quantity > 1) {
                quantityInput.value = quantity - 1;
            }
        });
    }
    
    if (plusBtn) {
        const newPlusBtn = plusBtn.cloneNode(true);
        plusBtn.parentNode.replaceChild(newPlusBtn, plusBtn);
        
        // Add click event to plus button
        newPlusBtn.addEventListener('click', function() {
            let quantity = parseInt(quantityInput.value) || 1;
            if (quantity < 10) {
                quantityInput.value = quantity + 1;
            }
        });
    }
    
    // Add change event to quantity input
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            let quantity = parseInt(this.value);
            if (isNaN(quantity) || quantity < 1) {
                this.value = 1;
            } else if (quantity > 10) {
                this.value = 10;
            }
        });
    }
    
    console.log('Quantity controls initialized');
}

/**
 * Initialize tab switching
 */
function initTabs() {
    // Get all tab buttons and panes
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Add click event to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get tab ID from data attribute
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show the corresponding tab pane
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === tabId) {
                    pane.classList.add('active');
                }
            });
        });
    });
}

function initAddToCart() {
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
    if (!addToCartBtn) {
        console.error('Add to cart button not found');
        return;
    }
    
    // Clear any existing event listeners by cloning and replacing
    const newAddToCartBtn = addToCartBtn.cloneNode(true);
    addToCartBtn.parentNode.replaceChild(newAddToCartBtn, addToCartBtn);
    
    // Add a single new event listener
    newAddToCartBtn.addEventListener('click', function(e) {
        console.log('Add to cart button clicked');
        e.preventDefault();
        e.stopPropagation();
        
        // Get product information
        const productId = new URLSearchParams(window.location.search).get('product_id') || 'sample-product';
        
        // Check if elements exist before trying to access them
        const productNameElement = document.getElementById('product-name');
        const productPriceElement = document.querySelector('.current-price');
        const productImageElement = document.getElementById('main-product-image');
        
        if (!productNameElement || !productPriceElement || !productImageElement) {
            console.error('Required product elements not found');
            return;
        }
        
        const productName = productNameElement.textContent;
        const productPrice = productPriceElement.textContent.replace(/[^0-9.]/g, '');
        const productImage = productImageElement.src;
        
        // Get selected size
        const selectedSizeBtn = document.querySelector('.size-btn.active');
        
        if (!selectedSizeBtn) {
            showNotification('Please select a size before adding to cart.', 'warning');
            return;
        }
        
        const selectedSize = selectedSizeBtn.textContent;
        
        // Get quantity directly from the input element's value
        const quantityInput = document.getElementById('quantity');
        let quantity = 1; // default
        if (quantityInput) {
            quantity = parseInt(quantityInput.value);
            if (isNaN(quantity) || quantity < 1) {
                quantity = 1;
            }
        }
        
        console.log('Adding to cart with quantity:', quantity);
        
        // Create cart item object
        const cartItem = {
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            image: productImage,
            size: selectedSize,
            quantity: quantity
        };
        
        // Get current cart from localStorage
        let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
        console.log('Current cart before update:', JSON.parse(JSON.stringify(cart)));
        
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item => 
            item.id === cartItem.id && item.size === cartItem.size);
        
        if (existingItemIndex > -1) {
            // Update quantity if item exists - REPLACE, don't add
            cart[existingItemIndex].quantity = cart[existingItemIndex].quantity + quantity;
            console.log('Updated existing item, new quantity:', cart[existingItemIndex].quantity);
        } else {
            // Add new item if it doesn't exist
            cart.push(cartItem);
            console.log('Added new item with quantity:', quantity);
        }
        
        // Save cart to localStorage
        localStorage.setItem('brkCart', JSON.stringify(cart));
        console.log('Updated cart:', JSON.parse(JSON.stringify(cart)));
        
        // Update cart count in header
        updateCartCount();
        
        // Show success message
        showAddedToCartMessage();
        
        // If cart sidebar is open, update it
        const cartSidebar = document.querySelector('.cart-sidebar');
        if (cartSidebar && typeof updateCartSidebar === 'function') {
            updateCartSidebar(cartSidebar, cart);
        }
    });
    
    console.log('Add to cart functionality initialized');
}

// Function to update cart count in header - simplified
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    const cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    console.log('Updating cart count to:', totalItems);
    cartCount.textContent = totalItems;
}

/**
 * Add item to cart
 * @param {Object} item - Item to add to cart
 */
function addToCart(item) {
    // Get existing cart or initialize empty array
    let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(cartItem => 
        cartItem.id === item.id && cartItem.size === item.size);
    
    if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += item.quantity;
    } else {
        // Add new item if it doesn't exist
        cart.push(item);
    }
    
    // Save cart to localStorage
     localStorage.setItem('brkCart', JSON.stringify(cart));
    
    // Update cart count in header
    updateCartCount();
}


/**
 * Add item to cart and update UI
 * @param {Object} item - Cart item to add
 */
function addToCartAndUpdateUI(item) {
    // Get existing cart from localStorage or create new cart
    let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(cartItem => 
        cartItem.id === item.id && 
        cartItem.size === item.size && 
        cartItem.color === item.color
    );
    
    if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += item.quantity;
    } else {
        // Add new item if it doesn't exist
        cart.push(item);
    }
    
    // Save cart to localStorage
    localStorage.setItem('brkCart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showAddedToCartMessage();
}

/**
 * Update cart count in header
 */
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    const cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

/**
 * Show "Added to cart" message
 */
function showAddedToCartMessage() {
    const message = document.createElement('div');
    message.className = 'cart-message';
    message.innerHTML = '<i class="fas fa-check"></i> Added to cart!';
    document.body.appendChild(message);
    
    // Add active class after a brief delay (for animation)
    setTimeout(() => {
        message.classList.add('active');
    }, 10);
    
    // Remove the message after animation completes
    setTimeout(() => {
        message.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 300);
    }, 2000);
}

function initZoom() {
    const mainImage = document.getElementById('main-product-image');
    const zoomModal = document.getElementById('image-zoom-modal');
    const zoomedImage = document.getElementById('zoomed-image');
    const closeButton = document.querySelector('.close-modal');
    const zoomHint = document.querySelector('.zoom-hint');
    
    if (!mainImage || !zoomModal || !zoomedImage) {
        console.error('Missing elements for zoom functionality');
        return;
    }
    
    // Add click event to main image
    mainImage.addEventListener('click', function() {
        zoomedImage.src = this.src;
        zoomModal.style.display = 'flex';
        setTimeout(() => {
            zoomModal.classList.add('active');
        }, 10);
        
        // Prevent scrolling on body
        document.body.style.overflow = 'hidden';
    });
    
    // Add click event to zoom hint
    if (zoomHint) {
        zoomHint.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Trigger the click on the main image
            mainImage.click();
        });
    }
    
    // Close modal when clicking close button
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            zoomModal.classList.remove('active');
            setTimeout(() => {
                zoomModal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        });
    }
    
    // Close modal when clicking outside the image
    zoomModal.addEventListener('click', function(e) {
        if (e.target === zoomModal) {
            zoomModal.classList.remove('active');
            setTimeout(() => {
                zoomModal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    });
    
    console.log('Zoom functionality initialized');
}

/**
 * Update product rating based on likes
 * @param {number} likes - Number of product likes
 */
function updateProductRating(likes) {
    const ratingElement = document.querySelector('.product-rating span');
    const likesCountElement = document.getElementById('likes-count');
    
    if (ratingElement) {
        ratingElement.textContent = `(${likes} likes)`;
    }
    
    if (likesCountElement) {
        likesCountElement.textContent = likes;
    }
    
    // Calculate star rating based on likes
    const MAX_STARS = 5;
    let starRating = 0;
    
    // Calculate a score from 0-5 based on likes
    if (likes === 0) {
        starRating = 0;
    } else if (likes <= 5) {
        starRating = 2.5 + (likes * 0.3); // Start at 2.5 stars for at least 1 like
    } else if (likes <= 20) {
        starRating = 4 + ((likes - 5) * 0.05); // Gradually increase to 5 stars
    } else {
        starRating = 5; // Max rating for 20+ likes
    }
    
    starRating = Math.min(5, Math.max(0, starRating)); // Keep between 0 and 5
    
    // Update stars in product page
    updateStarsDisplay('.product-rating .stars', starRating);
    
    // Update stars in reviews tab
    updateStarsDisplay('.average-rating .stars', starRating);
    
    // Update rating number
    const ratingNumber = document.querySelector('.rating-number');
    if (ratingNumber) {
        ratingNumber.textContent = starRating.toFixed(1);
    }
    
    // Update review count text
    const reviewCount = document.querySelector('.review-count');
    if (reviewCount) {
        reviewCount.textContent = `Based on ${likes} likes`;
    }
    
    // Update popularity bar
    const popularityBar = document.querySelector('.bar');
    if (popularityBar) {
        // Scale popularity based on likes (cap at 100%)
        const popularityPercentage = Math.min(100, likes === 0 ? 0 : 50 + (likes * 2));
        popularityBar.style.width = `${popularityPercentage}%`;
        
        // Update percentage text
        const barPercent = document.querySelector('.bar-percent');
        if (barPercent) {
            barPercent.textContent = `${Math.round(popularityPercentage)}%`;
        }
    }
}

/**
 * Update stars display based on rating
 * @param {string} selector - CSS selector for stars container
 * @param {number} rating - Rating value (0-5)
 */
function updateStarsDisplay(selector, rating) {
    const starsContainer = document.querySelector(selector);
    if (!starsContainer) return;
    
    // Clear existing stars
    starsContainer.innerHTML = '';
    
    // Add full stars
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
        const star = document.createElement('i');
        star.className = 'fas fa-star';
        starsContainer.appendChild(star);
    }
    
    // Add half star if needed
    const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
    if (hasHalfStar) {
        const halfStar = document.createElement('i');
        halfStar.className = 'fas fa-star-half-alt';
        starsContainer.appendChild(halfStar);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        const emptyStar = document.createElement('i');
        emptyStar.className = 'far fa-star';
        starsContainer.appendChild(emptyStar);
    }
}

// Add this at the end of your document ready function
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Initialize all functionality
    initImageGallery();
    console.log('Image gallery initialized');
    
    initSizeSelection();
    console.log('Size selection initialized');
    
    initQuantityControls();
    console.log('Quantity controls initialized');
    
    initTabs();
    console.log('Tabs initialized');
    
    initZoom();
    console.log('Zoom initialized');
    
    initAddToCart();
    console.log('Add to cart initialized');
    
    // Load product if ID exists in URL
    const productId = new URLSearchParams(window.location.search).get('product_id');
    if (productId) {
        loadProductDetails(productId);
        console.log('Loading product details for ID:', productId);
    } else {
        console.warn('No product ID in URL');
    }
});

/**
 * Load related products
 * @param {string} category - Category of the current product
 * @param {string} currentProductId - ID of the current product (to exclude from results)
 */
function loadRelatedProducts(category, currentProductId) {
    if (!category) {
        console.warn('No category provided for related products');
        return;
    }
    
    // Get products from the same category
    fetch(`/api/products/category/${category}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            if (!Array.isArray(products)) {
                console.warn('Invalid products data:', products);
                return;
            }
            
            // Filter out the current product
            const relatedProducts = products.filter(product => product._id !== currentProductId);
            
            // Take up to 4 related products
            const productsToShow = relatedProducts.slice(0, 4);
            
            // If we don't have enough products from the same category, get random products
            if (productsToShow.length < 4) {
                fetch(`/api/products`)
                    .then(response => response.json())
                    .then(allProducts => {
                        // Filter out current product and already selected related products
                        const remainingProducts = allProducts.filter(product => 
                            product._id !== currentProductId && 
                            !productsToShow.some(p => p._id === product._id)
                        );
                        
                        // Shuffle and get enough to fill up to 4 products
                        const randomProducts = shuffleArray(remainingProducts)
                            .slice(0, 4 - productsToShow.length);
                        
                        // Combine and display
                        displayRelatedProducts([...productsToShow, ...randomProducts]);
                    })
                    .catch(error => {
                        console.error('Error loading additional products:', error);
                        displayRelatedProducts(productsToShow);
                    });
            } else {
                displayRelatedProducts(productsToShow);
            }
        })
        .catch(error => {
            console.error('Error loading related products:', error);
        });
}

/**
 * Helper function to shuffle an array
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Display related products in the related products section
 * @param {Array} products - Array of product objects
 */
function displayRelatedProducts(products) {
    const container = document.querySelector('.related-products .products-grid');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add products to the container
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-product-id', product._id);
        
        // Create a div for stars that we can update with updateStarsDisplay
        const starsDiv = document.createElement('div');
        starsDiv.className = 'stars';
        
        // Add product card HTML structure
        productCard.innerHTML = `
            <div class="product-image">
                <img src="images/products/${product.image}" alt="${product.name}">
                <div class="product-actions">
                    <button class="like-button"><i class="far fa-heart"></i></button>
                    <button class="quick-view"><i class="fas fa-eye"></i></button>
                    <button class="add-to-cart"><i class="fas fa-shopping-cart"></i></button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description.substring(0, 60)}${product.description.length > 60 ? '...' : ''}</p>
                <div class="product-bottom">
                    <p class="product-price">${product.currency || '€'}${product.price.toFixed(2)}</p>
                    <div class="product-rating">
                        <span class="stars-container"></span>
                        <span>(${product.likes || 0})</span>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(productCard);
        
        // Use updateStarsDisplay to set the stars based on likes
        const starsContainer = productCard.querySelector('.stars-container');
        if (starsContainer) {
            // Calculate star rating based on likes
            const starRating = calculateStarRating(product.likes || 0);
            
            // Update stars display
            updateStarsDisplay(starsContainer, starRating);
        }
    });
    
    // Make product cards clickable
    makeProductCardsClickable(container.querySelectorAll('.product-card'));
}

/**
 * Add product ID to recently viewed list in localStorage
 * @param {string} productId - ID of the product being viewed
 */
function addToRecentlyViewed(productId) {
    // Get existing recently viewed products from localStorage
    let recentlyViewed = JSON.parse(localStorage.getItem('brkRecentlyViewed')) || [];
    
    // Remove this product if it already exists in the list
    recentlyViewed = recentlyViewed.filter(id => id !== productId);
    
    // Add this product to the beginning of the list
    recentlyViewed.unshift(productId);
    
    // Keep only the last 10 products
    recentlyViewed = recentlyViewed.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('brkRecentlyViewed', JSON.stringify(recentlyViewed));
}

/**
 * Load recently viewed products
 * @param {string} currentProductId - ID of the current product (to exclude from results)
 */
function loadRecentlyViewedProducts(currentProductId) {
    // Get recently viewed products from localStorage
    const recentlyViewed = JSON.parse(localStorage.getItem('brkRecentlyViewed')) || [];
    
    // Filter out the current product
    const filteredIds = recentlyViewed.filter(id => id !== currentProductId);
    
    // If no recently viewed products, hide the section
    if (filteredIds.length === 0) {
        const section = document.querySelector('.recently-viewed');
        if (section) {
            section.style.display = 'none';
        }
        return;
    }
    
    // Create an array to store products as they load
    const loadedProducts = [];
    let loadedCount = 0;
    
    // Function to display products when all are loaded
    const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount >= filteredIds.length) {
            // Filter out null values (failed requests)
            const validProducts = loadedProducts.filter(product => product !== null);
            displayRecentlyViewedProducts(validProducts);
        }
    };
    
    // Load each product individually
    filteredIds.forEach(id => {
        fetch(`/api/products/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching product ${id}`);
                }
                return response.json();
            })
            .then(product => {
                loadedProducts.push(product);
                checkAllLoaded();
            })
            .catch(error => {
                console.error(`Error loading product ${id}:`, error);
                loadedProducts.push(null); // Push null for failed requests
                checkAllLoaded();
            });
    });
}

/**
 * Display recently viewed products
 * @param {Array} products - Array of product objects
 */
function displayRecentlyViewedProducts(products) {
    const container = document.querySelector('.recently-viewed-slider');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // If no products, hide the section
    if (products.length === 0) {
        const section = document.querySelector('.recently-viewed');
        if (section) {
            section.style.display = 'none';
        }
        return;
    }
    
    // Add products to the container
    products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'recently-viewed-item';
        item.setAttribute('data-product-id', product._id);
        
        item.innerHTML = `
            <img src="images/products/${product.image}" alt="${product.name}">
            <div class="recently-viewed-info">
                <h4>${product.name}</h4>
                <div class="product-rating">
                    <span class="stars-container"></span>
                    <span>(${product.likes || 0})</span>
                </div>
                <span class="recent-price">${product.currency || '€'}${product.price.toFixed(2)}</span>
            </div>
        `;
        
        container.appendChild(item);
        
        // Use updateStarsDisplay to set the stars based on likes
        const starsContainer = item.querySelector('.stars-container');
        if (starsContainer) {
            // Calculate star rating based on likes
            const starRating = calculateStarRating(product.likes || 0);
            
            // Update stars display
            updateStarsDisplay(starsContainer, starRating);
        }
        
        // Make item clickable
        item.addEventListener('click', function() {
            window.location.href = `product-detail.html?product_id=${product._id}`;
        });
    });
    
    // Show the section
    const section = document.querySelector('.recently-viewed');
    if (section) {
        section.style.display = 'block';
    }
}

/**
 * Create HTML for star ratings based on likes
 * @param {number} likes - Number of product likes
 * @returns {string} HTML string with star icons
 */
function createStarsHTML(likes) {
    // Use the standardized calculation
    const stars = calculateStarRating(likes);
    
    // Create HTML for stars
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.3 && stars % 1 <= 0.7;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

/**
 * Make product cards clickable
 * @param {NodeList} cards - Product card elements
 */
function makeProductCardsClickable(cards) {
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons
            if (e.target.closest('.product-actions') || 
                e.target.tagName === 'BUTTON' || 
                e.target.closest('button')) {
                return;
            }
            
            // Get product ID and navigate to product detail page
            const productId = this.getAttribute('data-product-id');
            window.location.href = `product-detail.html?product_id=${productId}`;
        });
        
        // Set cursor to pointer to indicate clickable
        card.style.cursor = 'pointer';
        
        // Add event listeners for like, quick view, add to cart buttons
        const likeButton = card.querySelector('.like-button');
        if (likeButton) {
            likeButton.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = card.getAttribute('data-product-id');
                apiConnector.likeProduct(productId)
                    .then(data => {
                        console.log('Product liked:', data);
                        // Update UI if needed
                    })
                    .catch(error => {
                        console.error('Error liking product:', error);
                    });
            });
        }
        
        // Similar event listeners for quick view and add to cart
    });
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

/**
 * Add current product to wishlist
 */
function addCurrentProductToWishlist() {
    // Check if user is logged in
    if (window.profileUtils && !window.profileUtils.checkUserLoggedIn()) {
        window.profileUtils.showAuthModal('login');
        return;
    }
    
    // Get product information
    const productId = new URLSearchParams(window.location.search).get('product_id');
    const productName = document.getElementById('product-name').textContent;
    const productPrice = document.querySelector('.current-price').textContent.replace(/[^0-9.]/g, '');
    const productImage = document.getElementById('main-product-image').src;
    
    // Create wishlist item
    const wishlistItem = {
        id: productId,
        name: productName,
        price: parseFloat(productPrice),
        image: productImage
    };
    
    // Add to wishlist
    if (window.profileUtils && window.profileUtils.addToWishlist) {
        window.profileUtils.addToWishlist(wishlistItem);
    }
}

/**
 * Initialize wishlist button functionality
 */
function initWishlistButton() {
    const wishlistBtn = document.querySelector('.wishlist-btn');
    if (!wishlistBtn) return;
    
    // Add click event listener
    wishlistBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent any parent handlers from firing
        
        // Get product information from page
        const productId = new URLSearchParams(window.location.search).get('product_id') || 'unknown';
        const productName = document.getElementById('product-name')?.textContent || 'Product';
        const productImageElement = document.getElementById('main-product-image');
        const productImage = productImageElement ? productImageElement.src : '';
        
        // Get price (remove currency symbol and convert to number)
        const priceElement = document.querySelector('.current-price');
        let productPrice = 0;
        if (priceElement) {
            const priceText = priceElement.textContent;
            const priceMatch = priceText.match(/[\d.]+/);
            if (priceMatch) {
                productPrice = parseFloat(priceMatch[0]);
            }
        }
        
        // Check if user is logged in
        if (window.profileUtils && !window.profileUtils.checkUserLoggedIn()) {
            // If not logged in, show login modal
            if (window.profileUtils.showAuthModal) {
                window.profileUtils.showAuthModal('login');
               showNotification('Please log in to add items to your wishlist.', 'info');
            } else {
               showNotification('Please log in to add items to your wishlist.', 'info');
                window.location.href = 'profile.html';
            }
            return;
        }
        
        // Create wishlist item
        const wishlistItem = {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage
        };
        
        // Add to wishlist
        if (window.profileUtils && window.profileUtils.addToWishlist) {
            window.profileUtils.addToWishlist(wishlistItem);
        } else {
            // Fallback if profile utils not available
            addToWishlistFallback(wishlistItem);
        }
        
        // Update button state
        this.classList.add('active');
        this.querySelector('i').classList.remove('far');
        this.querySelector('i').classList.add('fas');
    });
    
    // Check if product is already in wishlist and update button state
    checkWishlistState(wishlistBtn);
}

/**
 * Check if current product is in wishlist and update button state
 * @param {HTMLElement} wishlistBtn - Wishlist button element
 */
function checkWishlistState(wishlistBtn) {
    // Get current user data
    const userData = window.profileUtils?.getUserData();
    if (!userData) return;
    
    // Get product ID from URL
    const productId = new URLSearchParams(window.location.search).get('product_id');
    if (!productId) return;
    
    // Check if product is in wishlist
    const userWishlist = JSON.parse(localStorage.getItem('brkWishlist')) || {};
    const wishlist = userWishlist[userData.id] || [];
    
    const inWishlist = wishlist.some(item => item.id === productId);
    
    // Update button state
    if (inWishlist) {
        wishlistBtn.classList.add('active');
        const icon = wishlistBtn.querySelector('i');
        if (icon) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
    }
}

/**
 * Fallback function to add to wishlist if profileUtils is not available
 * @param {Object} item - Wishlist item
 */
function addToWishlistFallback(item) {
    // Get user data
    const userData = JSON.parse(localStorage.getItem('brkUser'));
    if (!userData) {
        showNotification('Please log in to add items to your wishlist.', 'info');
        return;
    }
    
    // Get wishlist from localStorage
    const userWishlist = JSON.parse(localStorage.getItem('brkWishlist')) || {};
    const wishlist = userWishlist[userData.id] || [];
    
    // Check if item already exists
    const existingItem = wishlist.find(wishlistItem => wishlistItem.id === item.id);
    
    if (!existingItem) {
        // Add new item
        wishlist.push(item);
        
        // Save wishlist to localStorage
        userWishlist[userData.id] = wishlist;
        localStorage.setItem('brkWishlist', JSON.stringify(userWishlist));
        
        // Show success message
        showNotification('Product added to wishlist!', 'success');
    } else {
        // Item already in wishlist
        showNotification('This product is already in your wishlist!', 'info');
    }
}

