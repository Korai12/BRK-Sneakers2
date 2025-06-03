//Διαχειρίζεται όλη η λειτουργικότητα της σελίδας λεπτομερειών προϊόντος.

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product_id');
    
    if (productId) {
       
        loadProductDetails(productId);
    } else {
        console.warn('No product ID provided in URL');
    }
    //Αρχικοποίησεις λειτουργιών της σελίδας
    initImageGallery();
    initSizeSelection();
    initColorSelection();
    initQuantityControls();
    initTabs();
    initAddToCart();
    initWishlistButton();
});

// 
function loadProductDetails(productId) {
    
    showLoading(true);
    
    
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productId);
    
    let apiUrl = '';
    if (isValidObjectId) {
        apiUrl = `/api/products/${productId}`;
    } else {
        
        if (productId.startsWith('product-')) {
            
            const productIndex = productId.replace('product-', '');
            apiUrl = `/api/products?product_index=${productIndex}`;
        } else {
            // Εναλλακτική χρήση sample προϊόντος
            useSampleProductData(productId);
            return; 
        }
    }
    
    
    
    // Fetch λεπτομερειών προϊόντος από API
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
            
            updateProductUI(product);
            showLoading(false);
            
            // Προσθήκη αυτού του προϊόντος στα πρόσφατα προβληθέντα
            addToRecentlyViewed(product._id);
            
            // Φόρτωση σχετικών προϊόντων
            loadRelatedProducts(product.category, product._id);
            
            // Φόρτωση πρόσφατα προβληθέντων προϊόντων
            loadRecentlyViewedProducts(product._id);
        })
        .catch(error => {
           
            showLoading(false);
            
            
            useSampleProductData(productId);
        });
}

// Εναλλακτική συνάρτηση για χρήση sample δεδομένων όταν το API αποτυγχάνει.
function useSampleProductData(productId) {
    
    const productNum = productId.includes('-') ? 
        parseInt(productId.split('-')[1]) : 1;
    
    
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
    
    
    updateProductUI(sampleProduct);
    
    // Εμφάνιση προειδοποίησης ότι πρόκειται για sample 
    const container = document.querySelector('.product-detail-container');
    if (container) {
        const warning = document.createElement('div');
        warning.className = 'sample-data-warning';
        warning.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Using sample data: API connection failed.';
        container.prepend(warning);
    }
}

//Ενημέρωση UI με λεπτομέρειες προϊόντος
function updateProductUI(product) {
    console.log('Updating UI with product:', product);
    
    
    document.title = `BRK Sneakers - ${product.name}`;
    
    
    const breadcrumbName = document.getElementById('product-breadcrumb-name');
    if (breadcrumbName) {
        breadcrumbName.textContent = product.name;
    }

    
    const categoryBreadcrumb = document.getElementById('product-category-breadcrumb');
    if (categoryBreadcrumb && product.category) {
        
        let displayCategory = Array.isArray(product.category) ? product.category[0] : product.category;
        
        
        displayCategory = displayCategory.charAt(0).toUpperCase() + displayCategory.slice(1);
        
        
        categoryBreadcrumb.textContent = displayCategory;
        categoryBreadcrumb.href = `products.html?category=${Array.isArray(product.category) ? product.category[0] : product.category}`;
    }

    
    
    const productName = document.getElementById('product-name');
    if (productName) {
        productName.textContent = product.name;
    }
    
     //Ενημέρωση εικόνων προϊόντος
    updateProductImages(product.photos || [product.image]);
    
    
    updateProductRating(product.likes || 0);
    
    const priceElement = document.querySelector('.product-price');
    if (priceElement) {
        const currentPrice = priceElement.querySelector('.current-price');
        if (currentPrice) {
            
            const price = typeof product.price === 'number' ? product.price : 
                           parseFloat(product.price) || 99.99;
            
            
            currentPrice.textContent = `${product.currency || '€'}${price.toFixed(2)}`;
           
        } else {
           
            priceElement.innerHTML = `<span class="current-price">${product.currency || '€'}${product.price.toFixed(2)}</span>`;
        }
    } else {
        
        console.log("Available elements:", {
            productInfo: document.querySelector('.product-information'),
            allPriceElements: document.querySelectorAll('[class*="price"]')
        });
    }
    
    // Ενημέρωση περιγραφής προϊόντος
    const descriptionElement = document.getElementById('product-description');
    if (descriptionElement) {
        descriptionElement.textContent = product.description;
    }
    
    
    updateSizes(product.sizes || []);
    
   
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
    
   
    const descriptionTab = document.getElementById('description');
    if (descriptionTab) {
        
        const heading = descriptionTab.querySelector('h3');
        let descriptionHTML = '';
        
        if (heading) {
            descriptionHTML += heading.outerHTML;
        }
        
        
        descriptionHTML += `<p>${product.description}</p>`;
        
        
        if (product.details) {
            descriptionHTML += `<p>${product.details}</p>`;
        }
        
        
        if (product.features && product.features.length > 0) {
            descriptionHTML += '<ul class="product-features">';
            product.features.forEach(feature => {
                descriptionHTML += `<li><i class="fas fa-check"></i> ${feature}</li>`;
            });
            descriptionHTML += '</ul>';
        }
        
        descriptionTab.innerHTML = descriptionHTML;
    }
    
    
    const specsTab = document.getElementById('specifications');
    if (specsTab && product.specs) {
        
        const heading = specsTab.querySelector('h3');
        let specsHTML = '';
        
        if (heading) {
            specsHTML += heading.outerHTML;
        }
        
       
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
    
    
    const reviewsTab = document.getElementById('reviews');
    if (reviewsTab) {
        
        const heading = reviewsTab.querySelector('h3');
        if (heading) {
            heading.textContent = 'Product Popularity';
        }
        
        
        const ratingNumber = reviewsTab.querySelector('.rating-number');
        if (ratingNumber) {
            const likesRating = Math.min(5, Math.max(0, Math.log10(product.likes + 1) * 2.5)).toFixed(1);
            ratingNumber.textContent = likesRating;
        }
        
       
        const reviewCount = reviewsTab.querySelector('.review-count');
        if (reviewCount) {
            reviewCount.textContent = `Based on ${product.likes} likes`;
        }
    }
}


function updateProductImages(photos) {
    
    const mainImage = document.getElementById('main-product-image');
    if (mainImage && photos.length > 0) {
        mainImage.src = `images/products/${photos[0]}`;
        mainImage.alt = document.getElementById('product-name')?.textContent || 'Product Image';
    }
    
    
    const thumbnailGallery = document.querySelector('.thumbnail-gallery');
    if (thumbnailGallery && photos.length > 0) {
        
        thumbnailGallery.innerHTML = '';
        
        
        photos.forEach((photo, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.setAttribute('data-img', `images/products/${photo}`);
            
            thumbnail.innerHTML = `<img src="images/products/${photo}" alt="Thumbnail ${index + 1}">`;
            thumbnailGallery.appendChild(thumbnail);
        });
        
        
        initImageGallery();
    }
}

//Ενημέρωση διαθέσιμων μεγεθών για το συγκεκριμενο προιον
function updateSizes(sizes) {
    const sizeOptions = document.querySelector('.size-options');
    if (sizeOptions && sizes.length > 0) {
        
        sizeOptions.innerHTML = '';
        
        
        sizes.forEach((size, index) => {
            const sizeBtn = document.createElement('button');
            sizeBtn.className = `size-btn ${index === 0 ? 'active' : ''}`;
            sizeBtn.textContent = size;
            sizeOptions.appendChild(sizeBtn);
        });
        
        
        initSizeSelection();
    }
}


function showLoading(isLoading) {
    
    const existingIndicator = document.querySelector('.loading-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    if (isLoading) {
        
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        
        
        const container = document.querySelector('.product-detail-container');
        if (container) {
           
            container.style.opacity = '0.5';
            
            
            container.parentNode.insertBefore(loadingIndicator, container);
        } else {
            
            const section = document.querySelector('.product-detail-section');
            if (section) {
                section.insertBefore(loadingIndicator, section.firstChild);
            }
        }
    } else {
        
        const container = document.querySelector('.product-detail-container');
        if (container) {
            container.style.opacity = '1';
        }
    }
}

//Εμφάνιση μηνύματος σφάλματος
function showErrorMessage(message) {
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
    `;
    
    
    const container = document.querySelector('.product-detail-container');
    if (container) {
        container.parentNode.insertBefore(errorDiv, container);
    }
}

//Αρχικοποηση εικονων
function initImageGallery() {
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (!mainImage || thumbnails.length === 0) {
        console.error('Missing elements for gallery functionality');
        return;
    }
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            
            const imageSrc = this.getAttribute('data-image');
            if (imageSrc && mainImage) {
                
                mainImage.src = imageSrc;
                
                
                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    console.log('Gallery functionality initialized');
}

//Αρχικοποίηση επιλογής μεγέθους
function initSizeSelection() {
    
    const sizeButtons = document.querySelectorAll('.size-btn');
    
    
    sizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active size
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}


function initColorSelection() {
    
    const colorButtons = document.querySelectorAll('.color-btn');
    const selectedColorText = document.getElementById('selected-color-text');
    
    
    colorButtons.forEach(button => {
        button.addEventListener('click', function() {
            
            colorButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            
            if (selectedColorText) {
                const colorName = this.getAttribute('data-color') || 'Blue';
                selectedColorText.textContent = colorName;
            }
        });
    });
}

//Αρχικοποίηση επιλογών ποσότητας
function initQuantityControls() {
    
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    
    
    if (minusBtn) {
        const newMinusBtn = minusBtn.cloneNode(true);
        minusBtn.parentNode.replaceChild(newMinusBtn, minusBtn);
        
        
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
        
        
        newPlusBtn.addEventListener('click', function() {
            let quantity = parseInt(quantityInput.value) || 1;
            if (quantity < 10) {
                quantityInput.value = quantity + 1;
            }
        });
    }
    
    
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
    
}


function initTabs() {
   
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
  
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            
            const tabId = this.getAttribute('data-tab');
            
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === tabId) {
                    pane.classList.add('active');
                }
            });
        });
    });
}

//Αρχικοποιηση για προσθήκη στο καλαθή
function initAddToCart() {
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
   
    const newAddToCartBtn = addToCartBtn.cloneNode(true);
    addToCartBtn.parentNode.replaceChild(newAddToCartBtn, addToCartBtn);
    
    
    newAddToCartBtn.addEventListener('click', function(e) {
        console.log('Add to cart button clicked');
        e.preventDefault();
        e.stopPropagation();
        
        
        const productId = new URLSearchParams(window.location.search).get('product_id') || 'sample-product';
        
        
        const productNameElement = document.getElementById('product-name');
        const productPriceElement = document.querySelector('.current-price');
        const productImageElement = document.getElementById('main-product-image');
        
        const productName = productNameElement.textContent;
        const productPrice = productPriceElement.textContent.replace(/[^0-9.]/g, '');
        const productImage = productImageElement.src;
        
        const selectedSizeBtn = document.querySelector('.size-btn.active');
        
        const selectedSize = selectedSizeBtn.textContent;
        
        
        const quantityInput = document.getElementById('quantity');
        let quantity = 1; 
        if (quantityInput) {
            quantity = parseInt(quantityInput.value);
            if (isNaN(quantity) || quantity < 1) {
                quantity = 1;
            }
        }
        
        
        // Δημιουργία αντικειμένου στο καλαθη αγορών
        const cartItem = {
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            image: productImage,
            size: selectedSize,
            quantity: quantity
        };
        
        
        let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
        console.log('Current cart before update:', JSON.parse(JSON.stringify(cart)));
        
       
        const existingItemIndex = cart.findIndex(item => 
            item.id === cartItem.id && item.size === cartItem.size);
        
        if (existingItemIndex > -1) {
            
            cart[existingItemIndex].quantity = cart[existingItemIndex].quantity + quantity;
            console.log('Updated existing item, new quantity:', cart[existingItemIndex].quantity);
        } else {
            
            cart.push(cartItem);
            console.log('Added new item with quantity:', quantity);
        }
        
        //Αποθηκευση καλαθης τοπικα
        localStorage.setItem('brkCart', JSON.stringify(cart));
       
        
        // Ενημέρωση μετρητή καλαθιού στο header
        updateCartCount();
        
        // Εμφάνιση μηνύματος
        showAddedToCartMessage();
        
        
        const cartSidebar = document.querySelector('.cart-sidebar');
        if (cartSidebar && typeof updateCartSidebar === 'function') {
            updateCartSidebar(cartSidebar, cart);
        }
    });
    
    
}

//Συνάρτηση για ενημέρωση μετρητή καλαθιού στο header
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    const cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

//Συνάρτηση για προσθήκη στο καλαθή
function addToCart(item) {
    
    let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    
    
    const existingItemIndex = cart.findIndex(cartItem => 
        cartItem.id === item.id && cartItem.size === item.size);
    
    if (existingItemIndex > -1) {
        
        cart[existingItemIndex].quantity += item.quantity;
    } else {
        
        cart.push(item);
    }
    
    
     localStorage.setItem('brkCart', JSON.stringify(cart));
    
    
    updateCartCount();
}


//Το ιδιο σε καλυτερη μορφη
function addToCartAndUpdateUI(item) {
    
    let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    
   
    const existingItemIndex = cart.findIndex(cartItem => 
        cartItem.id === item.id && 
        cartItem.size === item.size && 
        cartItem.color === item.color
    );
    
    if (existingItemIndex > -1) {
        
        cart[existingItemIndex].quantity += item.quantity;
    } else {
        
        cart.push(item);
    }
    
   
    localStorage.setItem('brkCart', JSON.stringify(cart));
    
    
    updateCartCount();
    
    
    showAddedToCartMessage();
}



// Εμφάνιση μηνύματος προσθήκης στο καλαθι
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
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 300);
    }, 2000);
}

//Αρχικοποιηση για ζουμ στις εικονες
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
    
   
    mainImage.addEventListener('click', function() {
        zoomedImage.src = this.src;
        zoomModal.style.display = 'flex';
        setTimeout(() => {
            zoomModal.classList.add('active');
        }, 10);
        
       
        document.body.style.overflow = 'hidden';
    });
    
    
    if (zoomHint) {
        zoomHint.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            mainImage.click();
        });
    }
    
    
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            zoomModal.classList.remove('active');
            setTimeout(() => {
                zoomModal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        });
    }
    
    
    zoomModal.addEventListener('click', function(e) {
        if (e.target === zoomModal) {
            zoomModal.classList.remove('active');
            setTimeout(() => {
                zoomModal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    });
    
}

//Ενημέρωση αστεριων του προϊόντος βάσει likes
function updateProductRating(likes) {
    const ratingElement = document.querySelector('.product-rating span');
    const likesCountElement = document.getElementById('likes-count');
    
    if (ratingElement) {
        ratingElement.textContent = `(${likes} likes)`;
    }
    
    if (likesCountElement) {
        likesCountElement.textContent = likes;
    }
    
    
     const MAX_STARS = 5;
     let starRating = 0;

    if (likes === 0) {
    starRating = 0;
    } else if (likes >= 30) {
    starRating = MAX_STARS;
    } else {
    starRating = 1 + Math.floor(likes / 3) * 0.5;
    if (starRating > MAX_STARS) starRating = MAX_STARS;
    }

    starRating = Math.min(5, Math.max(0, starRating)); 

    
    updateStarsDisplay('.product-rating .stars', starRating);
    
    
    updateStarsDisplay('.average-rating .stars', starRating);
    
    
    const ratingNumber = document.querySelector('.rating-number');
    if (ratingNumber) {
        ratingNumber.textContent = starRating.toFixed(1);
    }
    
    
    const reviewCount = document.querySelector('.review-count');
    if (reviewCount) {
        reviewCount.textContent = `Based on ${likes} likes`;
    }
    
    
    const popularityBar = document.querySelector('.bar');
    if (popularityBar) {
        
        const popularityPercentage = Math.min(100, likes === 0 ? 0 : 50 + (likes * 2));
        popularityBar.style.width = `${popularityPercentage}%`;
        
        
        const barPercent = document.querySelector('.bar-percent');
        if (barPercent) {
            barPercent.textContent = `${Math.round(popularityPercentage)}%`;
        }
    }
}


function updateStarsDisplay(selector, rating) {
    const starsContainer = document.querySelector(selector);
    if (!starsContainer) return;
    
    
    starsContainer.innerHTML = '';
    
    
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
        const star = document.createElement('i');
        star.className = 'fas fa-star';
        starsContainer.appendChild(star);
    }
    
    
    const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
    if (hasHalfStar) {
        const halfStar = document.createElement('i');
        halfStar.className = 'fas fa-star-half-alt';
        starsContainer.appendChild(halfStar);
    }
    
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        const emptyStar = document.createElement('i');
        emptyStar.className = 'far fa-star';
        starsContainer.appendChild(emptyStar);
    }
}


document.addEventListener('DOMContentLoaded', function() {
    
    
    //Aρχικοποίηση λειτουργιών της σελίδας
    initImageGallery();
    
    
    initSizeSelection();
    
    
    initQuantityControls();
    
    
    initTabs();
    
    
    initZoom();
    
    
    initAddToCart();
    
    
    
    const productId = new URLSearchParams(window.location.search).get('product_id');
    if (productId) {
        loadProductDetails(productId);
        
    } 
});

//Φόρτωση σχετικών προϊόντων
function loadRelatedProducts(category, currentProductId) {
   
    
    
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
            
            
            const relatedProducts = products.filter(product => product._id !== currentProductId);
            
            
            const productsToShow = relatedProducts.slice(0, 4);
            
            // Αν δεν έχουμε αρκετά προϊόντα από την ίδια κατηγορία,περνω τυχαία προϊόντα
            if (productsToShow.length < 4) {
            if (productsToShow.length < 4) {
                fetch(`/api/products`)
                    .then(response => response.json())
                    .then(allProducts => {
                        
                        const remainingProducts = allProducts.filter(product => 
                            product._id !== currentProductId && 
                            !productsToShow.some(p => p._id === product._id)
                        );
                        
                        
                        const randomProducts = shuffleArray(remainingProducts)
                            .slice(0, 4 - productsToShow.length);
                        
                        
                        displayRelatedProducts([...productsToShow, ...randomProducts]);
                    })
                    .catch(error => {
                        console.error('Error loading additional products:', error);
                        displayRelatedProducts(productsToShow);
                    });
            } else {
                displayRelatedProducts(productsToShow);
            }
}})
        .catch(error => {
            console.error('Error loading related products:', error);
        });
}



//Πέρνω τυχαία προϊόντα από το API
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

//Εμφάνιση σχετικών προϊόντων
function displayRelatedProducts(products) {
    const container = document.querySelector('.related-products .products-grid');
    if (!container) return;
    
    
    container.innerHTML = '';
    
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-product-id', product._id);
        
        
        const starsDiv = document.createElement('div');
        starsDiv.className = 'stars';
        
        
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
        
        
        const starsContainer = productCard.querySelector('.stars-container');
        if (starsContainer) {
            
            const starRating = calculateStarRating(product.likes || 0);
            
            
            updateStarsDisplay(starsContainer, starRating);
        }
    });
    
    
    makeProductCardsClickable(container.querySelectorAll('.product-card'));
}

//Προσθήκη προϊόντων στα πρόσφατα προβληθέντα
function addToRecentlyViewed(productId) {
    
    let recentlyViewed = JSON.parse(localStorage.getItem('brkRecentlyViewed')) || [];
    
    
    recentlyViewed = recentlyViewed.filter(id => id !== productId);
    
    
    recentlyViewed.unshift(productId);
    
    
    recentlyViewed = recentlyViewed.slice(0, 10);
    
    
    localStorage.setItem('brkRecentlyViewed', JSON.stringify(recentlyViewed));
}

//Φόρτωση πρόσφατα προβληθέντων προϊόντων
function loadRecentlyViewedProducts(currentProductId) {
    
    const recentlyViewed = JSON.parse(localStorage.getItem('brkRecentlyViewed')) || [];
    
    
    const filteredIds = recentlyViewed.filter(id => id !== currentProductId);
    
    
    if (filteredIds.length === 0) {
        const section = document.querySelector('.recently-viewed');
        if (section) {
            section.style.display = 'none';
        }
        return;
    }
    
    
    const loadedProducts = [];
    let loadedCount = 0;
    
    
    const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount >= filteredIds.length) {
            
            const validProducts = loadedProducts.filter(product => product !== null);
            displayRecentlyViewedProducts(validProducts);
        }
    };
    
    
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
                loadedProducts.push(null); 
                checkAllLoaded();
            });
    });
}

//Εμφανιση πρόσφατα προβληθέντων προϊόντων
function displayRecentlyViewedProducts(products) {
    const container = document.querySelector('.recently-viewed-slider');
    if (!container) return;
    
    
    container.innerHTML = '';
    
   
    if (products.length === 0) {
        const section = document.querySelector('.recently-viewed');
        if (section) {
            section.style.display = 'none';
        }
        return;
    }
    
    
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
        
       
        const starsContainer = item.querySelector('.stars-container');
        if (starsContainer) {
            
            const starRating = calculateStarRating(product.likes || 0);
            
            
            updateStarsDisplay(starsContainer, starRating);
        }
        
        
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


function createStarsHTML(likes) {
    
    const stars = calculateStarRating(likes);
    
    
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.3 && stars % 1 <= 0.7;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}


function makeProductCardsClickable(cards) {
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            
            if (e.target.closest('.product-actions') || 
                e.target.tagName === 'BUTTON' || 
                e.target.closest('button')) {
                return;
            }
            
            
            const productId = this.getAttribute('data-product-id');
            window.location.href = `product-detail.html?product_id=${productId}`;
        });
        
        
        card.style.cursor = 'pointer';
        
       
        const likeButton = card.querySelector('.like-button');
        if (likeButton) {
            likeButton.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = card.getAttribute('data-product-id');
                apiConnector.likeProduct(productId)
                    .then(data => {
                        console.log('Product liked:', data);
                        
                    })
                    .catch(error => {
                        console.error('Error liking product:', error);
                    });
            });
        }
        
       
    });
}

//Υπολογισμος αστεριων με βαση των likes
function calculateStarRating(likes) {
    if (likes === 0) return 0;
    if (likes >= 30) return 5;
    
    // Start with 1 star, add 0.5 for every 3 likes
    const rating = 1 + Math.floor(likes / 3) * 0.5;
    
    return Math.min(5, rating);
}


//Προσθηκη στο wishlist
function addCurrentProductToWishlist() {
    
    if (window.profileUtils && !window.profileUtils.checkUserLoggedIn()) {
        window.profileUtils.showAuthModal('login');
        return;
    }
    
    
    const productId = new URLSearchParams(window.location.search).get('product_id');
    const productName = document.getElementById('product-name').textContent;
    const productPrice = document.querySelector('.current-price').textContent.replace(/[^0-9.]/g, '');
    const productImage = document.getElementById('main-product-image').src;
    
    
    const wishlistItem = {
        id: productId,
        name: productName,
        price: parseFloat(productPrice),
        image: productImage
    };
    
    
    if (window.profileUtils && window.profileUtils.addToWishlist) {
        window.profileUtils.addToWishlist(wishlistItem);
    }
}

//Αρχικοποίηση κουμπιού wishlist
function initWishlistButton() {
    const wishlistBtn = document.querySelector('.wishlist-btn');
    if (!wishlistBtn) return;
    
    
    wishlistBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        
        const productId = new URLSearchParams(window.location.search).get('product_id') || 'unknown';
        const productName = document.getElementById('product-name')?.textContent || 'Product';
        const productImageElement = document.getElementById('main-product-image');
        const productImage = productImageElement ? productImageElement.src : '';
        
        
        const priceElement = document.querySelector('.current-price');
        let productPrice = 0;
        if (priceElement) {
            const priceText = priceElement.textContent;
            const priceMatch = priceText.match(/[\d.]+/);
            if (priceMatch) {
                productPrice = parseFloat(priceMatch[0]);
            }
        }
        
        
        if (window.profileUtils && !window.profileUtils.checkUserLoggedIn()) {
            
            if (window.profileUtils.showAuthModal) {
                window.profileUtils.showAuthModal('login');
               showNotification('Please log in to add items to your wishlist.', 'info');
            } else {
               showNotification('Please log in to add items to your wishlist.', 'info');
                window.location.href = 'profile.html';
            }
            return;
        }
        
        
        const wishlistItem = {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage
        };
        
        
        if (window.profileUtils && window.profileUtils.addToWishlist) {
            window.profileUtils.addToWishlist(wishlistItem);
        } else {
            
            addToWishlistFallback(wishlistItem);
        }
        
        
        this.classList.add('active');
        this.querySelector('i').classList.remove('far');
        this.querySelector('i').classList.add('fas');
    });
    
    
    checkWishlistState(wishlistBtn);
}


//Συναρτηση οπου ελέγχει την κατάσταση του wishlist για το τρέχον προϊόν
function checkWishlistState(wishlistBtn) {
    
    const userData = window.profileUtils?.getUserData();
    if (!userData) return;
    
    
    const productId = new URLSearchParams(window.location.search).get('product_id');
    if (!productId) return;
    
    
    const userWishlist = JSON.parse(localStorage.getItem('brkWishlist')) || {};
    const wishlist = userWishlist[userData.id] || [];
    
    const inWishlist = wishlist.some(item => item.id === productId);
    
    
    if (inWishlist) {
        wishlistBtn.classList.add('active');
        const icon = wishlistBtn.querySelector('i');
        if (icon) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
    }
}


//Περιπτοση που δεν ειναι logged in
function addToWishlistFallback(item) {
    
    const userData = JSON.parse(localStorage.getItem('brkUser'));
    if (!userData) {
        showNotification('Please log in to add items to your wishlist.', 'info');
        return;
    }
    
    
    const userWishlist = JSON.parse(localStorage.getItem('brkWishlist')) || {};
    const wishlist = userWishlist[userData.id] || [];
    
    
    const existingItem = wishlist.find(wishlistItem => wishlistItem.id === item.id);
    
    if (!existingItem) {
        
        wishlist.push(item);
        
        
        userWishlist[userData.id] = wishlist;
        localStorage.setItem('brkWishlist', JSON.stringify(userWishlist));
        
        
        showNotification('Product added to wishlist!', 'success');
    } else {
        
        showNotification('This product is already in your wishlist!', 'info');
    }
}

