//Οι λειτουργικότιτες της σελίδας προϊόντων,όπως  δυναμική αναζήτηση προϊόντων, φιλτράρισμα, ταξινόμηση, εμφάνιση προϊόντων, λειτουργικότητα like, προσθήκη στο καλάθη κτλ.Συνδέεται με το REST API για ανάκτηση και ενημέρωση προϊόντων.
document.addEventListener('DOMContentLoaded', function() {
    
    //Φόρτωση όλων των προϊόντων κατά την εκκίνηση
    loadAllProducts();
    
    
    const searchInput = document.getElementById('product-search');
    const searchButton = document.getElementById('search-button');
    const productsContainer = document.getElementById('products-container');
    
    
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortBy = document.getElementById('sort-by');
    
    //Φίλτρα
    function applyFilters() {
        
        const category = categoryFilter ? categoryFilter.value : 'all';
        const priceRange = priceFilter ? priceFilter.value : 'all';
        const sortOption = sortBy ? sortBy.value : 'popularity';
        
        
        let apiUrl = '/api/products';
        
        
        if (category !== 'all') {
            apiUrl = `/api/products/category/${category}`;
        }
        
        
        let sortParam = '';
        let sortOrder = 1; 
        
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
                
                sortParam = '_id';
                sortOrder = -1;
                break;
        }
        
        
        if (sortParam) {
            apiUrl += `?sort_by=${sortParam}&sort_order=${sortOrder}`;
        }
        
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(products => {
                
                if (priceRange !== 'all') {
                    products = filterByPrice(products, priceRange);
                }
                
                
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
        
        
        if (categoryParam && categoryFilter) {
           
            for (let i = 0; i < categoryFilter.options.length; i++) {
                if (categoryFilter.options[i].value === categoryParam) {
                    categoryFilter.selectedIndex = i;
                    break;
                }
            }
            
           
            applyFilters();
        }
    }
    
   
    setFiltersFromURL();

    
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
       
        searchButton.addEventListener('click', function() {
            searchProducts();
        });
        
       
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
        
       
        searchInput.addEventListener('input', function() {
            if (this.value.length >= 3 || this.value.length === 0) {
                searchProducts();
            }
        });
    }
    
    //Αναζήτηση προϊόντων
    function searchProducts() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
       
        fetch(`/api/search?query=${encodeURIComponent(searchTerm)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(products => {
                
                displayProducts(products);
            })
            .catch(error => {
                console.error('Error searching products:', error);
                
                displayErrorMessage("There was a problem searching for products. Please try again later.");
            });
    }
    
    // Αρχική φόρτωση όλων των προϊόντων
    function loadAllProducts() {
        fetch('/api/products')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(products => {
               
                displayProducts(products);
            })
            .catch(error => {
                displayErrorMessage("There was a problem loading products. Please try again later.");
            });
    }
    
   // Εμφάνιση προϊόντων στο container
    function displayProducts(products) {
        if (!productsContainer) return;
        
        
        productsContainer.innerHTML = '';
        
        if (products.length === 0) {
            
            const noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-results-message';
            noResultsMessage.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>We couldn't find any products matching "${searchInput.value}"</p>
                <button class="clear-search">Clear Search</button>
            `;
            
            productsContainer.appendChild(noResultsMessage);
            
            
            const clearButton = noResultsMessage.querySelector('.clear-search');
            clearButton.addEventListener('click', function() {
                searchInput.value = '';
                loadAllProducts();
            });
            
            return;
        }
        
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-product-id', product._id);
            
           
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
            
            
            const starsContainer = productCard.querySelector('.stars-container');
            if (starsContainer) {
                const starRating = calculateStarRating(product.likes || 0);
                updateStarsDisplay(starsContainer, starRating);
            }
            
            
            addEventListenersToProductCard(productCard, product);
        });
        
        
        makeProductCardsClickable();

        
    }
    
    // Προσθήκη event listeners σε κάθε προϊόν
    function addEventListenersToProductCard(productCard, product) {
    
        const likeButton = productCard.querySelector('.like-button');
        if (likeButton) {
            likeButton.addEventListener('click', function(e) {
                e.stopPropagation(); 
                
                const heartIcon = this.querySelector('i');
                heartIcon.classList.toggle('far');
                heartIcon.classList.toggle('fas');
                heartIcon.classList.toggle('liked');
                
               
                likeProduct(product._id);
            });
        }
        
       
        const quickViewButton = productCard.querySelector('.quick-view');
        if (quickViewButton) {
            quickViewButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); 

                const productImage = productCard.querySelector('.product-image img').src;
                const productName = productCard.querySelector('h3').textContent;
                
                
                showImageModal(productImage, productName);
            });
        }
        
       
        const addToCartButton = productCard.querySelector('.add-to-cart');
        if (addToCartButton) {
            addToCartButton.addEventListener('click', function(e) {
                e.stopPropagation(); 
                addToCart(product);
            });
        }
    }
    
    //Εμφάνιση μηνύματος σφάλματος
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
    
 //Αποστολή αιτήματος like στο API και ενημέρωση UI στο products
function likeProduct(productId) {
    console.log("Liking product:", productId);
    
    
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
    
    // Προσθήκη προϊόντος στο καλάθι
    function addToCart(product) {
        
        let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
        
        
        const cartItem = {
            id: product._id,
            name: product.name,
            price: product.price,
            image: `images/products/${product.image}`,
            size: '41', 
            quantity: 1
        };
        
        
        const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
        
        if (existingItemIndex > -1) {
            
            cart[existingItemIndex].quantity++;
        } else {
            
            cart.push(cartItem);
        }
        
       
        localStorage.setItem('brkCart', JSON.stringify(cart));
        
        
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            let currentCount = parseInt(cartCount.textContent);
            currentCount++;
            cartCount.textContent = currentCount;
        }
        
        
        showAddedToCartMessage();
    }
    
   //Εμφάνιση μηνύματος προσθήκης στο καλάθι
    function showAddedToCartMessage() {
        const message = document.createElement('div');
        message.className = 'cart-message';
        message.innerHTML = '<i class="fas fa-check"></i> Added to cart!';
        document.body.appendChild(message);
        
       
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
    
    
    
   //Φιλτρα προϊόντων με βάση την τιμή
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
    
   //Προωθηση στην σελίδα λεπτομερειών προϊόντος όταν κάνω κλικ 
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
    
   // Εμφάνιση modal εικόνας προϊόντος
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
    
    //css για το modal
    function addImageModalStyles() {
        if (document.getElementById('image-modal-styles')) {
            return; 
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
    
    
    addImageModalStyles();
    updateAllProductRatings();
});

//Ενημερωση της εμφάνισης των αστεριών 
function updateStarsDisplay(container, rating) {
    if (!container) return;
    
    
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

// Υπολογισμός των αστεριών με βάση τα likes
function calculateStarRating(likes) {
    if (likes === 0) return 0;
    if (likes >= 30) return 5;
    
    
    const rating = 1 + Math.floor(likes / 3) * 0.5;
    
    return Math.min(5, rating);
}

// Ενημέρωση όλων των προϊόντων στο products με βάση τα likes 
function updateAllProductRatings() {
   
    const ratingContainers = document.querySelectorAll('.product-rating');
    
    ratingContainers.forEach(container => {
       
        const likesSpan = container.querySelector('span');
        if (!likesSpan) return;
        
        
        const likesMatch = likesSpan.textContent.match(/\((\d+)\)/);
        if (!likesMatch) return;
        
        const likes = parseInt(likesMatch[1]);
        
        
        const starsContainer = document.createElement('span');
        starsContainer.className = 'stars-container';
        
       
        container.insertBefore(starsContainer, likesSpan);
        
       
        const oldStars = container.querySelectorAll('i.fa-star, i.fa-star-half-alt');
        oldStars.forEach(star => star.remove());
        
      
        const starRating = calculateStarRating(likes);
        
        
        updateStarsDisplay(starsContainer, starRating);
    });
}