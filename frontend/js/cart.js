//Εδω διαχειρίζεται όλη η λειτουργικότητα του καλαθιού αγορών,οπου μπορώ να προσθέσω προϊόντα στο καλάθι, να τα αφαιρέσω, να δω το περιεχόμενο του καλαθιού και να προχωρήσω σε παραγγελια κτλ.


document.addEventListener('DOMContentLoaded', function() {
    // Αρχικοποίηση καλαθιού από localStorage
    let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    
    
    updateCartCount();
    
    
    const addToCartButtons = document.querySelectorAll('.add-to-cart, .add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            
            let productId, productName, productPrice, productImage, productSize, productColor, productQuantity;
            
            
            if (this.classList.contains('add-to-cart')) {
               
                const productCard = this.closest('.product-card');
                productId = productCard.getAttribute('data-product-id');
                productName = productCard.querySelector('h3').textContent;
                productImage = productCard.querySelector('.product-image img').src;
                productPrice = productCard.querySelector('.product-price').textContent.trim();
                
                
                productSize = '8';
                productColor = 'Default';
                productQuantity = 1;
            } else {
                
                const modal = document.getElementById('quick-view-modal');
                const productId = productCard ? productCard.getAttribute('data-product-id') : null;
                if (!productId) {
                  console.error('Product ID not found for cart operation');
                 return;}
                 productName = document.getElementById('modal-product-name').textContent;
                productImage = document.getElementById('modal-product-image').src;
                productPrice = document.getElementById('modal-product-price').textContent.trim();
                
                
                const activeSize = modal.querySelector('.size-btn.active');
                productSize = activeSize ? activeSize.textContent : '8';
                
                const activeColor = modal.querySelector('.color-btn.active');
                productColor = activeColor ? activeColor.getAttribute('data-color') || 'Default' : 'Default';
                
                const quantityInput = document.getElementById('quantity');
                productQuantity = quantityInput ? parseInt(quantityInput.value) : 1;
            }
            
            
            const priceValue = parseFloat(productPrice.replace(/[^0-9.-]+/g, ""));
            
            //Δημιουργία αντικειμένου προϊόντος για το καλάθι
            const cartItem = {
                id: productId,
                name: productName,
                price: priceValue,
                image: productImage,
                size: productSize,
                color: productColor,
                quantity: productQuantity
            };
            
            
            addToCart(cartItem);
            
            
            showAddedToCartMessage();
            
            
            const modal = document.getElementById('quick-view-modal');
            if (modal && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    });
    
    //Προσθήκη προϊόντος στο καλάθι
    function addToCart(item) {
       
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
    }
    
//Ενημερωση του αριθμού προϊόντων στο καλάθι
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    const cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}
    
    
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            showCartSidebar();
        });
    }
    

//Εμφανιση του καλαθιού αγορών
function showCartSidebar() {
    
    const existingSidebar = document.querySelector('.cart-sidebar');
    if (existingSidebar) {
        document.body.removeChild(existingSidebar);
        return;
    }
    
    
    const cartSidebar = document.createElement('div');
    cartSidebar.className = 'cart-sidebar';
    
    
    const cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    
    
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    
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
    
    
    document.body.appendChild(cartSidebar);
    
    
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

//Λειτουργια παραγγελιας
function handleCheckout() {

const isLoggedIn = window.profileUtils ? window.profileUtils.checkUserLoggedIn() : false;
if (!isLoggedIn) {
    
    if (window.profileUtils && window.profileUtils.showAuthModal) {
        window.profileUtils.showAuthModal('login');
        
        
        showNotification('Please log in or sign up to continue with checkout.', 'info');
    } else {
        
        window.location.href = 'profile.html';
    }
    return;
}


const cart = JSON.parse(localStorage.getItem('brkCart')) || [];


if (cart.length === 0) {
    showNotification('Your cart is empty!', 'warning');
    return;
}


const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

//Δημιουργία παραγγελίας
if (window.profileUtils && window.profileUtils.createOrder) {
    const order = window.profileUtils.createOrder(cart, cartTotal);
    
    if (order) {
        
        showNotification(`Order #${order.id} placed successfully! Thank you for your purchase.`, 'success');        
        
        localStorage.setItem('brkCart', JSON.stringify([]));
        
        
        updateCartCount();
        
        
        const cartSidebar = document.querySelector('.cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(cartSidebar)) {
                    document.body.removeChild(cartSidebar);
                }
            }, 300);
        }
        
        
        window.location.href = 'profile.html#orders';
    }
} else {
    
    showNotification('Thank you for your order! Your order has been processed.', 'success');    
    
    localStorage.setItem('brkCart', JSON.stringify([]));
    updateCartCount();
}
}
    
    
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
    
    
    const removeButtons = cartSidebar.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); 
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                cart.splice(index, 1);
                localStorage.setItem('brkCart', JSON.stringify(cart));
                updateCartCount();
                
                
                updateCartSidebar(cartSidebar, cart);
            }
        });
    });
    
    
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
                    
                    
                    updateCartSidebar(cartSidebar, cart);
                }
            }
        });
    });
    
    plusButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); 
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                cart[index].quantity++;
                localStorage.setItem('brkCart', JSON.stringify(cart));
                updateCartCount();
                
                
                updateCartSidebar(cartSidebar, cart);
            }
        });
    });
    
    
const checkoutBtn = cartSidebar.querySelector('.checkout-btn');
if (checkoutBtn && !checkoutBtn.classList.contains('disabled')) {
    checkoutBtn.addEventListener('click', function() {
        handleCheckout();
    });
}
    
   
    setTimeout(() => {
        cartSidebar.classList.add('active');
    }, 10);
    
    
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


function updateCartSidebar(cartSidebar, cart) {
    
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
   
    let cartItemsHTML = '';
    if (cart.length === 0) {
        cartItemsHTML = '<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p></div>';
        
        
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
        
        
         const checkoutBtn = cartSidebar.querySelector('.checkout-btn');
         if (checkoutBtn && !checkoutBtn.classList.contains('disabled')) {
             checkoutBtn.addEventListener('click', function() {
        handleCheckout();
    });
}
}

    
    const cartItemsContainer = cartSidebar.querySelector('.cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = cartItemsHTML;
    }
    
    
    const totalDisplay = cartSidebar.querySelector('.cart-total span:last-child');
    if (totalDisplay) {
        totalDisplay.textContent = `€${cartTotal.toFixed(2)}`;
    }
    
   
    const removeButtons = cartSidebar.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); 
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                cart.splice(index, 1);
                localStorage.setItem('brkCart', JSON.stringify(cart));
                updateCartCount();
                
               
                updateCartSidebar(cartSidebar, cart);
            }
        });
    });
    
   
    const minusButtons = cartSidebar.querySelectorAll('.qty-btn.minus');
    const plusButtons = cartSidebar.querySelectorAll('.qty-btn.plus');
    
    minusButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); 
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                    localStorage.setItem('brkCart', JSON.stringify(cart));
                    updateCartCount();
                    
                    
                    updateCartSidebar(cartSidebar, cart);
                }
            }
        });
    });
    
    plusButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); 
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                cart[index].quantity++;
                localStorage.setItem('brkCart', JSON.stringify(cart));
                updateCartCount();
                
                
                updateCartSidebar(cartSidebar, cart);
            }
        });
    });
}
    
    // Εμφάνιση μηνύματος ότι το προϊόν προστέθηκε στο καλάθι
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
    
    //css του καλαθιού αγορών
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

