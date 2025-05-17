// Main JavaScript for site-wide functionality
document.addEventListener('DOMContentLoaded', function() {
    // Fix any JavaScript syntax errors in hardcoded products first
    fixHardcodedProductErrors();
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const isOpen = navLinks.classList.contains('active');
            mobileMenuBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Product card like button functionality
    const likeButtons = document.querySelectorAll('.like-button');
    
    likeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent card click
            
            // Get the product ID
            const productCard = this.closest('.product-card');
            const productId = productCard.getAttribute('data-product-id');
            
            if (!productId) {
                console.error('Product ID not found');
                return;
            }
            
            // Toggle heart icon immediately for better UX
            const heartIcon = this.querySelector('i');
            heartIcon.classList.toggle('far');
            heartIcon.classList.toggle('fas');
            heartIcon.classList.toggle('liked');
            
            // Send like request to API
            likeProduct(productId);
        });
    });
    
// Function to send like request to API and update UI in main.js
function likeProduct(productId) {
    // First, handle all instances of this product on the page
    const productCards = document.querySelectorAll(`.product-card[data-product-id="${productId}"]`);
    
    if (productCards.length === 0) {
        console.error('No product cards found for ID:', productId);
        return;
    }
    
    // Track the current likes for API request
    let currentLikes = 0;
    
    // Update each product card
    productCards.forEach(productCard => {
        // Find the product rating container
        const ratingContainer = productCard.querySelector('.product-rating');
        if (!ratingContainer) {
            console.error('Rating container not found in product card');
            return;
        }
        
        // Get all spans in the rating container
        const spans = ratingContainer.querySelectorAll('span');
        if (spans.length === 0) {
            console.error('No spans found in rating container');
            return;
        }
        
        // Look specifically for the span containing likes (the one with a number in parentheses)
        let likesSpan = null;
        let cardLikes = 0;
        
        for (const span of spans) {
            // Try to find a number in parentheses
            const likesMatch = span.textContent.match(/\((\d+)\)/);
            if (likesMatch) {
                likesSpan = span;
                cardLikes = parseInt(likesMatch[1]);
                // Store this for the API request
                currentLikes = cardLikes;
                break;
            }
            
            // Also check for template literal syntax that wasn't processed
            if (span.textContent.includes('${product.likes')) {
                likesSpan = span;
                cardLikes = 0; // Default to 0 if we find the template literal
                break;
            }
        }
        
        if (!likesSpan) {
            console.error('Could not identify the likes span');
            return;
        }
        
        // Create a new value for the likes span
        const newLikes = cardLikes + 1;
        
        // COMPLETELY REPLACE the span's content with the new like count
        likesSpan.textContent = `(${newLikes})`;
        
        // Make sure the heart icon is filled
        const heartIcon = productCard.querySelector('.like-button i');
        if (heartIcon) {
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas', 'liked');
        }
    });
    
    // Also update any slides in the slideshow that might show this product
    updateSlideshowLikes(productId, currentLikes + 1);
    
    // Then send the API request
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
        // If the server returns a different count, update all UI instances
        if (data.likes !== undefined && data.likes !== currentLikes + 1) {
            // Update all product cards again with the correct server value
            productCards.forEach(productCard => {
                const ratingContainer = productCard.querySelector('.product-rating');
                if (!ratingContainer) return;
                
                const spans = ratingContainer.querySelectorAll('span');
                if (spans.length === 0) return;
                
                // Find the likes span again
                for (const span of spans) {
                    if (span.textContent.match(/\(\d+\)/) || 
                        span.textContent.includes('${product.likes')) {
                        // Update with server value
                        span.textContent = `(${data.likes})`;
                        break;
                    }
                }
            });
            
            // Also update slideshow if needed
            updateSlideshowLikes(productId, data.likes);
        }
    })
    .catch(error => {
        console.error('API error:', error);
        
        // Revert all UI changes on error
        productCards.forEach(productCard => {
            const ratingContainer = productCard.querySelector('.product-rating');
            if (!ratingContainer) return;
            
            const spans = ratingContainer.querySelectorAll('span');
            if (spans.length === 0) return;
            
            // Find the likes span again
            for (const span of spans) {
                if (span.textContent.match(/\(\d+\)/) || 
                    span.textContent.includes('${product.likes')) {
                    // Revert to original
                    span.textContent = `(${currentLikes})`;
                    break;
                }
            }
            
            // Revert heart icon
            const heartIcon = productCard.querySelector('.like-button i');
            if (heartIcon) {
                heartIcon.classList.add('far');
                heartIcon.classList.remove('fas', 'liked');
            }
        });
        
        // Revert slideshow too
        updateSlideshowLikes(productId, currentLikes);
    });
}
    
    // Add to cart functionality
    // Add to cart functionality
const addToCartButtons = document.querySelectorAll('.add-to-cart');

addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent card click
        
        // Get the product card
        const productCard = this.closest('.product-card');
        if (!productCard) return;
        
        // Get product information
        const productId = productCard.getAttribute('data-product-id');
        const productName = productCard.querySelector('h3').textContent;
        const productImageElement = productCard.querySelector('.product-image img');
        const productImage = productImageElement ? productImageElement.src : '';
        
        // Get price (remove currency symbol and convert to number)
        const priceElement = productCard.querySelector('.product-price');
        let productPrice = 0;
        if (priceElement) {
            const priceText = priceElement.textContent;
            // Extract numeric part of price, handling various currency formats
            const priceMatch = priceText.match(/[\d.]+/);
            if (priceMatch) {
                productPrice = parseFloat(priceMatch[0]);
            }
        }
        
        // Create cart item
        const cartItem = {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            size: '41', // Default size
            quantity: 1
        };
        
        // Get existing cart or initialize empty cart
        let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
        
        // Check if item already exists
        const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
        
        if (existingItemIndex > -1) {
            // Increment quantity if item exists
            cart[existingItemIndex].quantity++;
        } else {
            // Add new item
            cart.push(cartItem);
        }
        
        // Save cart to localStorage
        localStorage.setItem('brkCart', JSON.stringify(cart));
        
        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            let currentCount = parseInt(cartCount.textContent) || 0;
            currentCount++;
            cartCount.textContent = currentCount;
        }
        
        // Show message
        showAddedToCartMessage();
    });
});
    
    // Function to show "Added to cart" message
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
                document.body.removeChild(message);
            }, 300);
        }, 2000);
    }
    
    // Add CSS for the cart message
    const style = document.createElement('style');
    style.textContent = `
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
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            // In a real implementation, this would send the email to a server
            console.log('Newsletter subscription:', email);
            
            // Show success message and reset form
            emailInput.value = '';
            
            // Create and show success message
            const message = document.createElement('div');
            message.className = 'newsletter-message';
            message.innerHTML = '<i class="fas fa-envelope"></i> Thank you for subscribing!';
            newsletterForm.appendChild(message);
            
            // Remove the message after a few seconds
            setTimeout(() => {
                newsletterForm.removeChild(message);
            }, 3000);
        });
    }
    
    // Add CSS for the newsletter message
    const newsletterStyle = document.createElement('style');
    newsletterStyle.textContent = `
        .newsletter-message {
            margin-top: 15px;
            color: #2ecc71;
            display: flex;
            align-items: center;
            gap: 8px;
        }
    `;
    document.head.appendChild(newsletterStyle);
    
    // Fetch popular products for homepage slideshow
    const popularProductsContainer = document.querySelector('.slideshow-container');
    
    // Add debugging logs
    console.log('DOM fully loaded, checking for slideshow and popular products');
    console.log('Slideshow container exists:', !!popularProductsContainer);
    console.log('Is homepage:', window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '');
    
    if (popularProductsContainer && (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '')) {
        fetchPopularProducts();
    }
    
    function fetchPopularProducts() {
        fetch('/api/popular-products')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(products => {
                console.log('Popular products:', products);
                
                // Update the slideshow with popular products
                updateSlideshow(products);
                
                // Also update the popular products section
                updatePopularProducts(products);
            })
            .catch(error => {
                console.error('Error fetching popular products:', error);
            });
    }
    
    function updateSlideshow(products) {
        // Only proceed if we have products and a slideshow container
        if (!products || products.length === 0 || !popularProductsContainer) {
            return;
        }
        
        // Clear existing slides
        const existingSlides = popularProductsContainer.querySelectorAll('.hero-slide');
        existingSlides.forEach(slide => {
            if (slide.parentNode) {
                slide.parentNode.removeChild(slide);
            }
        });
        
        const dotsContainer = popularProductsContainer.querySelector('.dots-container');
        if (dotsContainer) {
            // Clear existing dots
            const existingDots = dotsContainer.querySelectorAll('.dot');
            existingDots.forEach(dot => dot.remove());
        }
        
        // Keep navigation controls
        const prevButton = popularProductsContainer.querySelector('.prev');
        const nextButton = popularProductsContainer.querySelector('.next');
        
        // Create new slides for each popular product
        products.forEach((product, index) => {
            const slide = document.createElement('div');
            slide.className = 'hero-slide fade';
            
            slide.innerHTML = `
                <div class="slide-content">
                    <h1>${product.name}</h1>
                    <div class="product-rating">
                        <span class="stars-container"></span>
                        <span>(${product.likes || 0} likes)</span>
                    </div>
                    <p>${product.description}</p>
                    <a href="products.html" class="cta-button">Shop Now</a>
                </div>
                <img src="images/products/${product.image}" alt="${product.name}">
            `;
            
            // Add the slide before navigation controls
            if (prevButton) {
                popularProductsContainer.insertBefore(slide, prevButton);
            } else {
                popularProductsContainer.appendChild(slide);
            }
            
            // Update stars display for this slide
            const starsContainer = slide.querySelector('.stars-container');
            if (starsContainer) {
                const starRating = calculateStarRating(product.likes || 0);
                updateStarsDisplay(starsContainer, starRating);
            }
            
            // Create or update dot indicator
            if (dotsContainer) {
                const dot = document.createElement('span');
                dot.className = 'dot';
                dot.setAttribute('onclick', `currentSlide(${index + 1})`);
                dotsContainer.appendChild(dot);
            }
        });
        
        // Initialize the slideshow
        showSlides(1);
    }
    
    /**
     * Update product cards displayed in the Popular Products section 
     * This can be called when the products are loaded from the API
     */
    function updatePopularProducts(products) {
        const container = document.querySelector('.popular-products .products-grid');
        if (!container) {
            console.log('Popular products container not found');
            return;
        }
        
        // Clear existing products
        container.innerHTML = '';
        
        // Add products to the container
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-product-id', product._id);
            
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
            updatePriceDisplays;
            
            // Update stars display for this product
            const starsContainer = productCard.querySelector('.stars-container');
            if (starsContainer) {
                const starRating = calculateStarRating(product.likes || 0);
                updateStarsDisplay(starsContainer, starRating);
            }
        });
        
        // Initialize event listeners for the new products
        initProductCardEventListeners();
    }
    
    /**
     * Initialize event listeners for product cards
     */
    function initProductCardEventListeners() {
        // Add like button listeners
        const likeButtons = document.querySelectorAll('.product-card .like-button');
        likeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const productCard = this.closest('.product-card');
                const productId = productCard.getAttribute('data-product-id');
                
                if (!productId) {
                    console.error('Product ID not found');
                    return;
                }
                
                const heartIcon = this.querySelector('i');
                heartIcon.classList.toggle('far');
                heartIcon.classList.toggle('fas');
                heartIcon.classList.toggle('liked');
                
                likeProduct(productId);
            });
        });
        
        // Add quick view listeners
        const quickViewButtons = document.querySelectorAll('.product-card .quick-view');
        quickViewButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const productCard = this.closest('.product-card');
                const productImage = productCard.querySelector('.product-image img').src;
                const productName = productCard.querySelector('h3').textContent;
                
                showImageModal(productImage, productName);
            });
        });
        
        // Add add-to-cart listeners
        // Add to cart functionality
const addToCartButtons = document.querySelectorAll('.add-to-cart');

addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent card click
        
        // Get the product card
        const productCard = this.closest('.product-card');
        if (!productCard) return;
        
        // Get product information
        const productId = productCard.getAttribute('data-product-id');
        const productName = productCard.querySelector('h3').textContent;
        const productImageElement = productCard.querySelector('.product-image img');
        const productImage = productImageElement ? productImageElement.src : '';
        
        // Get price (remove currency symbol and convert to number)
        const priceElement = productCard.querySelector('.product-price');
        let productPrice = 0;
        if (priceElement) {
            const priceText = priceElement.textContent;
            // Extract numeric part of price, handling various currency formats
            const priceMatch = priceText.match(/[\d.]+/);
            if (priceMatch) {
                productPrice = parseFloat(priceMatch[0]);
            }
        }
        
        // Create cart item
        const cartItem = {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            size: '41', // Default size
            quantity: 1
        };
        
        // Get existing cart or initialize empty cart
        let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
        
        // Check if item already exists
        const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
        
        if (existingItemIndex > -1) {
            // Increment quantity if item exists
            cart[existingItemIndex].quantity++;
        } else {
            // Add new item
            cart.push(cartItem);
        }
        
        // Save cart to localStorage
        localStorage.setItem('brkCart', JSON.stringify(cart));
        
        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            let currentCount = parseInt(cartCount.textContent) || 0;
            currentCount++;
            cartCount.textContent = currentCount;
        }
        
        // Show message
        showAddedToCartMessage();
    });
});
        
        // Make product cards clickable
        makeProductCardsClickable();
    }
    
    /**
     * Make all product cards clickable
     */
    function makeProductCardsClickable() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const productId = card.getAttribute('data-product-id');
            
            card.addEventListener('click', function(e) {
                if (e.target.closest('.product-actions') || 
                    e.target.tagName === 'BUTTON' || 
                    e.target.closest('button')) {
                    return;
                }
                
                window.location.href = `product-detail.html?product_id=${productId}`;
            });
            
            card.style.cursor = 'pointer';
        });
    }
    
    // Quick view functionality for product cards - updated to only show image in modal
    updateQuickViewFunctionality();
    
    // Make homepage product cards clickable
    makeHomepageProductCardsClickable();
    
    /**
     * Make product cards on homepage clickable to navigate to product detail page
     */
    function makeHomepageProductCardsClickable() {
        const productCards = document.querySelectorAll('.popular-products .product-card');
        
        productCards.forEach(card => {
            // Get product info
            const productId = card.getAttribute('data-product-id');
            
            // Update star ratings for each product card
            const starsContainer = card.querySelector('.stars-container');
            if (starsContainer) {
                // Get product likes count
                const likesText = card.querySelector('.product-rating span').textContent;
                const likesMatch = likesText.match(/\((\d+)\)/);
                const likes = likesMatch ? parseInt(likesMatch[1]) : 0;
                
                // Calculate and update star rating
                const starRating = calculateStarRating(likes);
                updateStarsDisplay(starsContainer, starRating);
            }
            
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

    /**
     * Update quick view functionality to only show larger images
     */
    function updateQuickViewFunctionality() {
        const quickViewButtons = document.querySelectorAll('.quick-view');
        
        quickViewButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Prevent triggering card click
                
                // Get product card and product information
                const productCard = this.closest('.product-card');
                const productImage = productCard.querySelector('.product-image img').src;
                const productName = productCard.querySelector('h3').textContent;
                
                // Create and show image modal
                showImageModal(productImage, productName);
            });
        });
    }

    /**
     * Show image modal with larger product image
     * @param {string} imageSrc - Source URL of the image
     * @param {string} productName - Name of the product
     */
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

    /**
     * Close image modal with animation
     * @param {HTMLElement} modal - Modal element to close
     */
    function closeImageModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    }

    // Initialize styles
    addImageModalStyles();
    addProductCardHoverStyles();
    addSlideShowStarStyles();
    addStarRatingStyles();
    
    // Update all product ratings with consistent system
    updateAllProductRatings();
    updatePriceDisplays();
});

/**
 * Fix any JavaScript syntax errors in hardcoded product content
 */
function fixHardcodedProductErrors() {
    console.log('Fixing hardcoded product errors');
    // Find product ratings with syntax errors
    const productRatings = document.querySelectorAll('.product-rating');
    productRatings.forEach(rating => {
        const span = rating.querySelector('span');
        if (span && span.textContent.includes('product.likes')) {
            console.log('Found syntax error in product rating:', span.textContent);
            // Replace with a default value
            span.textContent = '(0)';
        } else if (span && span.textContent.includes('${')) {
            console.log('Found template literal in product rating:', span.textContent);
            // Replace with a default value
            span.textContent = '(0)';
        }
    });
}

/**
 * Update stars display based on rating
 * @param {HTMLElement|string} container - Container element or selector for stars
 * @param {number} rating - Rating value (0-5)
 */
function updateStarsDisplay(container, rating) {
    // Check if container is a string (selector) and find the element
    if (typeof container === 'string') {
        container = document.querySelector(container);
    }
    
    // Make sure container is a valid DOM element
    if (!container || !(container instanceof Element)) {
        console.error('Invalid container for updateStarsDisplay:', container);
        return;
    }
    
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
 * Calculate star rating based on likes
 * @param {number} likes - Number of product likes
 * @returns {number} Star rating from 0-5
 */
function calculateStarRating(likes) {
    // Calculate a score from 0-5 based on likes
    if (likes === 0) {
        return 0;
    } else if (likes <= 5) {
        return 2.5 + (likes * 0.3); // Start at 2.5 stars for at least 1 like
    } else if (likes <= 20) {
        return 4 + ((likes - 5) * 0.05); // Gradually increase to 5 stars
    } else {
        return 5; // Max rating for 20+ likes
    }
}

/**
 * Add slideshow star styles to the page
 */
function addSlideShowStarStyles() {
    const starStyles = document.createElement('style');
    starStyles.textContent = `
        .hero-slide .product-rating {
            margin: 10px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .hero-slide .stars-container {
            color: var(--accent-color);
        }
        
        .hero-slide .product-rating span {
            color: #fff;
            font-size: 0.9rem;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
    `;
    document.head.appendChild(starStyles);
}

/**
 * Update all star ratings on the page using the consistent system
 */
function updateAllProductRatings() {
    console.log('Updating all product ratings');
    // Find all product rating containers
    const ratingContainers = document.querySelectorAll('.product-rating');
    console.log('Found product rating containers:', ratingContainers.length);
    
    ratingContainers.forEach(container => {
        // Find the likes count from the span
        const likesSpan = container.querySelector('span');
        if (!likesSpan) {
            console.log('No likes span found in container:', container);
            return;
        }
        
        // Log the content for debugging
        console.log('Likes span content:', likesSpan.textContent);
        
        // Extract likes count from the span text, e.g. "(24)" -> 24
        const likesMatch = likesSpan.textContent.match(/\((\d+)\)/);
        if (!likesMatch) {
            console.log('Could not extract likes from:', likesSpan.textContent);
            // Try to handle the case of dynamic content
            if (likesSpan.textContent.includes('product.likes') || 
                likesSpan.textContent.includes('${')) {
                // Default to 0 likes for this case
                handleStarRating(container, 0);
            }
            return;
        }
        
        const likes = parseInt(likesMatch[1]);
        console.log('Extracted likes:', likes);
        
        // Process the star rating
        handleStarRating(container, likes);
    });
    
    // Helper function to handle the star rating update
    function handleStarRating(container, likes) {
        // Create a new container for stars
        const starsContainer = document.createElement('span');
        starsContainer.className = 'stars-container';
        
        // Insert the stars container before the likes span
        const likesSpan = container.querySelector('span');
        container.insertBefore(starsContainer, likesSpan);
        
        // Remove the old star icons (all i elements)
        const oldStars = container.querySelectorAll('i.fa-star, i.fa-star-half-alt');
        oldStars.forEach(star => star.remove());
        
        // Calculate star rating based on likes
        const starRating = calculateStarRating(likes);
        
        // Update the stars display
        updateStarsDisplay(starsContainer, starRating);
    }
}

/**
 * Add consistent star rating styles
 */
function addStarRatingStyles() {
    const starStyles = document.createElement('style');
    starStyles.textContent = `
        .product-rating {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .stars-container {
            color: var(--accent-color);
            display: flex;
            align-items: center;
        }
        
        .stars-container i {
            margin-right: 2px;
        }
        
        .hero-slide .product-rating {
            margin: 10px 0;
            color: white;
        }
        
        .hero-slide .product-rating span {
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        /* Make sure star colors are consistent */
        .fas.fa-star, .fas.fa-star-half-alt {
            color: var(--accent-color);
        }
        
        .far.fa-star {
            color: var(--accent-color);
            opacity: 0.5;
        }
    `;
    document.head.appendChild(starStyles);
}

/**
 * Add CSS for image modal
 */
function addImageModalStyles() {
    if (document.getElementById('image-modal-styles')) {
        return; // Styles already added
    }
    
    const imageModalStyle = document.createElement('style');
    imageModalStyle.id = 'image-modal-styles';
    imageModalStyle.textContent = `
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
    document.head.appendChild(imageModalStyle);
}

/**
 * Add hover effect styles for product cards
 */
function addProductCardHoverStyles() {
    const cardHoverStyle = document.createElement('style');
    cardHoverStyle.textContent = `
        .product-card {
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .product-card .product-actions button {
            position: relative;
            z-index: 5;
        }
    `;
    document.head.appendChild(cardHoverStyle);
}

/**
 * Convert all price displays from "EUR" text to "€" symbol
 */
function updatePriceDisplays() {
    // Find all product price elements
    const priceElements = document.querySelectorAll('.product-price');
    
    priceElements.forEach(priceElement => {
        // Get the current text
        const currentText = priceElement.textContent;
        
        // Replace EUR with € symbol
        const updatedText = currentText.replace('EUR', '€');
        
        // Update the element's text
        priceElement.textContent = updatedText;
    });
}