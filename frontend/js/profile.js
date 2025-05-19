/**
 * Enhanced Profile Functionality
 * Handles user authentication, profile management, orders, wishlist, and liked products
 */

document.addEventListener('DOMContentLoaded', function() {
   document.addEventListener('click', function(e) {
        // Check if the clicked element or its parent is a login button
        if (e.target.classList.contains('login-btn') || 
            e.target.closest('.login-btn') || 
            e.target.id === 'show-login') {
            
            console.log('Login button clicked!');
            e.preventDefault();
            showAuthModal('login');
        }
        
        // Check if the clicked element or its parent is a signup button
        if (e.target.classList.contains('signup-btn') || 
            e.target.closest('.signup-btn') || 
            e.target.id === 'show-signup') {
            
            console.log('Signup button clicked!');
            e.preventDefault();
            showAuthModal('signup');
        }
    });
   
   
   
    // Initialize the user dropdown in header
    initUserDropdown();
    
    // Check login state and update UI accordingly
    checkLoginState();

    // Connect login buttons on login-required section
    connectLoginRequiredButtons();
    
    // Initialize profile tabs navigation
    initProfileTabs();
    
    // Initialize profile form event handlers
    initProfileForm();
    
    // Initialize login/signup buttons on profile page
    initAuthButtons();
    
    // Initialize logout button
    initLogoutButton();

    
});

/**
 * Initialize dropdown menu for user icon in header
 */
function initUserDropdown() {
    const userIcon = document.querySelector('.header-actions .user-icon');
    if (!userIcon) return;
    
    userIcon.addEventListener('click', function(e) {
        // Always prevent default navigation to keep dropdown functionality
        e.preventDefault();
        
        // Check if menu already exists
        const existingMenu = document.querySelector('.user-dropdown');
        if (existingMenu) {
            existingMenu.classList.toggle('active');
            return;
        }
        
        // Create user dropdown menu
        const userDropdown = document.createElement('div');
        userDropdown.className = 'user-dropdown';
        
        // Check if user is logged in
        const isLoggedIn = checkUserLoggedIn();
        const userData = getUserData();
        
        if (isLoggedIn && userData) {
            // Menu for logged in users
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
            // Menu for guests
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
        
        // Position the dropdown relative to the user icon
        const iconRect = userIcon.getBoundingClientRect();
        userDropdown.style.top = (iconRect.bottom + window.scrollY) + 'px';
        userDropdown.style.right = (window.innerWidth - iconRect.right) + 'px';
        
        // Add to document
        document.body.appendChild(userDropdown);
        
        // Show with animation
        setTimeout(() => {
            userDropdown.classList.add('active');
        }, 10);
        
        // Add event listeners for buttons
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
        
        // Close dropdown when clicking outside
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

/**
 * Initialize authentication buttons in the header dropdown
 */
function initAuthButtons() {
    // Check for dropdown login/signup buttons (these appear in the user icon dropdown)
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        // Check if login button in dropdown is clicked
        if (target.classList.contains('login-btn') || target.closest('.login-btn')) {
            e.preventDefault();
            showAuthModal('login');
        }
        
        // Check if signup button in dropdown is clicked
        if (target.classList.contains('signup-btn') || target.closest('.signup-btn')) {
            e.preventDefault();
            showAuthModal('signup');
        }
    });
}

/**
 * Connect buttons in the login-required section
 */
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

/**
 * Initialize logout button
 */
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

/**
 * Check login state and update UI
 */
function checkLoginState() {
    const isLoggedIn = checkUserLoggedIn();
    
    // If on profile page, show/hide appropriate sections
    const loginRequired = document.getElementById('login-required');
    const profileContent = document.getElementById('profile-content');
    
    if (loginRequired && profileContent) {
        if (isLoggedIn) {
            loginRequired.style.display = 'none';
            profileContent.style.display = 'flex';
            
            // Populate user data
            populateProfileData();
            
            // Load user-specific content
            loadOrders();
            loadLikedProducts();
            loadWishlist();
        } else {
            loginRequired.style.display = 'block';
            profileContent.style.display = 'none';
        }
    }
    
    // Update cart count
    updateCartCount();
}

/**
 * Check if user is logged in by checking localStorage
 * @returns {boolean} True if user is logged in
 */
function checkUserLoggedIn() {
    const userData = localStorage.getItem('brkUser');
    return !!userData;
}

/**
 * Get user data from localStorage
 * @returns {Object|null} User data object or null if not logged in
 */
function getUserData() {
    const userData = localStorage.getItem('brkUser');
    return userData ? JSON.parse(userData) : null;
}

/**
 * Show login/signup modal
 * @param {string} type - 'login' or 'signup'
 */
function showAuthModal(type) {
    console.log('Showing auth modal:', type);
    
    // Remove existing modal if it exists
    const existingModal = document.querySelector('.auth-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Create modal
    const authModal = document.createElement('div');
    authModal.className = 'auth-modal';
    
    // Set content based on type
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
    
    // Add to document
    document.body.appendChild(authModal);
    
    // Show with animation
    setTimeout(() => {
        authModal.classList.add('active');
    }, 10);
    
    // Close button functionality
    const closeBtn = authModal.querySelector('.close-auth-modal');
    closeBtn.addEventListener('click', function() {
        authModal.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(authModal)) {
                document.body.removeChild(authModal);
            }
        }, 300);
    });
    
    // Switch between login and signup
    const switchLink = authModal.querySelector('.switch-auth');
    if (switchLink) {
        switchLink.addEventListener('click', function(e) {
            e.preventDefault();
            const newType = this.getAttribute('data-type');
            showAuthModal(newType);
        });
    }
    
   
    // Form submission
    const form = authModal.querySelector('form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (type === 'login') {
            handleLogin(form, authModal);
        } else {
            handleSignup(form, authModal);
        }
    });
    
    // Close when clicking outside
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

/**
 * Handle login form submission
 * @param {HTMLFormElement} form - Login form element
 * @param {HTMLElement} modal - Auth modal element
 */
function handleLogin(form, modal) {
    const email = form.querySelector('#login-email').value;
    const password = form.querySelector('#login-password').value;
    
    // Simple validation
    if (!email || !password) {
        const errorEl = document.getElementById('login-error');
        errorEl.style.display = 'flex';
        errorEl.querySelector('span').textContent = 'Please fill out all fields';
        return;
    }
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('brkUsers')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Login successful
        loginUser(user);
        
        // Close modal
        modal.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            
            // Reload page after login
            if (window.location.pathname.includes('profile.html')) {
                window.location.reload();
            }
        }, 300);
    } else {
        // Login failed
        const errorEl = document.getElementById('login-error');
        errorEl.style.display = 'flex';
        errorEl.querySelector('span').textContent = 'Invalid email or password';
    }
}

/**
 * Handle signup form submission
 * @param {HTMLFormElement} form - Signup form element
 * @param {HTMLElement} modal - Auth modal element
 */
function handleSignup(form, modal) {
    const firstName = form.querySelector('#signup-firstname').value;
    const lastName = form.querySelector('#signup-lastname').value;
    const email = form.querySelector('#signup-email').value;
    const password = form.querySelector('#signup-password').value;
    const confirmPassword = form.querySelector('#signup-confirm-password').value;
    const agreeTerms = form.querySelector('#agree-terms').checked;
    
    // Simple validation
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
    
    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('brkUsers')) || [];
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        const errorEl = document.getElementById('signup-error');
        errorEl.style.display = 'flex';
        errorEl.querySelector('span').textContent = 'This email is already registered';
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(), // Simple ID generation
        firstName,
        lastName,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    // Add to users array
    users.push(newUser);
    localStorage.setItem('brkUsers', JSON.stringify(users));
    
    // Login the new user
    loginUser(newUser);
    
    // Create empty arrays for user data
    initializeUserData(newUser.id);
    
    // Close modal
    modal.classList.remove('active');
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
        
        // Show success message
        showNotification('Account created successfully! You are now logged in.', 'success');
        
        // Reload page after signup
        if (window.location.pathname.includes('profile.html')) {
            window.location.reload();
        }
    }, 300);
}

/**
 * Initialize empty data structures for a new user
 * @param {string} userId - User ID
 */
function initializeUserData(userId) {
    // Create empty orders array
    const userOrders = JSON.parse(localStorage.getItem('brkOrders')) || {};
    userOrders[userId] = [];
    localStorage.setItem('brkOrders', JSON.stringify(userOrders));
    
    // Create empty wishlist
    const userWishlist = JSON.parse(localStorage.getItem('brkWishlist')) || {};
    userWishlist[userId] = [];
    localStorage.setItem('brkWishlist', JSON.stringify(userWishlist));
    
    // Create empty liked products list
    const userLikedProducts = JSON.parse(localStorage.getItem('brkLikedProducts')) || {};
    userLikedProducts[userId] = [];
    localStorage.setItem('brkLikedProducts', JSON.stringify(userLikedProducts));
}

/**
 * Login user by storing user data in localStorage
 * @param {Object} user - User data object
 */
function loginUser(user) {
    // Remove password from user data before storing for security
    const userData = {...user};
    delete userData.password;
    
    // Store in localStorage
    localStorage.setItem('brkUser', JSON.stringify(userData));
    
    // Update cart count
    updateCartCount();
}

/**
 * Logout user by removing data from localStorage
 */
function logoutUser() {
    localStorage.removeItem('brkUser');
}

/**
 * Initialize profile tabs navigation
 */
function initProfileTabs() {
    const tabLinks = document.querySelectorAll('.profile-nav a[data-tab]');
    const tabPanes = document.querySelectorAll('.profile-tab');
    
    if (tabLinks.length === 0 || tabPanes.length === 0) return;
    
    // Check URL hash for direct tab access
    const hash = window.location.hash.substring(1);
    if (hash) {
        // Find tab link with matching data-tab
        const tabLink = document.querySelector(`.profile-nav a[data-tab="${hash}"]`);
        if (tabLink) {
            // Hide all tabs
            tabPanes.forEach(pane => pane.classList.remove('active'));
            tabLinks.forEach(link => link.classList.remove('active'));
            
            // Show the selected tab
            const tabId = tabLink.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            tabLink.classList.add('active');
        }
    }
    
    // Add click event listeners to tab links
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Hide all tabs
            tabPanes.forEach(pane => pane.classList.remove('active'));
            tabLinks.forEach(link => link.classList.remove('active'));
            
            // Show the selected tab
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            this.classList.add('active');
            
            // Update URL hash without scrolling
            history.replaceState(null, null, `#${tabId}`);
        });
    });
}

/**
 * Initialize profile form events
 */
function initProfileForm() {
    const accountForm = document.getElementById('account-form');
    if (!accountForm) return;
    
    // Handle form submission
    accountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Get current user data
        const userData = getUserData();
        if (!userData) return;
        
        // Get users array from localStorage
        const users = JSON.parse(localStorage.getItem('brkUsers')) || [];
        const userIndex = users.findIndex(u => u.id === userData.id);
        
        if (userIndex === -1) return;
        
        // Update name fields
        users[userIndex].firstName = firstName || users[userIndex].firstName;
        users[userIndex].lastName = lastName || users[userIndex].lastName;
        
        // Update password if provided
        if (currentPassword && newPassword && confirmPassword) {
            // Verify current password (we need to check against the stored password)
            if (currentPassword !== users[userIndex].password) {
                showNotification('Current password is incorrect.', 'error');
                return;
            }
            
            // Check if new passwords match
            if (newPassword !== confirmPassword) {
               showNotification('New passwords do not match.', 'error');
                return;
            }
            
            // Update password
            users[userIndex].password = newPassword;
        }
        
        // Save updated users array
        localStorage.setItem('brkUsers', JSON.stringify(users));
        
        // Update current user data in localStorage (without password)
        const updatedUserData = {
            ...userData,
            firstName: firstName || userData.firstName,
            lastName: lastName || userData.lastName
        };
        
        localStorage.setItem('brkUser', JSON.stringify(updatedUserData));
        
        // Show success message
        showNotification('Profile updated successfully!', 'success');
        
        // Clear password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        
        // Refresh profile data
        populateProfileData();
    });
}

/**
 * Populate profile data from localStorage
 */
function populateProfileData() {
    const userData = getUserData();
    if (!userData) return;
    
    // Update user info in sidebar
    const userDisplayName = document.getElementById('user-display-name');
    const userEmail = document.getElementById('user-email');
    
    if (userDisplayName) {
        userDisplayName.textContent = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User';
    }
    
    if (userEmail) {
        userEmail.textContent = userData.email || '';
    }
    
    // Update form fields
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

/**
 * Load orders from localStorage
 */
function loadOrders() {
    const userData = getUserData();
    if (!userData) return;
    
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;
    
    // Get orders for current user
    const userOrders = JSON.parse(localStorage.getItem('brkOrders')) || {};
    const orders = userOrders[userData.id] || [];
    
    // If no orders, show message
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
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Generate HTML for orders
    let ordersHTML = '';
    
    orders.forEach(order => {
        // Format date
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Calculate total items
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
        
        // Add each order item
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
    
    // Update orders container
    ordersContainer.innerHTML = ordersHTML;
}

/**
 * Load liked products from API/localStorage
 */
function loadLikedProducts() {
    const userData = getUserData();
    if (!userData) return;
    
    const likedProductsContainer = document.getElementById('liked-products-container');
    if (!likedProductsContainer) return;
    
    // First check in localStorage if we have cached liked products
    const userLikedProducts = JSON.parse(localStorage.getItem('brkLikedProducts')) || {};
    const likedProductIds = userLikedProducts[userData.id] || [];
    
    // If no liked products in localStorage, fetch from API
    if (likedProductIds.length === 0) {
        // Show loading state
        likedProductsContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading your liked products...</p>
            </div>
        `;
        
        // Fetch most liked products from API as a fallback
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
                // Show error message
                likedProductsContainer.innerHTML = `
                    <div class="no-liked-products">
                        <i class="fas fa-thumbs-up"></i>
                        <p>You haven't liked any products yet.</p>
                        <a href="products.html" class="cta-button">Explore Products</a>
                    </div>
                `;
            });
    } else {
        // Fetch products by ID from API
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
            // Filter out null results
            const validProducts = products.filter(product => product !== null);
            displayLikedProducts(validProducts);
        })
        .catch(error => {
            console.error('Error fetching liked products:', error);
            // Show error message
            likedProductsContainer.innerHTML = `
                <div class="no-liked-products">
                    <i class="fas fa-thumbs-up"></i>
                    <p>Error loading your liked products. Please try again later.</p>
                </div>
            `;
        });
    }
}

/**
 * Display liked products in the container
 * @param {Array} products - Array of product objects
 */
function displayLikedProducts(products) {
    const likedProductsContainer = document.getElementById('liked-products-container');
    if (!likedProductsContainer) return;
    
    // If no products, show message
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
    
    // Generate HTML for products
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
    
    // Update container
    likedProductsContainer.innerHTML = productsHTML;
    
    // Add event listeners
    addLikedProductsEventListeners();
    
    // Update star ratings
    updateProductRatings();
}

/**
 * Add event listeners to liked products
 */
function addLikedProductsEventListeners() {
    // Make cards clickable
    const productCards = document.querySelectorAll('#liked-products-container .product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons
            if (e.target.closest('button')) return;
            
            const productId = this.getAttribute('data-product-id');
            window.location.href = `product-detail.html?product_id=${productId}`;
        });
    });
    
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('#liked-products-container .add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            
            const productCard = this.closest('.product-card');
            const productId = productCard.getAttribute('data-product-id');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent.replace('€', '');
            const productImage = productCard.querySelector('img').src;
            
            // Add to cart
            addToCart({
                id: productId,
                name: productName,
                price: parseFloat(productPrice),
                image: productImage,
                size: '41', // Default size
                quantity: 1
            });
            
            // Show success message
            showNotification('Product added to cart!', 'success');
        });
    });
    
    // Add to wishlist buttons
    const addToWishlistButtons = document.querySelectorAll('#liked-products-container .add-to-wishlist');
    addToWishlistButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            
            const productCard = this.closest('.product-card');
            const productId = productCard.getAttribute('data-product-id');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent.replace('€', '');
            const productImage = productCard.querySelector('img').src;
            
            // Add to wishlist
            addToWishlist({
                id: productId,
                name: productName,
                price: parseFloat(productPrice),
                image: productImage
            });
        });
    });
}

/**
 * Update star ratings for all product cards
 */
function updateProductRatings() {
    // Find all star containers
    const starContainers = document.querySelectorAll('.stars-container');
    
    starContainers.forEach(container => {
        // Find the likes count
        const likesText = container.nextElementSibling?.textContent || '(0)';
        const likesMatch = likesText.match(/\((\d+)\)/);
        const likes = likesMatch ? parseInt(likesMatch[1]) : 0;
        
        // Calculate star rating
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
    });
}

/**
 * Load wishlist from localStorage
 */
function loadWishlist() {
    const userData = getUserData();
    if (!userData) return;
    
    const wishlistContainer = document.getElementById('wishlist-container');
    if (!wishlistContainer) return;
    
    // Get wishlist for current user
    const userWishlist = JSON.parse(localStorage.getItem('brkWishlist')) || {};
    const wishlist = userWishlist[userData.id] || [];
    
    // If no wishlist items, show message
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
    
    // Generate HTML for wishlist
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
    
    // Update wishlist container
    wishlistContainer.innerHTML = wishlistHTML;
    
    // Add event listeners
    addWishlistEventListeners();
}

function addWishlistEventListeners() {
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.wishlist-item .add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            
            // Get wishlist
            const userData = getUserData();
            const userWishlist = JSON.parse(localStorage.getItem('brkWishlist')) || {};
            const wishlist = userWishlist[userData.id] || [];
            
            // Find the product in wishlist
            const product = wishlist.find(item => item.id === productId);
            
            if (product) {
                // Make sure the price is valid
                const price = parseFloat(product.price);
                if (isNaN(price) || price === 0) {
                    // Try to fetch the current price from the API
                    fetch(`/api/products/${productId}`)
                        .then(response => response.json())
                        .then(data => {
                            // Add to cart with the fetched price
                            addToCart({
                                id: product.id,
                                name: product.name,
                                price: data.price || 99.99, // Use API price or default
                                image: product.image,
                                size: '41', // Default size
                                quantity: 1
                            });
                            
                            // Show success message
                            showNotification('Product added to wishlist!', 'success');
                        })
                        .catch(error => {
                            console.error('Error fetching product:', error);
                            // Add to cart with a default price
                            addToCart({
                                id: product.id,
                                name: product.name,
                                price: 99.99, // Default price
                                image: product.image,
                                size: '41', // Default size
                                quantity: 1
                            });
                            
                            // Show success message
                            showNotification('Product added to cart!', 'success');
                        });
                } else {
                    // Add to cart with the existing price
                    addToCart({
                        id: product.id,
                        name: product.name,
                        price: price,
                        image: product.image,
                        size: '41', // Default size
                        quantity: 1
                    });
                    
                    // Show success message
                    showNotification('Product added to cart!', 'success');
                }
            }
        });
    });
    
    // Remove from wishlist buttons
    const removeButtons = document.querySelectorAll('.wishlist-item .remove-wishlist-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            
            // Get wishlist
            const userData = getUserData();
            const userWishlist = JSON.parse(localStorage.getItem('brkWishlist')) || {};
            const wishlist = userWishlist[userData.id] || [];
            
            // Remove the product from wishlist
            const updatedWishlist = wishlist.filter(item => item.id !== productId);
            
            // Update localStorage
            userWishlist[userData.id] = updatedWishlist;
            localStorage.setItem('brkWishlist', JSON.stringify(userWishlist));
            
            // Reload wishlist
            loadWishlist();
        });
    });
    
    // Make wishlist items clickable
    const wishlistItems = document.querySelectorAll('.wishlist-item');
    wishlistItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't trigger if clicking buttons
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            const productId = this.getAttribute('data-product-id');
            window.location.href = `product-detail.html?product_id=${productId}`;
        });
    });
}

/**
 * Add product to wishlist
 * @param {Object} item - Wishlist item
 */
function addToWishlist(item) {
    // Check if user is logged in
    const userData = getUserData();
    if (!userData) {
        // Show login modal
        showAuthModal('login');
        return;
    }
    
    // Make sure the price is a number and not 0
    if (!item.price || isNaN(parseFloat(item.price)) || parseFloat(item.price) === 0) {
        console.error('Invalid price for wishlist item:', item);
        // Try to extract price from the item name or description
        // This is a fallback mechanism
        item.price = 99.99; // Default price if we can't determine it
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

/**
 * Track a liked product
 * @param {string} productId - ID of the product
 */
function trackLikedProduct(productId) {
    // Check if user is logged in
    const userData = getUserData();
    if (!userData) return;
    
    // Get liked products from localStorage
    const userLikedProducts = JSON.parse(localStorage.getItem('brkLikedProducts')) || {};
    const likedProducts = userLikedProducts[userData.id] || [];
    
    // Check if product is already tracked
    if (!likedProducts.includes(productId)) {
        // Add product ID to liked products
        likedProducts.push(productId);
        
        // Save to localStorage
        userLikedProducts[userData.id] = likedProducts;
        localStorage.setItem('brkLikedProducts', JSON.stringify(userLikedProducts));
    }
}

/**
 * Add item to cart
 * @param {Object} item - Cart item
 */
function addToCart(item) {
    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    
    // Check if item already exists
    const existingItemIndex = cart.findIndex(cartItem => 
        cartItem.id === item.id && cartItem.size === item.size);
    
    if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += item.quantity;
    } else {
        // Add new item
        cart.push(item);
    }
    
    // Save cart to localStorage
    localStorage.setItem('brkCart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
}

/**
 * Update cart count in header
 */
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('brkCart')) || [];
    
    // Calculate total items
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart count
    cartCount.textContent = totalItems;
}

/**
 * Create a new order
 * @param {Array} items - Cart items
 * @param {number} total - Order total
 * @returns {Object|null} New order object or null if user not logged in
 */
function createOrder(items, total) {
    // Check if user is logged in
    const userData = getUserData();
    if (!userData) {
        return null;
    }
    
    // Create new order
    const newOrder = {
        id: Date.now().toString().substring(7), // Simple ID generation
        userId: userData.id,
        items: items,
        total: total,
        date: new Date().toISOString(),
        status: 'completed'
    };
    
    // Get orders from localStorage
    const userOrders = JSON.parse(localStorage.getItem('brkOrders')) || {};
    const orders = userOrders[userData.id] || [];
    
    // Add new order
    orders.push(newOrder);
    
    // Save orders to localStorage
    userOrders[userData.id] = orders;
    localStorage.setItem('brkOrders', JSON.stringify(userOrders));
    
    // Clear the cart after successful order
    localStorage.setItem('brkCart', JSON.stringify([]));
    updateCartCount();
    
    return newOrder;
}

// Export functions for use in other scripts
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