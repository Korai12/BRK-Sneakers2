// Mobile Menu Functionality - Final Fixed Version
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const mobileMenuBtn = document.querySelector('.mobile-menu-button');
    let mobileNav = null;
    
    // Check if mobile menu button exists
    if (mobileMenuBtn) {
        // Add click event to mobile menu button
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Stop click from propagating to document
            toggleMobileMenu();
        });
    }
    
    // Function to create mobile navigation
    function createMobileNav() {
        // Create mobile nav element
        mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav';
        
        // Set up navigation links with correct category parameters
        let mobileNavHTML = '<ul>';
        
        // Home link
        mobileNavHTML += `
            <li>
                <a href="index.html">Home</a>
            </li>
        `;
        
        // Products link
        mobileNavHTML += `
            <li>
                <a href="products.html">All Products</a>
            </li>
        `;
        
        // Category-specific links
        mobileNavHTML += `
            <li>
                <a href="products.html?category=men">Men</a>
            </li>
            <li>
                <a href="products.html?category=women">Women</a>
            </li>
            <li>
                <a href="products.html?category=kids">Kids</a>
            </li>
        `;
        
        mobileNavHTML += '</ul>';
        
        // Add additional mobile-only links
        mobileNavHTML += `
            <div class="mobile-nav-bottom">
                <a href="profile.html" class="mobile-nav-link">
                    <i class="fas fa-user"></i>
                    <span>My Account</span>
                </a>
                <a href="profile.html#wishlist" class="mobile-nav-link">
                    <i class="fas fa-heart"></i>
                    <span>Wishlist</span>
                </a>
                <a href="#" class="mobile-nav-link support-link">
                    <i class="fas fa-headset"></i>
                    <span>Support</span>
                </a>
            </div>
        `;
        
        // Set HTML content
        mobileNav.innerHTML = mobileNavHTML;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mobile-menu-close';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        mobileNav.insertBefore(closeBtn, mobileNav.firstChild);
        
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent propagation
            closeMobileMenu();
        });
        
        // Add mobile nav to the DOM after header
        const header = document.querySelector('header');
        if (header) {
            header.parentNode.insertBefore(mobileNav, header.nextSibling);
        } else {
            document.body.appendChild(mobileNav);
        }
        
        // Add event listeners to mobile nav links
        const mobileNavLinks = mobileNav.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // For links that need special handling
                if (link.classList.contains('support-link')) {
                    e.preventDefault();
                    if (typeof showNotification === 'function') {
                        showNotification('Support is available at support@brksneakers.com', 'info', 4000);
                    } else {
                        alert('Support is available at support@brksneakers.com');
                    }
                }
                
                // Close mobile nav when a link is clicked
                closeMobileMenu();
            });
        });
        
        // Important: Stop propagation of clicks within the menu
        mobileNav.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Function to toggle mobile navigation
    function toggleMobileMenu() {
        // Check if mobile menu already exists
        if (!mobileNav) {
            createMobileNav();
        }
        
        // Toggle active class on mobile nav
        mobileNav.classList.toggle('active');
        
        // Toggle icon on mobile menu button
        if (mobileNav.classList.contains('active')) {
            mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
        } else {
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.style.overflow = ''; // Re-enable scrolling
        }
    }
    
    // Function to close mobile menu
    function closeMobileMenu() {
        if (mobileNav) {
            mobileNav.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.style.overflow = ''; // Re-enable scrolling
        }
    }
    
    // Create a delay before adding the document click handler
    // This prevents immediate closing of the menu after opening
    setTimeout(function() {
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mobileNav && mobileNav.classList.contains('active')) {
                // If click is outside the mobile nav and not on the menu button
                if (!mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    closeMobileMenu();
                }
            }
        });
    }, 100);
    
    // Close menu with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Add CSS for mobile navigation
    const mobileStyle = document.createElement('style');
    mobileStyle.textContent = `
        .mobile-nav {
            position: fixed;
            top: 0;
            left: -100%;
            width: 85%;
            max-width: 300px;
            height: 100%;
            background-color: white;
            z-index: 1200;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
            transition: left 0.3s ease;
            padding: 20px;
            padding-top: 50px;
            overflow-y: auto;
        }
        
        .mobile-nav.active {
            left: 0;
        }
        
        .mobile-nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        
        .mobile-nav ul li {
            margin-bottom: 15px;
        }
        
        .mobile-nav ul li a {
            display: block;
            font-size: 1.1rem;
            color: var(--text-color);
            padding: 5px 0;
            transition: color 0.2s;
        }
        
        .mobile-nav ul li a:hover,
        .mobile-nav ul li a.active {
            color: var(--primary-color);
        }
        
        .mobile-menu-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--text-color);
            cursor: pointer;
        }
        
        .mobile-nav-bottom {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 25px;
        }
        
        .mobile-nav-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 15px 5px;
            border-radius: 8px;
            background-color: #f8f8f8;
            color: var(--text-color);
            transition: background-color 0.2s;
        }
        
        .mobile-nav-link:hover {
            background-color: #f0f0f0;
        }
        
        .mobile-nav-link i {
            font-size: 1.3rem;
            margin-bottom: 5px;
            color: var(--primary-color);
        }
        
        .mobile-nav-link span {
            font-size: 0.8rem;
        }
        
        /* Fixed overlay background for mobile menu */
        body::after {
            content: '';
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1100;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
        }
        
        .mobile-nav.active ~ body::after,
        body:has(.mobile-nav.active)::after {
            opacity: 1;
            visibility: visible;
        }
        
        /* Show mobile menu button only on small screens */
        @media screen and (min-width: 992px) {
            .mobile-menu-button {
                display: none;
            }
        }
    `;
    document.head.appendChild(mobileStyle);
});