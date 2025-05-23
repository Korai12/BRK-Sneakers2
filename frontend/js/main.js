// Main JavaScript for site-wide functionality
document.addEventListener('DOMContentLoaded', function() {
    // Function to highlight active navigation link based on URL
    function updateActiveNavLink() {
        // Get current URL path
        const currentPath = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        // Get all nav links
        const navLinks = document.querySelectorAll('.nav-links a');
        
        // Remove active class from all links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Set active class based on path or category parameter
        if (currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/')) {
            // Home page
            navLinks.forEach(link => {
                if (link.textContent.trim() === 'Home') {
                    link.classList.add('active');
                }
            });
        } else if (currentPath.includes('products.html')) {
            if (!categoryParam) {
                // All Products page with no category
                navLinks.forEach(link => {
                    if (link.textContent.trim() === 'All Products') {
                        link.classList.add('active');
                    }
                });
            } else {
                // Category pages
                navLinks.forEach(link => {
                    // Convert both to lowercase for case-insensitive comparison
                    if (link.textContent.trim().toLowerCase() === categoryParam.toLowerCase()) {
                        link.classList.add('active');
                    }
                });
            }
        }
    }
    
    // Run when page loads
    updateActiveNavLink();

     setTimeout(initializeAlreadyLikedProducts, 500);



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
    
// Function to send like request to API and update UI with ONE-LIKE POLICY
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
 * Update slideshow likes when a product is liked
 * @param {string} productId - ID of the product
 * @param {number} newLikes - New number of likes
 */
function updateSlideshowLikes(productId, newLikes) {
    // Get all slides
    const slides = document.querySelectorAll('.hero-slide');
    
    slides.forEach(slide => {
        // Check if this slide contains the product that was liked
        // We need to extract the product ID from the slide content
        const slideContent = slide.querySelector('.slide-content');
        if (!slideContent) return;
        
        const productName = slideContent.querySelector('h1')?.textContent;
        if (!productName) return;
        
        // Find the likes span element
        const likesSpan = slideContent.querySelector('.product-rating span');
        if (likesSpan && likesSpan.textContent.includes('(')) {
            // Update the likes count
            likesSpan.textContent = `(${newLikes})`;
            
            // Also update the stars if they're displayed
            const starsContainer = slideContent.querySelector('.stars-container');
            if (starsContainer) {
                const starRating = calculateStarRating(newLikes);
                updateStarsDisplay(starsContainer, starRating);
            }
        }
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

/**
 * Show visual notification instead of alert
 * @param {string} message - Message to display
 * @param {string} type - Type of notification: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = 'success', duration = 3000) {
    // Remove existing notifications of the same type
    const existingNotifications = document.querySelectorAll(`.notification.${type}`);
    existingNotifications.forEach(notification => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on type
    let icon = 'check';
    switch (type) {
        case 'error': icon = 'exclamation-circle'; break;
        case 'info': icon = 'info-circle'; break;
        case 'warning': icon = 'exclamation-triangle'; break;
    }
    
    notification.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('active');
        
        // Hide after specified duration
        setTimeout(() => {
            notification.classList.remove('active');
            
            // Remove from DOM after animation completes
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }, 10);
}

// Modal functionality for footer information links
document.addEventListener('DOMContentLoaded', function() {
    const infoLinks = document.querySelectorAll('.info-link');
    const infoModal = document.getElementById('info-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModal = infoModal.querySelector('.close-modal');
    
    // Information content 
    const infoContent = {
        contact: `
            <h2>Contact Us</h2>
            <p>We'd love to hear from you! Get in touch with our team for any questions, feedback, or assistance.</p>
            <div class="contact-info">
                <p><strong>Email:</strong> support@brksneakers.com</p>
                <p><strong>Phone:</strong>+30 6999999999</p>
                <p><strong>Address:</strong>Thessaloniki 541 24</p>
            </div>
            <form class="contact-form">
                <div class="form-group">
                    <label for="contact-name">Name</label>
                    <input type="text" id="contact-name" required>
                </div>
                <div class="form-group">
                    <label for="contact-email">Email</label>
                    <input type="email" id="contact-email" required>
                </div>
                <div class="form-group">
                    <label for="contact-message">Message</label>
                    <textarea id="contact-message" rows="5" required></textarea>
                </div>
                <button type="submit" class="cta-button">Send Message</button>
            </form>
        `,
        about: `
            <h2>About BRK Sneakers</h2>
            <p>BRK Sneakers was founded in 2025 with a simple mission: to create comfortable, stylish, and affordable footwear for everyone.</p>
            <p>Our team of designers works tirelessly to combine the latest trends with time-tested comfort technology. We believe that everyone deserves to step out in style without compromising on comfort.</p>
            <p>All our products are crafted with sustainable materials and ethical manufacturing practices. We're committed to reducing our environmental footprint while delivering the highest quality products to our customers.</p>
            <h3>Our Values</h3>
            <ul>
                <li><strong>Quality:</strong> We never compromise on materials or craftsmanship.</li>
                <li><strong>Innovation:</strong> We're constantly evolving our designs and technology.</li>
                <li><strong>Sustainability:</strong> We care for our planet through responsible practices.</li>
                <li><strong>Inclusion:</strong> We create shoes for everyone, regardless of age or style preference.</li>
            </ul>
        `,
        terms: `
            <h2>Terms & Conditions</h2>
            <p>Last updated: May 20, 2025</p>
            
            <h3>1. Introduction</h3>
            <p>Welcome to BRK Sneakers. These Terms and Conditions govern your use of our website and the purchase of products from our online store.</p>
            
            <h3>2. Acceptance of Terms</h3>
            <p>By accessing and using our website, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our website.</p>
            
            <h3>3. Products and Pricing</h3>
            <p>All product descriptions, images, and prices are accurate to the best of our knowledge. We reserve the right to change prices without notice.</p>
            
            <h3>4. Orders and Payment</h3>
            <p>All orders are subject to acceptance and availability. Payment must be made in full at the time of purchase.</p>
            
            <h3>5. Shipping and Delivery</h3>
            <p>Delivery times are estimates only. We are not responsible for delays beyond our control.</p>
            
            <h3>6. Returns and Refunds</h3>
            <p>Products may be returned within 30 days of delivery. Please see our Returns Policy for details.</p>
            
            <h3>7. Intellectual Property</h3>
            <p>All content on this website is the property of BRK Sneakers and is protected by copyright laws.</p>
            
            <h3>8. Limitation of Liability</h3>
            <p>BRK Sneakers shall not be liable for any indirect, incidental, or consequential damages.</p>
            
            <h3>9. Governing Law</h3>
            <p>These Terms and Conditions shall be governed by the laws of the state/country of our incorporation.</p>
        `,
        privacy: `
            <h2>Privacy Policy</h2>
            <p>Last updated: May 20, 2025</p>
            
            <h3>1. Information We Collect</h3>
            <p>We collect personal information such as your name, email address, shipping address, and payment details when you make a purchase.</p>
            
            <h3>2. How We Use Your Information</h3>
            <p>We use your information to process orders, communicate with you about your purchase, and improve our products and services.</p>
            
            <h3>3. Information Sharing</h3>
            <p>We do not sell or rent your personal information to third parties. We may share your information with service providers who help us operate our business.</p>
            
            <h3>4. Cookies</h3>
            <p>We use cookies to enhance your browsing experience and analyze website traffic.</p>
            
            <h3>5. Security</h3>
            <p>We implement appropriate security measures to protect your personal information.</p>
            
            <h3>6. Your Rights</h3>
            <p>You have the right to access, correct, or delete your personal information.</p>
            
            <h3>7. Changes to This Policy</h3>
            <p>We may update this policy from time to time. Please check this page regularly for updates.</p>
            
            <h3>8. Contact Us</h3>
            <p>If you have any questions about our Privacy Policy, please contact us at privacy@brksneakers.com.</p>
        `
    };
    
    // Open modal with specific content
    infoLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const infoType = this.getAttribute('data-info');
            
            if (infoContent[infoType]) {
                modalContent.innerHTML = infoContent[infoType];
                infoModal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            
            // Add event listener for contact form submission
                if (infoType === 'contact') {
                    const contactForm = modalContent.querySelector('.contact-form');
                    if (contactForm) {
                        contactForm.addEventListener('submit', function(event) {
                            event.preventDefault();
                            
                            // Show success notification
                            showNotification('Thank you for your message! We will contact you as soon as possible.', 'success', 4000);
                            
                            // Reset form fields
                            this.reset();
                            
                            // Close modal after a brief delay
                            setTimeout(() => {
                                infoModal.style.display = 'none';
                                document.body.style.overflow = ''; // Re-enable scrolling
                            }, 2000);
                        });
                    }
                }
            }
        });
    });
    
    // Close modal
    closeModal.addEventListener('click', function() {
        infoModal.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable scrolling
    });
    
    // Close when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === infoModal) {
            infoModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    // Close with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && infoModal.style.display === 'block') {
            infoModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
});

// Enhanced like tracking system
function checkIfProductLiked(productId) {
    // Check if user is logged in
    const userData = window.profileUtils ? window.profileUtils.getUserData() : null;
    
    if (userData) {
        // For logged-in users: check user-specific liked products
        const userLikedProducts = JSON.parse(localStorage.getItem('brkLikedProducts')) || {};
        const userLikes = userLikedProducts[userData.id] || [];
        return userLikes.includes(productId);
    } else {
        // For guests: check session-based liked products
        const guestLikes = JSON.parse(sessionStorage.getItem('brkGuestLikes')) || [];
        return guestLikes.includes(productId);
    }
}

function trackLikedProduct(productId) {
    const userData = window.profileUtils ? window.profileUtils.getUserData() : null;
    
    if (userData) {
        // For logged-in users: store in localStorage with user ID
        const userLikedProducts = JSON.parse(localStorage.getItem('brkLikedProducts')) || {};
        const userLikes = userLikedProducts[userData.id] || [];
        
        if (!userLikes.includes(productId)) {
            userLikes.push(productId);
            userLikedProducts[userData.id] = userLikes;
            localStorage.setItem('brkLikedProducts', JSON.stringify(userLikedProducts));
            return true; // Successfully liked
        }
    } else {
        // For guests: store in sessionStorage for current session
        const guestLikes = JSON.parse(sessionStorage.getItem('brkGuestLikes')) || [];
        
        if (!guestLikes.includes(productId)) {
            guestLikes.push(productId);
            sessionStorage.setItem('brkGuestLikes', JSON.stringify(guestLikes));
            return true; // Successfully liked
        }
    }
    
    return false; // Already liked
}

/**
 * Initialize already-liked products on page load
 * This function should be called after products are loaded to mark already-liked ones
 */
function initializeAlreadyLikedProducts() {
    const likedProducts = JSON.parse(localStorage.getItem('brkLikedProducts')) || [];
    
    if (likedProducts.length === 0) return;
    
    // Find all product cards and check if they're already liked
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(productCard => {
        const productId = productCard.getAttribute('data-product-id');
        
        if (likedProducts.includes(productId)) {
            // Disable the like button
            const likeButton = productCard.querySelector('.like-button');
            if (likeButton) {
                likeButton.style.pointerEvents = 'none';
                likeButton.style.opacity = '0.6';
                likeButton.disabled = true;
                
                // Make heart icon filled
                const heartIcon = likeButton.querySelector('i');
                if (heartIcon) {
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas', 'liked');
                }
            }
        }
    });
}

