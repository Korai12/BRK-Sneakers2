// Shopping Cart Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart from localStorage if it exists
    let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    
    // Update cart count in header
    updateCartCount();
    
    // Add event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart, .add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product information
            let productId, productName, productPrice, productImage, productSize, productColor, productQuantity;
            
            // Check if clicked from product card or from quick view modal
            if (this.classList.contains('add-to-cart')) {
                // Clicked from product card
                const productCard = this.closest('.product-card');
                productId = productCard.getAttribute('data-product-id');
                productName = productCard.querySelector('h3').textContent;
                productImage = productCard.querySelector('.product-image img').src;
                productPrice = productCard.querySelector('.product-price').textContent.trim();
                
                // Default values for size, color, and quantity when added from product card
                productSize = '8';
                productColor = 'Default';
                productQuantity = 1;
            } else {
                // Clicked from quick view modal
                const modal = document.getElementById('quick-view-modal');
                productId = modal.getAttribute('data-product-id');
                productName = document.getElementById('modal-product-name').textContent;
                productImage = document.getElementById('modal-product-image').src;
                productPrice = document.getElementById('modal-product-price').textContent.trim();
                
                // Get selected size, color, and quantity from modal
                const activeSize = modal.querySelector('.size-btn.active');
                productSize = activeSize ? activeSize.textContent : '8';
                
                const activeColor = modal.querySelector('.color-btn.active');
                productColor = activeColor ? activeColor.getAttribute('data-color') || 'Default' : 'Default';
                
                const quantityInput = document.getElementById('quantity');
                productQuantity = quantityInput ? parseInt(quantityInput.value) : 1;
            }
            
            // Format price (remove currency symbol and convert to number)
            const priceValue = parseFloat(productPrice.replace(/[^0-9.-]+/g, ""));
            
            // Create cart item object
            const cartItem = {
                id: productId,
                name: productName,
                price: priceValue,
                image: productImage,
                size: productSize,
                color: productColor,
                quantity: productQuantity
            };
            
            // Add to cart
            addToCart(cartItem);
            
            // Show success message
            showAddedToCartMessage();
            
            // If modal is open, close it
            const modal = document.getElementById('quick-view-modal');
            if (modal && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    });
    
    // Function to add item to cart
    function addToCart(item) {
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
    }
    
    // Function to update cart count in header
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    const cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}
    
    // Add event listener to cart icon in header
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            showCartSidebar();
        });
    }
    
    // Function to show cart sidebar
// Function to show cart sidebar
function showCartSidebar() {
    // Remove existing cart sidebar if it exists
    const existingSidebar = document.querySelector('.cart-sidebar');
    if (existingSidebar) {
        document.body.removeChild(existingSidebar);
        return;
    }
    
    // Create cart sidebar
    const cartSidebar = document.createElement('div');
    cartSidebar.className = 'cart-sidebar';
    
    // Get cart items from localStorage
    const cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    
    // Calculate cart total
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Generate cart items HTML
    let cartItemsHTML = '';
    if (cart.length === 0) {
        cartItemsHTML = '<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p></div>';
    } else {
        cart.forEach((item, index) => {
            cartItemsHTML += `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="cart-item-meta">Size: ${item.size} | Color: ${item.color || 'standart'}</p>
                        <div class="cart-item-price-qty">
                            <span class="cart-item-price">€${parseFloat(item.price).toFixed(2)}</span>
                            <div class="cart-item-quantity">
                                <button class="qty-btn minus" data-index="${index}">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn plus" data-index="${index}">+</button>
                            </div>
                        </div>
                    </div>
                    <button class="remove-item" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        });
    }
    
    // Complete cart sidebar HTML
    cartSidebar.innerHTML = `
        <div class="cart-sidebar-header">
            <h3>Your Shopping Cart</h3>
            <button class="close-cart"><i class="fas fa-times"></i></button>
        </div>
        <div class="cart-items">
            ${cartItemsHTML}
        </div>
        <div class="cart-sidebar-footer">
            <div class="cart-total">
                <span>Total:</span>
                <span>€${cartTotal.toFixed(2)}</span>
            </div>
            <button class="checkout-btn ${cart.length === 0 ? 'disabled' : ''}">Proceed to Checkout</button>
            <button class="continue-shopping">Continue Shopping</button>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(cartSidebar);
    
    // Add event listeners to cart sidebar
    // Close button
    const closeButton = cartSidebar.querySelector('.close-cart');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            cartSidebar.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(cartSidebar)) {
                    document.body.removeChild(cartSidebar);
                }
            }, 300);
        });
    }
    
    // Continue shopping button
    const continueShoppingBtn = cartSidebar.querySelector('.continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            cartSidebar.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(cartSidebar)) {
                    document.body.removeChild(cartSidebar);
                }
            }, 300);
        });
    }
    
    // Remove item buttons
    const removeButtons = cartSidebar.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                cart.splice(index, 1);
                localStorage.setItem('brkCart', JSON.stringify(cart));
                updateCartCount();
                
                // Update cart without closing
                updateCartSidebar(cartSidebar, cart);
            }
        });
    });
    
    // Quantity buttons
    const minusButtons = cartSidebar.querySelectorAll('.qty-btn.minus');
    const plusButtons = cartSidebar.querySelectorAll('.qty-btn.plus');
    
    minusButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                    localStorage.setItem('brkCart', JSON.stringify(cart));
                    updateCartCount();
                    
                    // Update cart without closing
                    updateCartSidebar(cartSidebar, cart);
                }
            }
        });
    });
    
    plusButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                cart[index].quantity++;
                localStorage.setItem('brkCart', JSON.stringify(cart));
                updateCartCount();
                
                // Update cart without closing
                updateCartSidebar(cartSidebar, cart);
            }
        });
    });
    
    // Checkout button
    const checkoutBtn = cartSidebar.querySelector('.checkout-btn');
    if (checkoutBtn && !checkoutBtn.classList.contains('disabled')) {
        checkoutBtn.addEventListener('click', function() {
            alert('Checkout functionality would be implemented here.');
            // In a real implementation, this would redirect to a checkout page
        });
    }
    
    // Show cart sidebar with animation
    setTimeout(() => {
        cartSidebar.classList.add('active');
    }, 10);
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function closeCart(e) {
        if (cartSidebar && !cartSidebar.contains(e.target) && 
            e.target !== document.querySelector('.cart-icon') && 
            !e.target.closest('.cart-icon')) {
            cartSidebar.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(cartSidebar)) {
                    document.body.removeChild(cartSidebar);
                }
            }, 300);
            document.removeEventListener('click', closeCart);
        }
    });
}

// New function to update cart sidebar without closing it
function updateCartSidebar(cartSidebar, cart) {
    // Calculate cart total
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Update cart items HTML
    let cartItemsHTML = '';
    if (cart.length === 0) {
        cartItemsHTML = '<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p></div>';
        
        // Update checkout button to disabled
        const checkoutBtn = cartSidebar.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.classList.add('disabled');
        }
    } else {
        cart.forEach((item, index) => {
            cartItemsHTML += `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="cart-item-meta">Size: ${item.size} | Color: ${item.color || 'standart'}</p>
                        <div class="cart-item-price-qty">
                            <span class="cart-item-price">€${parseFloat(item.price).toFixed(2)}</span>
                            <div class="cart-item-quantity">
                                <button class="qty-btn minus" data-index="${index}">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn plus" data-index="${index}">+</button>
                            </div>
                        </div>
                    </div>
                    <button class="remove-item" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        });
        
        // Update checkout button to enabled
        const checkoutBtn = cartSidebar.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.classList.remove('disabled');
        }
    }
    
    // Update cart items container
    const cartItemsContainer = cartSidebar.querySelector('.cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = cartItemsHTML;
    }
    
    // Update total
    const totalDisplay = cartSidebar.querySelector('.cart-total span:last-child');
    if (totalDisplay) {
        totalDisplay.textContent = `€${cartTotal.toFixed(2)}`;
    }
    
    // Re-add event listeners for new buttons
    // Remove item buttons
    const removeButtons = cartSidebar.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                cart.splice(index, 1);
                localStorage.setItem('brkCart', JSON.stringify(cart));
                updateCartCount();
                
                // Update cart without closing
                updateCartSidebar(cartSidebar, cart);
            }
        });
    });
    
    // Quantity buttons
    const minusButtons = cartSidebar.querySelectorAll('.qty-btn.minus');
    const plusButtons = cartSidebar.querySelectorAll('.qty-btn.plus');
    
    minusButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                    localStorage.setItem('brkCart', JSON.stringify(cart));
                    updateCartCount();
                    
                    // Update cart without closing
                    updateCartSidebar(cartSidebar, cart);
                }
            }
        });
    });
    
    plusButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                cart[index].quantity++;
                localStorage.setItem('brkCart', JSON.stringify(cart));
                updateCartCount();
                
                // Update cart without closing
                updateCartSidebar(cartSidebar, cart);
            }
        });
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
                if (document.body.contains(message)) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 2000);
    }
    
    // Add CSS for cart sidebar
    const cartStyle = document.createElement('style');
    cartStyle.textContent = `
        .cart-sidebar {
            position: fixed;
            top: 0;
            right: -400px;
            width: 100%;
            max-width: 400px;
            height: 100%;
            background-color: white;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            transition: right 0.3s ease;
            display: flex;
            flex-direction: column;
        }
        
        .cart-sidebar.active {
            right: 0;
        }
        
        .cart-sidebar-header {
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .cart-sidebar-header h3 {
            margin: 0;
        }
        
        .close-cart {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #777;
        }
        
        .cart-items {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }
        
        .empty-cart {
            text-align: center;
            padding: 40px 0;
        }
        
        .empty-cart i {
            font-size: 4rem;
            color: #ddd;
            margin-bottom: 15px;
        }
        
        .cart-item {
            display: flex;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #f0f0f0;
            position: relative;
        }
        
        .cart-item-image {
            width: 80px;
            height: 80px;
            margin-right: 15px;
        }
        
        .cart-item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 4px;
        }
        
        .cart-item-details {
            flex: 1;
        }
        
        .cart-item-details h4 {
            margin: 0 0 5px;
            font-size: 1rem;
        }
        
        .cart-item-meta {
            font-size: 0.8rem;
            color: #777;
            margin-bottom: 10px;
        }
        
        .cart-item-price-qty {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .cart-item-price {
            font-weight: 600;
        }
        
        .cart-item-quantity {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .qty-btn {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 1px solid #ddd;
            background: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        
        .remove-item {
            position: absolute;
            top: 0;
            right: 0;
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
        }
        
        .remove-item:hover {
            color: var(--primary-color);
        }
        
        .cart-sidebar-footer {
            padding: 20px;
            border-top: 1px solid #e0e0e0;
        }
        
        .cart-total {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-weight: 600;
            font-size: 1.1rem;
        }
        
        .checkout-btn, .continue-shopping {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 4px;
            font-family: 'Poppins', sans-serif;
            font-size: 1rem;
            cursor: pointer;
            margin-bottom: 10px;
        }
        
        .checkout-btn {
            background-color: var(--primary-color);
            color: white;
        }
        
        .checkout-btn.disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        
        .continue-shopping {
            background-color: white;
            border: 1px solid #ddd;
        }
    `;
    document.head.appendChild(cartStyle);
});