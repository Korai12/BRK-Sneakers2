// User Profile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get the user icon in the header
    const userIcon = document.querySelector('.header-actions .user-icon');
    
    if (userIcon) {
        userIcon.addEventListener('click', function(e) {
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
            
            // Check if user is logged in (for demo purposes, assume not logged in)
            const isLoggedIn = false;
            
            if (isLoggedIn) {
                // Menu for logged in users
                userDropdown.innerHTML = `
                    <ul>
                        <li><a href="#"><i class="fas fa-user"></i> My Account</a></li>
                        <li><a href="#"><i class="fas fa-shopping-bag"></i> My Orders</a></li>
                        <li><a href="#"><i class="fas fa-heart"></i> Wishlist</a></li>
                        <li><a href="#"><i class="fas fa-cog"></i> Settings</a></li>
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
                    // Implement logout functionality here
                    alert('Logout functionality would be implemented here.');
                });
            }
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                // Only close when explicitly clicking outside
                // Do NOT automatically close after a time period
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
    
    // Function to show login/signup modal
    function showAuthModal(type) {
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
                        <a href="#" class="forgot-password">Forgot Password?</a>
                    </div>
                </div>
            `;
        } else {
            authModal.innerHTML = `
                <div class="auth-modal-content">
                    <button class="close-auth-modal"><i class="fas fa-times"></i></button>
                    <h2>Create Account</h2>
                    <form class="signup-form">
                        <div class="form-group">
                            <label for="signup-name">Full Name</label>
                            <input type="text" id="signup-name" required>
                        </div>
                        <div class="form-group">
                            <label for="signup-email">Email</label>
                            <input type="email" id="signup-email" required>
                        </div>
                        <div class="form-group">
                            <label for="signup-password">Password</label>
                            <input type="password" id="signup-password" required>
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
            
            // In a real implementation, this would send data to a server
            alert(`${type === 'login' ? 'Login' : 'Signup'} functionality would be implemented here.`);
            
            // Close modal
            authModal.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(authModal)) {
                    document.body.removeChild(authModal);
                }
            }, 300);
        });
        
        // Close when clicking outside the modal content
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
    
    // Add CSS for user dropdown and auth modal
    const profileStyle = document.createElement('style');
    profileStyle.textContent = `
        .user-dropdown {
            position: absolute;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            width: 250px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
            z-index: 1000;
            padding: 15px;
        }
        
        .user-dropdown.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .user-dropdown ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .user-dropdown ul li {
            margin-bottom: 12px;
        }
        
        .user-dropdown ul li a {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--text-color);
            font-size: 0.95rem;
            padding: 5px 0;
            transition: color 0.2s;
        }
        
        .user-dropdown ul li a:hover {
            color: var(--primary-color);
        }
        
        .user-dropdown ul li a i {
            width: 20px;
            text-align: center;
        }
        
        .guest-message {
            margin-bottom: 15px;
            text-align: center;
        }
        
        .guest-message p {
            margin: 0;
            font-size: 0.95rem;
            color: var(--light-text);
        }
        
        .auth-buttons {
            display: flex;
            gap: 10px;
        }
        
        .login-btn, .signup-btn {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 4px;
            font-family: 'Poppins', sans-serif;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .login-btn {
            background-color: white;
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
        }
        
        .login-btn:hover {
            background-color: #f8f8f8;
        }
        
        .signup-btn {
            background-color: var(--primary-color);
            color: white;
        }
        
        .signup-btn:hover {
            background-color: #ff5252;
        }
        
        /* Auth Modal Styles */
        .auth-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1100;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
        }
        
        .auth-modal.active {
            opacity: 1;
            visibility: visible;
        }
        
        .auth-modal-content {
            background-color: white;
            border-radius: 8px;
            width: 90%;
            max-width: 450px;
            padding: 30px;
            position: relative;
            transform: translateY(-20px);
            transition: transform 0.3s;
        }
        
        .auth-modal.active .auth-modal-content {
            transform: translateY(0);
        }
        
        .close-auth-modal {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 1.2rem;
            color: #777;
            cursor: pointer;
        }
        
        .auth-modal h2 {
            margin-top: 0;
            margin-bottom: 25px;
            text-align: center;
            color: var(--text-color);
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 0.95rem;
            color: var(--text-color);
        }
        
        .form-group input[type="email"],
        .form-group input[type="password"],
        .form-group input[type="text"] {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: 'Poppins', sans-serif;
            font-size: 0.95rem;
        }
        
        .form-group.checkbox {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .form-group.checkbox input {
            margin: 0;
        }
        
        .form-group.checkbox label {
            margin-bottom: 0;
            font-size: 0.9rem;
        }
        
        .auth-submit {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 4px;
            background-color: var(--primary-color);
            color: white;
            font-family: 'Poppins', sans-serif;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .auth-submit:hover {
            background-color: #ff5252;
        }
        
        .auth-footer {
            margin-top: 20px;
            text-align: center;
            font-size: 0.9rem;
        }
        
        .auth-footer p {
            margin-bottom: 10px;
        }
        
        .auth-footer a {
            color: var(--primary-color);
            text-decoration: none;
        }
        
        .auth-footer a:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(profileStyle);
});