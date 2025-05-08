// Main JavaScript for site-wide functionality
document.addEventListener('DOMContentLoaded', function() {
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
            // Update the likes count in the UI if needed
        })
        .catch(error => {
            console.error('Error liking product:', error);
        });
    }
    
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartCount = document.querySelector('.cart-count');
    let currentCount = parseInt(cartCount ? cartCount.textContent : '0');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Increment cart count
            currentCount++;
            if (cartCount) {
                cartCount.textContent = currentCount;
            }
            
            // Show add to cart animation
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
    
    if (popularProductsContainer && window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
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
        const dotsContainer = popularProductsContainer.querySelector('.dots-container');
        
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
    
    // Quick view functionality for product cards
    const quickViewButtons = document.querySelectorAll('.quick-view');
    const quickViewModal = document.getElementById('quick-view-modal');
    
    if (quickViewButtons.length > 0 && quickViewModal) {
        // Close modal when clicking X button
        const closeModalBtn = document.querySelector('.close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                quickViewModal.style.display = 'none';
            });
        }
        
        // Close modal when clicking outside content
        window.addEventListener('click', function(e) {
            if (e.target === quickViewModal) {
                quickViewModal.style.display = 'none';
            }
        });
        
        // Open quick view modal when clicking quick view button
        quickViewButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get product information from parent card
                const productCard = this.closest('.product-card');
                const productImage = productCard.querySelector('.product-image img').src;
                const productName = productCard.querySelector('h3').textContent;
                const productPrice = productCard.querySelector('.product-price').textContent;
                const productDescription = productCard.querySelector('.product-description').textContent;
                
                // Update modal with product information
                document.getElementById('modal-product-image').src = productImage;
                document.getElementById('modal-product-name').textContent = productName;
                document.getElementById('modal-product-price').textContent = productPrice;
                document.getElementById('modal-product-description').textContent = productDescription;
                
                // Show modal
                quickViewModal.style.display = 'block';
            });
        });
    }
});