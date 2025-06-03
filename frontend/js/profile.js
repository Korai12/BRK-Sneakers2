// Λειτουργίες για το προφίλ χρήστη, σύνδεση/εγγραφή και διαχείριση λογαριασμού


document.addEventListener('DOMContentLoaded', function() {
   document.addEventListener('click', function(e) {
        
        if (e.target.classList.contains('login-btn') || 
            e.target.closest('.login-btn') || 
            e.target.id === 'show-login') {
            
            console.log('Login button clicked!');
            e.preventDefault();
            showAuthModal('login');
        }
        
        
        if (e.target.classList.contains('signup-btn') || 
            e.target.closest('.signup-btn') || 
            e.target.id === 'show-signup') {
            
            console.log('Signup button clicked!');
            e.preventDefault();
            showAuthModal('signup');
        }
    });
   
   
   
    
    initUserDropdown();
    
    
    checkLoginState();

    
    connectLoginRequiredButtons();
    
   
    initProfileTabs();
    
    
    initProfileForm();
    
    
    initAuthButtons();
    
    
    initLogoutButton();

    
});

//Δημιουργία dropdown μενού χρήστη στο header
function initUserDropdown() {
    const userIcon = document.querySelector('.header-actions .user-icon');
    if (!userIcon) return;
    
    userIcon.addEventListener('click', function(e) {
        
        e.preventDefault();
        
       
        const existingMenu = document.querySelector('.user-dropdown');
        if (existingMenu) {
            existingMenu.classList.toggle('active');
            return;
        }
        
        
        const userDropdown = document.createElement('div');
        userDropdown.className = 'user-dropdown';
        
        
        const isLoggedIn = checkUserLoggedIn();
        const userData = getUserData();
        
        if (isLoggedIn && userData) {
            
            userDropdown.innerHTML = `
                <div class="user-greeting">
                    <div class="user-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-name">
                        <p>Hello, ${userData.firstName || 'User'}</p>
                        <span>${userData.email}</span>
                    </div>
                </div>
                <ul>
                    <li><a href="profile.html"><i class="fas fa-user"></i> My Account</a></li>
                    <li><a href="profile.html#orders"><i class="fas fa-shopping-bag"></i> My Orders</a></li>
                    <li><a href="profile.html#liked-products"><i class="fas fa-thumbs-up"></i> Liked Products</a></li>
                    <li><a href="profile.html#wishlist"><i class="fas fa-heart"></i> Wishlist</a></li>
                    <li><a href="#" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                </ul>
            `;
        } else {
           
            userDropdown.innerHTML = `
                <div class="guest-message">
                    <p>Welcome to BRK Sneakers</p>
                </div>
                <div class="auth-buttons">
                    <button class="login-btn">Log In</button>
                    <button class="signup-btn">Sign Up</button>
                </div>
            `;
        }
        
        
        const iconRect = userIcon.getBoundingClientRect();
        userDropdown.style.top = (iconRect.bottom + window.scrollY) + 'px';
        userDropdown.style.right = (window.innerWidth - iconRect.right) + 'px';
        
        
        document.body.appendChild(userDropdown);
        
        
        setTimeout(() => {
            userDropdown.classList.add('active');
        }, 10);
        
        
        if (!isLoggedIn) {
            const loginBtn = userDropdown.querySelector('.login-btn');
            const signupBtn = userDropdown.querySelector('.signup-btn');
            
            loginBtn.addEventListener('click', function() {
                showAuthModal('login');
            });
            
            signupBtn.addEventListener('click', function() {
                showAuthModal('signup');
            });
        } else {
            const logoutBtn = userDropdown.querySelector('.logout-btn');
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logoutUser();
                window.location.reload();
            });
        }
        
        
        document.addEventListener('click', function closeDropdown(e) {
            if (!userDropdown.contains(e.target) && e.target !== userIcon && !e.target.closest('.user-icon')) {
                userDropdown.classList.remove('active');
                setTimeout(() => {
                    if (document.body.contains(userDropdown)) {
                        document.body.removeChild(userDropdown);
                    }
                }, 300);
                document.removeEventListener('click', closeDropdown);
            }
        });
    });
}

//Δημιουργία login και sign up buttons
function initAuthButtons() {
   
    document.addEventListener('click', function(e) {
        const target = e.target;
        
       
        if (target.classList.contains('login-btn') || target.closest('.login-btn')) {
            e.preventDefault();
            showAuthModal('login');
        }
        
       
        if (target.classList.contains('signup-btn') || target.closest('.signup-btn')) {
            e.preventDefault();
            showAuthModal('signup');
        }
    });
}


function connectLoginRequiredButtons() {
    const loginBtn = document.querySelector('.login-required .login-btn, .login-required button[id="show-login"]');
    const signupBtn = document.querySelector('.login-required .signup-btn, .login-required button[id="show-signup"]');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showAuthModal('login');
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showAuthModal('signup');
        });
    }
}

//Το logout button
function initLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
            window.location.reload();
        });
    }
}


//Ελεγχος αν ο χρήστης είναι συνδεδεμένος
function checkLoginState() {
    const isLoggedIn = checkUserLoggedIn();
    
    
    const loginRequired = document.getElementById('login-required');
    const profileContent = document.getElementById('profile-content');
    
    if (loginRequired && profileContent) {
        if (isLoggedIn) {
            loginRequired.style.display = 'none';
            profileContent.style.display = 'flex';
            
            
            populateProfileData();
            
            
            loadOrders();
            loadLikedProducts();
            loadWishlist();
        } else {
            loginRequired.style.display = 'block';
            profileContent.style.display = 'none';
        }
    }
    
    
    updateCartCount();
}


function checkUserLoggedIn() {
    const userData = localStorage.getItem('brkUser');
    return !!userData;
}

//Ανάκτηση πληροφωριών του χρήστη τοπικά
function getUserData() {
    const userData = localStorage.getItem('brkUser');
    return userData ? JSON.parse(userData) : null;
}

//Εμφάνιση του dropdown menu
function showAuthModal(type) {
   
    
    
    const existingModal = document.querySelector('.auth-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    
    const authModal = document.createElement('div');
    authModal.className = 'auth-modal';
    
   
    if (type === 'login') {
        authModal.innerHTML = `
            <div class="auth-modal-content">
                <button class="close-auth-modal"><i class="fas fa-times"></i></button>
                <h2>Log In</h2>
                <div id="login-error" class="error-message" style="display: none;">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Invalid email or password</span>
                </div>
                <form class="login-form">
                    <div class="form-group">
                        <label for="login-email">Email</label>
                        <input type="email" id="login-email" required>
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" required>
                    </div>
                    <div class="form-group checkbox">
                        <input type="checkbox" id="remember-me">
                        <label for="remember-me">Remember me</label>
                    </div>
                    <button type="submit" class="auth-submit">Log In</button>
                </form>
                <div class="auth-footer">
                    <p>Don't have an account? <a href="#" class="switch-auth" data-type="signup">Sign Up</a></p>
                </div>
            </div>
        `;
    } else {
        authModal.innerHTML = `
            <div class="auth-modal-content">
                <button class="close-auth-modal"><i class="fas fa-times"></i></button>
                <h2>Create Account</h2>
                <div id="signup-error" class="error-message" style="display: none;">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Please fill out all fields correctly</span>
                </div>
                <form class="signup-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="signup-firstname">First Name</label>
                            <input type="text" id="signup-firstname" required>
                        </div>
                        <div class="form-group">
                            <label for="signup-lastname">Last Name</label>
                            <input type="text" id="signup-lastname" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="signup-email">Email</label>
                        <input type="email" id="signup-email" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-password">Password</label>
                        <input type="password" id="signup-password" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-confirm-password">Confirm Password</label>
                        <input type="password" id="signup-confirm-password" required>
                    </div>
                    <div class="form-group checkbox">
                        <input type="checkbox" id="agree-terms" required>
                        <label for="agree-terms">I agree to the <a href="#">Terms & Conditions</a></label>
                    </div>
                    <button type="submit" class="auth-submit">Create Account</button>
                </form>
                <div class="auth-footer">
                    <p>Already have an account? <a href="#" class="switch-auth" data-type="login">Log In</a></p>
                </div>
            </div>
        `;
    }
    
    
    document.body.appendChild(authModal);
    
    
    setTimeout(() => {
        authModal.classList.add('active');
    }, 10);
    
    
    const closeBtn = authModal.querySelector('.close-auth-modal');
    closeBtn.addEventListener('click', function() {
        authModal.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(authModal)) {
                document.body.removeChild(authModal);
            }
        }, 300);
    });
    
    
    const switchLink = authModal.querySelector('.switch-auth');
    if (switchLink) {
        switchLink.addEventListener('click', function(e) {
            e.preventDefault();
            const newType = this.getAttribute('data-type');
            showAuthModal(newType);
        });
    }
    
   
    
    const form = authModal.querySelector('form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (type === 'login') {
            handleLogin(form, authModal);
        } else {
            handleSignup(form, authModal);
        }
    });
    
    
    authModal.addEventListener('click', function(e) {
        if (e.target === authModal) {
            authModal.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(authModal)) {
                    document.body.removeChild(authModal);
                }
            }, 300);
        }
    });
}

//Λειτουγία login
function handleLogin(form, modal) {
    const email = form.querySelector('#login-email').value;
    const password = form.querySelector('#login-password').value;
    
    
    if (!email || !password) {
        const errorEl = document.getElementById('login-error');
        errorEl.style.display = 'flex';
        errorEl.querySelector('span').textContent = 'Please fill out all fields';
        return;
    }
    
    
    const users = JSON.parse(localStorage.getItem('brkUsers')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        
        loginUser(user);
        
        
        modal.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            
            
            if (window.location.pathname.includes('profile.html')) {
                window.location.reload();
            }
        }, 300);
    } else {
        
        const errorEl = document.getElementById('login-error');
        errorEl.style.display = 'flex';
        errorEl.querySelector('span').textContent = 'Invalid email or password';
    }
}

//Λειτουγία sign up
function handleSignup(form, modal) {
    const firstName = form.querySelector('#signup-firstname').value;
    const lastName = form.querySelector('#signup-lastname').value;
    const email = form.querySelector('#signup-email').value;
    const password = form.querySelector('#signup-password').value;
    const confirmPassword = form.querySelector('#signup-confirm-password').value;
    const agreeTerms = form.querySelector('#agree-terms').checked;
    
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        const errorEl = document.getElementById('signup-error');
        errorEl.style.display = 'flex';
        errorEl.querySelector('span').textContent = 'Please fill out all fields';
        return;
    }
    
    if (password !== confirmPassword) {
        const errorEl = document.getElementById('signup-error');
        errorEl.style.display = 'flex';
        errorEl.querySelector('span').textContent = 'Passwords do not match';
        return;
    }
    
    if (!agreeTerms) {
        const errorEl = document.getElementById('signup-error');
        errorEl.style.display = 'flex';
        errorEl.querySelector('span').textContent = 'You must agree to the Terms & Conditions';
        return;
    }
    
    
    const users = JSON.parse(localStorage.getItem('brkUsers')) || [];
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        const errorEl = document.getElementById('signup-error');
        errorEl.style.display = 'flex';
        errorEl.querySelector('span').textContent = 'This email is already registered';
        return;
    }
    
    //Δημιουργία χρήστη
    const newUser = {
        id: Date.now().toString(), 
        firstName,
        lastName,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    
    users.push(newUser);
    localStorage.setItem('brkUsers', JSON.stringify(users));
    
    
    loginUser(newUser);
    
    
    initializeUserData(newUser.id);
    
    
    modal.classList.remove('active');
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
        
        
        showNotification('Account created successfully! You are now logged in.', 'success');
        
        
        if (window.location.pathname.includes('profile.html')) {
            window.location.reload();
        }
    }, 300);
}

//Δημιουγία πεδίων για πληροφωρίες του χρήστη
function initializeUserData(userId) {
    
    const userOrders = JSON.parse(localStorage.getItem('brkOrders')) || {};
    userOrders[userId] = [];
    localStorage.setItem('brkOrders', JSON.stringify(userOrders));
    
    
    const userWishlist = JSON.parse(localStorage.getItem('brkWishlist')) || {};
    userWishlist[userId] = [];
    localStorage.setItem('brkWishlist', JSON.stringify(userWishlist));
    
    
    const userLikedProducts = JSON.parse(localStorage.getItem('brkLikedProducts')) || {};
    userLikedProducts[userId] = [];
    localStorage.setItem('brkLikedProducts', JSON.stringify(userLikedProducts));
}

//login xwris
function loginUser(user) {
    
    const userData = {...user};
    delete userData.password;
    
    
    localStorage.setItem('brkUser', JSON.stringify(userData));
    
    
    updateCartCount();
}

//Λειτουργία logout
function logoutUser() {
    localStorage.removeItem('brkUser');
}



function initProfileTabs() {
    const tabLinks = document.querySelectorAll('.profile-nav a[data-tab]');
    const tabPanes = document.querySelectorAll('.profile-tab');
    
    if (tabLinks.length === 0 || tabPanes.length === 0) return;
    
   
    const hash = window.location.hash.substring(1);
    if (hash) {
       
        const tabLink = document.querySelector(`.profile-nav a[data-tab="${hash}"]`);
        if (tabLink) {
          
            tabPanes.forEach(pane => pane.classList.remove('active'));
            tabLinks.forEach(link => link.classList.remove('active'));
            
           
            const tabId = tabLink.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            tabLink.classList.add('active');
        }
    }
    
   
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Hide all tabs
            tabPanes.forEach(pane => pane.classList.remove('active'));
            tabLinks.forEach(link => link.classList.remove('active'));
            
           
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            this.classList.add('active');
            
           
            history.replaceState(null, null, `#${tabId}`);
        });
    });
}

//Πεδία των στοιχείων του χρήστη
function initProfileForm() {
    const accountForm = document.getElementById('account-form');
    if (!accountForm) return;
    
    
    accountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        
        const userData = getUserData();
        if (!userData) return;
        
        
        const users = JSON.parse(localStorage.getItem('brkUsers')) || [];
        const userIndex = users.findIndex(u => u.id === userData.id);
        
        if (userIndex === -1) return;
        
        
        users[userIndex].firstName = firstName || users[userIndex].firstName;
        users[userIndex].lastName = lastName || users[userIndex].lastName;
        
        
        if (currentPassword && newPassword && confirmPassword) {
           
            if (currentPassword !== users[userIndex].password) {
                showNotification('Current password is incorrect.', 'error');
                return;
            }
            
            
            if (newPassword !== confirmPassword) {
               showNotification('New passwords do not match.', 'error');
                return;
            }
            
            
            users[userIndex].password = newPassword;
        }
        
        
        localStorage.setItem('brkUsers', JSON.stringify(users));
        
        
        const updatedUserData = {
            ...userData,
            firstName: firstName || userData.firstName,
            lastName: lastName || userData.lastName
        };
        
        localStorage.setItem('brkUser', JSON.stringify(updatedUserData));
        
        
        showNotification('Profile updated successfully!', 'success');
        
        
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        
        
        populateProfileData();
    });
}

//Ενημέρωση πεδίων
function populateProfileData() {
    const userData = getUserData();
    if (!userData) return;
    
   
    const userDisplayName = document.getElementById('user-display-name');
    const userEmail = document.getElementById('user-email');
    
    if (userDisplayName) {
        userDisplayName.textContent = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User';
    }
    
    if (userEmail) {
        userEmail.textContent = userData.email || '';
    }
    
   
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('profile-email');
    
    if (firstNameInput) {
        firstNameInput.value = userData.firstName || '';
    }
    
    if (lastNameInput) {
        lastNameInput.value = userData.lastName || '';
    }
    
    if (emailInput) {
        emailInput.value = userData.email || '';
    }
}

//Ανάκτηση των παραγγελίων που αποθηκευτικαν τοπικά
function loadOrders() {
    const userData = getUserData();
    if (!userData) return;
    
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;
    
   
    const userOrders = JSON.parse(localStorage.getItem('brkOrders')) || {};
    const orders = userOrders[userData.id] || [];
    
   
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-shopping-bag"></i>
                <p>You haven't placed any orders yet.</p>
                <a href="products.html" class="cta-button">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    
    let ordersHTML = '';
    
    orders.forEach(order => {
        
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        
        const totalItems = order.items.reduce((total, item) => total + item.quantity, 0);
        
        ordersHTML += `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span class="order-id">Order #${order.id}</span><br>
                        <span class="order-date">${formattedDate}</span>
                    </div>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
                <div class="order-items">
        `;
        
        
        order.items.forEach(item => {
            ordersHTML += `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="order-item-details">
                        <h4>${item.name}</h4>
                        <div class="order-item-meta">
                            <span>Size: ${item.size}</span>
                            <span>Qty: ${item.quantity}</span>
                            <span>Price: €${parseFloat(item.price).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        ordersHTML += `
                </div>
                <div class="order-total">
                    Total: €${parseFloat(order.total).toFixed(2)}
                </div>
            </div>
        `;
    });
    
    
    ordersContainer.innerHTML = ordersHTML;
}

//Εμφάνιση προιοντων που έκανε like ο χρήστης
function loadLikedProducts() {
    const userData = getUserData();
    if (!userData) return;
    
    const likedProductsContainer = document.getElementById('liked-products-container');
    if (!likedProductsContainer) return;
    
    
    const userLikedProducts = JSON.parse(localStorage.getItem('brkLikedProducts')) || {};
    const likedProductIds = userLikedProducts[userData.id] || [];
    
    
    if (likedProductIds.length === 0) {
        
        likedProductsContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading your liked products...</p>
            </div>
        `;
        
        
        fetch('/api/popular-products')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(products => {
                displayLikedProducts(products);
            })
            .catch(error => {
                console.error('Error fetching liked products:', error);
               
                likedProductsContainer.innerHTML = `
                    <div class="no-liked-products">
                        <i class="fas fa-thumbs-up"></i>
                        <p>You haven't liked any products yet.</p>
                        <a href="products.html" class="cta-button">Explore Products</a>
                    </div>
                `;
            });
    } else {
        
        Promise.all(likedProductIds.map(id => 
            fetch(`/api/products/${id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch product ${id}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error(`Error fetching product ${id}:`, error);
                    return null;
                })
        ))
        .then(products => {
            
            const validProducts = products.filter(product => product !== null);
            displayLikedProducts(validProducts);
        })
        .catch(error => {
            console.error('Error fetching liked products:', error);
            
            likedProductsContainer.innerHTML = `
                <div class="no-liked-products">
                    <i class="fas fa-thumbs-up"></i>
                    <p>Error loading your liked products. Please try again later.</p>
                </div>
            `;
        });
    }
}

//Εμφάνιση των προιοντων που έγηναν liked
function displayLikedProducts(products) {
    const likedProductsContainer = document.getElementById('liked-products-container');
    if (!likedProductsContainer) return;
    
    
    if (!products || products.length === 0) {
        likedProductsContainer.innerHTML = `
            <div class="no-liked-products">
                <i class="fas fa-thumbs-up"></i>
                <p>You haven't liked any products yet.</p>
                <a href="products.html" class="cta-button">Explore Products</a>
            </div>
        `;
        return;
    }
    
    
    let productsHTML = '';
    
    products.forEach(product => {
        productsHTML += `
            <div class="product-card" data-product-id="${product._id}">
                <div class="product-image">
                    <img src="images/products/${product.image}" alt="${product.name}">
                    <div class="product-actions">
                        <button class="like-button active"><i class="fas fa-heart"></i></button>
                        <button class="add-to-wishlist"><i class="fas fa-plus"></i></button>
                        <button class="add-to-cart"><i class="fas fa-shopping-cart"></i></button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-bottom">
                        <p class="product-price">€${parseFloat(product.price).toFixed(2)}</p>
                        <div class="product-rating">
                            <span class="stars-container"></span>
                            <span>(${product.likes || 0})</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    
    likedProductsContainer.innerHTML = productsHTML;
    
    
    addLikedProductsEventListeners();
    
    
    updateProductRatings();
}

//Προώθηση στις λεπτομέριες του προϊόντος
function addLikedProductsEventListeners() {
    
    const productCards = document.querySelectorAll('#liked-products-container .product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            
            if (e.target.closest('button')) return;
            
            const productId = this.getAttribute('data-product-id');
            window.location.href = `product-detail.html?product_id=${productId}`;
        });
    });
    
    
    const addToCartButtons = document.querySelectorAll('#liked-products-container .add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            
            const productCard = this.closest('.product-card');
            const productId = productCard.getAttribute('data-product-id');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent.replace('€', '');
            const productImage = productCard.querySelector('img').src;
            
            
            addToCart({
                id: productId,
                name: productName,
                price: parseFloat(productPrice),
                image: productImage,
                size: '41',
                quantity: 1
            });
            
            
            showNotification('Product added to cart!', 'success');
        });
    });
    
   
    const addToWishlistButtons = document.querySelectorAll('#liked-products-container .add-to-wishlist');
    addToWishlistButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); 
            
            const productCard = this.closest('.product-card');
            const productId = productCard.getAttribute('data-product-id');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent.replace('€', '');
            const productImage = productCard.querySelector('img').src;
            
            
            addToWishlist({
                id: productId,
                name: productName,
                price: parseFloat(productPrice),
                image: productImage
            });
        });
    });
}


//Ενημέρωση των αστεριών με βάση τα likes στο profile
function updateProductRatings() {
   
    const starContainers = document.querySelectorAll('.stars-container');
    
    starContainers.forEach(container => {
        
        const likesText = container.nextElementSibling?.textContent || '(0)';
        const likesMatch = likesText.match(/\((\d+)\)/);
        const likes = likesMatch ? parseInt(likesMatch[1]) : 0;
        
        
        let rating = 0;
        if (likes === 0) {
            rating = 0;
        } else if (likes <= 5) {
            rating = 2.5 + (likes * 0.3);
        } else if (likes <= 20) {
            rating = 4 + ((likes - 5) * 0.05);
        } else {
            rating = 5;
        }
        
        rating = Math.min(5, Math.max(0, rating));
        
        
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
    });
}

//Ανάκτηση του wishlist του χρήστη
function loadWishlist() {
    const userData = getUserData();
    if (!userData) return;
    
    const wishlistContainer = document.getElementById('wishlist-container');
    if (!wishlistContainer) return;
    
    
    const userWishlist = JSON.parse(localStorage.getItem('brkWishlist')) || {};
    const wishlist = userWishlist[userData.id] || [];
    
   
    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = `
            <div class="no-wishlist">
                <i class="fas fa-heart"></i>
                <p>Your wishlist is empty.</p>
                <a href="products.html" class="cta-button">Explore Products</a>
            </div>
        `;
        return;
    }
    
    
    let wishlistHTML = '';
    
    wishlist.forEach(item => {
        wishlistHTML += `
            <div class="wishlist-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="wishlist-item-info">
                    <h3>${item.name}</h3>
                    <p>€${parseFloat(item.price).toFixed(2)}</p>
                    <div class="wishlist-item-actions">
                        <button class="add-to-cart-btn" data-product-id="${item.id}">Add to Cart</button>
                        <button class="remove-wishlist-btn" data-product-id="${item.id}">Remove</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    
    wishlistContainer.innerHTML = wishlistHTML;
    
    
    addWishlistEventListeners();
}

// Προσθήκη event listeners για τα κουμπιά του wishlist στο profile
function addWishlistEventListeners() {
    
    const addToCartButtons = document.querySelectorAll('.wishlist-item .add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            
            
            const userData = getUserData();
            const userWishlist = JSON.parse(localStorage.getItem('brkWishlist')) || {};
            const wishlist = userWishlist[userData.id] || [];
            
            
            const product = wishlist.find(item => item.id === productId);
            
            if (product) {
                
                const price = parseFloat(product.price);
                if (isNaN(price) || price === 0) {
                    
                    fetch(`/api/products/${productId}`)
                        .then(response => response.json())
                        .then(data => {
                           
                            addToCart({
                                id: product.id,
                                name: product.name,
                                price: data.price || 99.99, 
                                image: product.image,
                                size: '41', 
                                quantity: 1
                            });
                            
                           
                            showNotification('Product added to wishlist!', 'success');
                        })
                        .catch(error => {
                            console.error('Error fetching product:', error);
                            
                            addToCart({
                                id: product.id,
                                name: product.name,
                                price: 99.99,
                                image: product.image,
                                size: '41', 
                                quantity: 1
                            });
                            
                            
                            showNotification('Product added to cart!', 'success');
                        });
                } else {
                    
                    addToCart({
                        id: product.id,
                        name: product.name,
                        price: price,
                        image: product.image,
                        size: '41', 
                        quantity: 1
                    });
                    
                    
                    showNotification('Product added to cart!', 'success');
                }
            }
        });
    });
    
    
    const removeButtons = document.querySelectorAll('.wishlist-item .remove-wishlist-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            
            st
            const userData = getUserData();
            const userWishlist = JSON.parse(localStorage.getItem('brkWishlist')) || {};
            const wishlist = userWishlist[userData.id] || [];
            
            
            const updatedWishlist = wishlist.filter(item => item.id !== productId);
            
            
            userWishlist[userData.id] = updatedWishlist;
            localStorage.setItem('brkWishlist', JSON.stringify(userWishlist));
            
            
            loadWishlist();
        });
    });
    
    
    const wishlistItems = document.querySelectorAll('.wishlist-item');
    wishlistItems.forEach(item => {
        item.addEventListener('click', function(e) {
            
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            const productId = this.getAttribute('data-product-id');
            window.location.href = `product-detail.html?product_id=${productId}`;
        });
    });
}

//Προσθήκη στο wishlist
function addToWishlist(item) {
    
    const userData = getUserData();
    if (!userData) {
       
        showAuthModal('login');
        return;
    }
    
    
    if (!item.price || isNaN(parseFloat(item.price)) || parseFloat(item.price) === 0) {
        console.error('Invalid price for wishlist item:', item);
        item.price = 99.99; 
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


function trackLikedProduct(productId) {
    
    const userData = getUserData();
    if (!userData) return;
    
   
    const userLikedProducts = JSON.parse(localStorage.getItem('brkLikedProducts')) || {};
    const likedProducts = userLikedProducts[userData.id] || [];
    
   
    if (!likedProducts.includes(productId)) {
       
        likedProducts.push(productId);
        
       
        userLikedProducts[userData.id] = likedProducts;
        localStorage.setItem('brkLikedProducts', JSON.stringify(userLikedProducts));
    }
}

//Προσθήκη στο καλάθι
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

//Ενημερωση του αριθμού των προϊόντων στο καλάθι
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    
    const cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    
    
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    
    cartCount.textContent = totalItems;
}

//Δημιουργία παραγγελίας
function createOrder(items, total) {
    
    const userData = getUserData();
    if (!userData) {
        return null;
    }
    
    
    const newOrder = {
        id: Date.now().toString().substring(7), // Simple ID generation
        userId: userData.id,
        items: items,
        total: total,
        date: new Date().toISOString(),
        status: 'completed'
    };
    
    
    const userOrders = JSON.parse(localStorage.getItem('brkOrders')) || {};
    const orders = userOrders[userData.id] || [];
    
    
    orders.push(newOrder);
    
    
    userOrders[userData.id] = orders;
    localStorage.setItem('brkOrders', JSON.stringify(userOrders));
    
   
    localStorage.setItem('brkCart', JSON.stringify([]));
    updateCartCount();
    
    return newOrder;
}


window.profileUtils = {
    checkUserLoggedIn,
    getUserData,
    showAuthModal,
    loginUser,
    logoutUser,
    createOrder,
    addToWishlist,
    trackLikedProduct,
    addToCart
};