// Κύριο JavaScript για λειτουργικότητα σε όλη την ιστοσελίδα

document.addEventListener('DOMContentLoaded', function() {
    
    function updateActiveNavLink() {
       
        const currentPath = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        
        const navLinks = document.querySelectorAll('.nav-links a');
        
        
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
       
        if (currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/')) {
           
            navLinks.forEach(link => {
                if (link.textContent.trim() === 'Home') {
                    link.classList.add('active');
                }
            });
        } else if (currentPath.includes('products.html')) {
            if (!categoryParam) {
                
                navLinks.forEach(link => {
                    if (link.textContent.trim() === 'All Products') {
                        link.classList.add('active');
                    }
                });
            } else {
                
                navLinks.forEach(link => {
                    
                    if (link.textContent.trim().toLowerCase() === categoryParam.toLowerCase()) {
                        link.classList.add('active');
                    }
                });
            }
        }
    }
    
    // Εκτέλεση όταν φορτώση η σελίδα
    updateActiveNavLink();

     setTimeout(initializeAlreadyLikedProducts, 500);



    
    fixHardcodedProductErrors();
    
    
    const mobileMenuBtn = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const isOpen = navLinks.classList.contains('active');
            mobileMenuBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }
    
    
    const likeButtons = document.querySelectorAll('.like-button');
    
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
    
// Λειτουργία για αποστολή αιτήματος like στο API και ενημέρωση UI
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
        console.log('API response:', data);
        
       
        const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
        if (productCard) {
           
            const likeButton = productCard.querySelector('.like-button');
            if (likeButton) {
                likeButton.style.pointerEvents = 'none';
                likeButton.style.opacity = '0.6';
                likeButton.disabled = true;
                
                
                const heartIcon = likeButton.querySelector('i');
                if (heartIcon) {
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas', 'liked');
                }
            }
            
            const ratingContainer = productCard.querySelector('.product-rating');
            if (ratingContainer) {
                const likesSpan = ratingContainer.querySelector('span:last-child');
                if (likesSpan) {
                    likesSpan.textContent = `(${data.likes})`;
                    
                   
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
    
    //Εμφάνιση μηνύματος "Added to cart"
    function showAddedToCartMessage() {
        const message = document.createElement('div');
        message.className = 'cart-message';
        message.innerHTML = '<i class="fas fa-check"></i> Added to cart!';
        document.body.appendChild(message);
        
       
        setTimeout(() => {
            message.classList.add('active');
        }, 10);
        
        
        setTimeout(() => {
            message.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 2000);
    }
    
    //css για το μήνυμα
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
    
    
    //Δημοφιλες προϊόντα 
    const popularProductsContainer = document.querySelector('.slideshow-container');
    
    if (popularProductsContainer && (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '')) {
        fetchPopularProducts();
    }
    
    //Getter δημοφιλών προϊόντων
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
                
               
                updateSlideshow(products);
                
                
                updatePopularProducts(products);
            })
            .catch(error => {
                console.error('Error fetching popular products:', error);
            });
    }
    
    //Ενημερωνει το slideshow με δημοφιλή προϊόντα
    function updateSlideshow(products) {
       
        if (!products || products.length === 0 || !popularProductsContainer) {
            return;
        }
        
       
        const existingSlides = popularProductsContainer.querySelectorAll('.hero-slide');
        existingSlides.forEach(slide => {
            if (slide.parentNode) {
                slide.parentNode.removeChild(slide);
            }
        });
        
        const dotsContainer = popularProductsContainer.querySelector('.dots-container');
        if (dotsContainer) {
            
            const existingDots = dotsContainer.querySelectorAll('.dot');
            existingDots.forEach(dot => dot.remove());
        }
        
        
        const prevButton = popularProductsContainer.querySelector('.prev');
        const nextButton = popularProductsContainer.querySelector('.next');
        
        
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
            
            
            if (prevButton) {
                popularProductsContainer.insertBefore(slide, prevButton);
            } else {
                popularProductsContainer.appendChild(slide);
            }
            
            
            const starsContainer = slide.querySelector('.stars-container');
            if (starsContainer) {
                const starRating = calculateStarRating(product.likes || 0);
                updateStarsDisplay(starsContainer, starRating);
            }
            
            
            if (dotsContainer) {
                const dot = document.createElement('span');
                dot.className = 'dot';
                dot.setAttribute('onclick', `currentSlide(${index + 1})`);
                dotsContainer.appendChild(dot);
            }
        });
        
        
        showSlides(1);
    }
    
    // Ενημέρωση δημοφιλών προϊόντων στην αρχική σελίδα καθε φωρα που φωρτόνη η αρχικη
    function updatePopularProducts(products) {
        const container = document.querySelector('.popular-products .products-grid');
        if (!container) {
            console.log('Popular products container not found');
            return;
        }
        
        
        container.innerHTML = '';
        
        
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
            
           
            const starsContainer = productCard.querySelector('.stars-container');
            if (starsContainer) {
                const starRating = calculateStarRating(product.likes || 0);
                updateStarsDisplay(starsContainer, starRating);
            }
        });
        
        
        initProductCardEventListeners();
    }
    
   //Δημιουργια card για τα προιοντα που εισέρχονται στην αρχική
    function initProductCardEventListeners() {
        
        const likeButtons = document.querySelectorAll('.product-card .like-button');
        likeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const productCard = this.closest('.product-card');
                const productId = productCard.getAttribute('data-product-id');
                
                
                const heartIcon = this.querySelector('i');
                heartIcon.classList.toggle('far');
                heartIcon.classList.toggle('fas');
                heartIcon.classList.toggle('liked');
                
                likeProduct(productId);
            });
        });
        
       
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
        
       
const addToCartButtons = document.querySelectorAll('.add-to-cart');

addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); 
        
       
        const productCard = this.closest('.product-card');
        if (!productCard) return;
        
        
        const productId = productCard.getAttribute('data-product-id');
        const productName = productCard.querySelector('h3').textContent;
        const productImageElement = productCard.querySelector('.product-image img');
        const productImage = productImageElement ? productImageElement.src : '';
        
       
        const priceElement = productCard.querySelector('.product-price');
        let productPrice = 0;
        if (priceElement) {
            const priceText = priceElement.textContent;
            
            const priceMatch = priceText.match(/[\d.]+/);
            if (priceMatch) {
                productPrice = parseFloat(priceMatch[0]);
            }
        }
        
       //Δημιουργία card
        const cartItem = {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            size: '41',
            quantity: 1
        };
        
        
        let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
        
       
        const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
        
        if (existingItemIndex > -1) {
           
            cart[existingItemIndex].quantity++;
        } else {
            
            cart.push(cartItem);
        }
        
      
        localStorage.setItem('brkCart', JSON.stringify(cart));
        
        ount
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            let currentCount = parseInt(cartCount.textContent) || 0;
            currentCount++;
            cartCount.textContent = currentCount;
        }
        
        
        showAddedToCartMessage();
    });
});
        
        
        makeProductCardsClickable();
    }
    
    // Listeners για τα cards
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
    
    
    updateQuickViewFunctionality();
    
    
    makeHomepageProductCardsClickable();
    
    
    function makeHomepageProductCardsClickable() {
        const productCards = document.querySelectorAll('.popular-products .product-card');
        
        productCards.forEach(card => {
           
            const productId = card.getAttribute('data-product-id');
            
            
            const starsContainer = card.querySelector('.stars-container');
            if (starsContainer) {
                
                const likesText = card.querySelector('.product-rating span').textContent;
                const likesMatch = likesText.match(/\((\d+)\)/);
                const likes = likesMatch ? parseInt(likesMatch[1]) : 0;
                
                
                const starRating = calculateStarRating(likes);
                updateStarsDisplay(starsContainer, starRating);
            }
            
           
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



    //Εμφανιση της εικονας του προιοντος σε modal
    function updateQuickViewFunctionality() {
        const quickViewButtons = document.querySelectorAll('.quick-view');
        
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
    }

    //Modal για την εικονα
    function showImageModal(imageSrc, productName) {
        
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        
       
        modal.innerHTML = `
            <div class="image-modal-content">
                <span class="close-modal">&times;</span>
                <img src="${imageSrc}" alt="${productName}">
                <h3>${productName}</h3>
            </div>
        `;
        
        
        document.body.appendChild(modal);
        
       
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
       
        const closeButton = modal.querySelector('.close-modal');
        closeButton.addEventListener('click', function() {
            closeImageModal(modal);
        });
        
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal(modal);
            }
        });
        
       
        document.addEventListener('keydown', function escFunction(e) {
            if (e.key === 'Escape') {
                closeImageModal(modal);
                document.removeEventListener('keydown', escFunction);
            }
        });
    }

    
    function closeImageModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    }

    
    addImageModalStyles();
    addProductCardHoverStyles();
    addSlideShowStarStyles();
    addStarRatingStyles();
    
    
    updateAllProductRatings();
    updatePriceDisplays();
});

//debug για τα likes
function fixHardcodedProductErrors() {
    console.log('Fixing hardcoded product errors');
   
    const productRatings = document.querySelectorAll('.product-rating');
    productRatings.forEach(rating => {
        const span = rating.querySelector('span');
        if (span && span.textContent.includes('product.likes')) {
            console.log('Found syntax error in product rating:', span.textContent);
            
            span.textContent = '(0)';
        } else if (span && span.textContent.includes('${')) {
            console.log('Found template literal in product rating:', span.textContent);
            
            span.textContent = '(0)';
        }
    });
}

//Ενημέωση των αστεριών προιοντων
function updateStarsDisplay(container, rating) {
    
    if (typeof container === 'string') {
        container = document.querySelector(container);
    }
    
   
    if (!container || !(container instanceof Element)) {
        console.error('Invalid container for updateStarsDisplay:', container);
        return;
    }
    
   
    container.innerHTML = '';
    
   
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
        const star = document.createElement('i');
        star.className = 'fas fa-star';
        container.appendChild(star);
    }
    
    
    const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
    if (hasHalfStar) {
        const halfStar = document.createElement('i');
        halfStar.className = 'fas fa-star-half-alt';
        container.appendChild(halfStar);
    }
    
   
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        const emptyStar = document.createElement('i');
        emptyStar.className = 'far fa-star';
        container.appendChild(emptyStar);
    }
}

//Υπολογισμός των αστεριών
function calculateStarRating(likes) {
    if (likes === 0) return 0;
    if (likes >= 30) return 5;
    
    // Start with 1 star, add 0.5 for every 3 likes
    const rating = 1 + Math.floor(likes / 3) * 0.5;
    
    return Math.min(5, rating);
}

//css για τα αστερια στο slideshow
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

//debug για τα likes
function updateAllProductRatings() {
    
    const ratingContainers = document.querySelectorAll('.product-rating');
   
    ratingContainers.forEach(container => {
        const likesSpan = container.querySelector('span');
        
    
        
       
        const likesMatch = likesSpan.textContent.match(/\((\d+)\)/);
        if (!likesMatch) {
            console.log('Could not extract likes from:', likesSpan.textContent);
            
            if (likesSpan.textContent.includes('product.likes') || 
                likesSpan.textContent.includes('${')) {
                
                handleStarRating(container, 0);
            }
            return;
        }
        
        const likes = parseInt(likesMatch[1]);
        console.log('Extracted likes:', likes);
        
        
        handleStarRating(container, likes);
    });
    
    //Ολοκληρομένη μεθοδος για να ενημερώνει τα Likes
    function handleStarRating(container, likes) {
        
        const starsContainer = document.createElement('span');
        starsContainer.className = 'stars-container';
        
       
        const likesSpan = container.querySelector('span');
        container.insertBefore(starsContainer, likesSpan);
        
       
        const oldStars = container.querySelectorAll('i.fa-star, i.fa-star-half-alt');
        oldStars.forEach(star => star.remove());
        
        
        const starRating = calculateStarRating(likes);
        
       
        updateStarsDisplay(starsContainer, starRating);
    }
}

//css για τα αστέρια
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

//css για τα modal εικονων
function addImageModalStyles() {
    if (document.getElementById('image-modal-styles')) {
        return; 
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


function updatePriceDisplays() {
    
    const priceElements = document.querySelectorAll('.product-price');
    
    priceElements.forEach(priceElement => {
        
        const currentText = priceElement.textContent;
        
        
        const updatedText = currentText.replace('EUR', '€');
        
        
        priceElement.textContent = updatedText;
    });
}

// Εμφάνιση διάφορων ειδοποιητικών μηνυμάτων
function showNotification(message, type = 'success', duration = 3000) {
    
    const existingNotifications = document.querySelectorAll(`.notification.${type}`);
    existingNotifications.forEach(notification => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    });
    
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    
    let icon = 'check';
    switch (type) {
        case 'error': icon = 'exclamation-circle'; break;
        case 'info': icon = 'info-circle'; break;
        case 'warning': icon = 'exclamation-triangle'; break;
    }
    
    notification.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    document.body.appendChild(notification);
    
    
    setTimeout(() => {
        notification.classList.add('active');
        
       
        setTimeout(() => {
            notification.classList.remove('active');
            
            
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }, 10);
}

// Υλοποίηση λειτουργίας για τα links πληροφοριών στο footer
document.addEventListener('DOMContentLoaded', function() {
    const infoLinks = document.querySelectorAll('.info-link');
    const infoModal = document.getElementById('info-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModal = infoModal.querySelector('.close-modal');
    
    //Μηνύματα που πήραμε απο διάθορα sites
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
    
    
    infoLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const infoType = this.getAttribute('data-info');
            
            if (infoContent[infoType]) {
                modalContent.innerHTML = infoContent[infoType];
                infoModal.style.display = 'block';
                document.body.style.overflow = 'hidden'; 
            
            
                if (infoType === 'contact') {
                    const contactForm = modalContent.querySelector('.contact-form');
                    if (contactForm) {
                        contactForm.addEventListener('submit', function(event) {
                            event.preventDefault();
                            
                            
                            showNotification('Thank you for your message! We will contact you as soon as possible.', 'success', 4000);
                            
                            
                            this.reset();
                            
                            
                            setTimeout(() => {
                                infoModal.style.display = 'none';
                                document.body.style.overflow = ''; 
                            }, 2000);
                        });
                    }
                }
            }
        });
    });
    
   
    closeModal.addEventListener('click', function() {
        infoModal.style.display = 'none';
        document.body.style.overflow = ''; 
    });
    
    
    window.addEventListener('click', function(e) {
        if (e.target === infoModal) {
            infoModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && infoModal.style.display === 'block') {
            infoModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
});


function checkIfProductLiked(productId) {
   
    const userData = window.profileUtils ? window.profileUtils.getUserData() : null;
    
    if (userData) {
        
        const userLikedProducts = JSON.parse(localStorage.getItem('brkLikedProducts')) || {};
        const userLikes = userLikedProducts[userData.id] || [];
        return userLikes.includes(productId);
    } else {
       
        const guestLikes = JSON.parse(sessionStorage.getItem('brkGuestLikes')) || [];
        return guestLikes.includes(productId);
    }
}

function trackLikedProduct(productId) {
    const userData = window.profileUtils ? window.profileUtils.getUserData() : null;
    
    if (userData) {
       
        const userLikedProducts = JSON.parse(localStorage.getItem('brkLikedProducts')) || {};
        const userLikes = userLikedProducts[userData.id] || [];
        
        if (!userLikes.includes(productId)) {
            userLikes.push(productId);
            userLikedProducts[userData.id] = userLikes;
            localStorage.setItem('brkLikedProducts', JSON.stringify(userLikedProducts));
            return true; 
        }
    } else {
        
        const guestLikes = JSON.parse(sessionStorage.getItem('brkGuestLikes')) || [];
        
        if (!guestLikes.includes(productId)) {
            guestLikes.push(productId);
            sessionStorage.setItem('brkGuestLikes', JSON.stringify(guestLikes));
            return true; 
        }
    }
    
    return false; 
}


function initializeAlreadyLikedProducts() {
    const likedProducts = JSON.parse(localStorage.getItem('brkLikedProducts')) || [];
    
    if (likedProducts.length === 0) return;
   
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(productCard => {
        const productId = productCard.getAttribute('data-product-id');
        
        if (likedProducts.includes(productId)) {
            
            const likeButton = productCard.querySelector('.like-button');
            if (likeButton) {
                likeButton.style.pointerEvents = 'none';
                likeButton.style.opacity = '0.6';
                likeButton.disabled = true;
                
               
                const heartIcon = likeButton.querySelector('i');
                if (heartIcon) {
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas', 'liked');
                }
            }
        }
    });
}

