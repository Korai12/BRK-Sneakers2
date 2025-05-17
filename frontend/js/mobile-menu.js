// Mobile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const mobileMenuBtn = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('header');
    
    // Check if mobile menu button exists
    if (mobileMenuBtn) {
        // Add click event to mobile menu button
        mobileMenuBtn.addEventListener('click', function() {
            // Check if mobile nav already exists
            if (document.querySelector('.mobile-nav')) {
                toggleMobileNav();
                return;
            }
            
            // Create mobile navigation
            createMobileNav();
            
            // Toggle mobile navigation
            toggleMobileNav();
        });
    }
    
    // Function to create mobile navigation
    function createMobileNav() {
        // Create mobile nav element
        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav';
        
        // Get all nav links and clone them
        const links = navLinks.querySelectorAll('li');
        let mobileNavHTML = '<ul>';
        
        links.forEach(link => {
            const anchor = link.querySelector('a');
            const isActive = anchor.classList.contains('active');
            
            mobileNavHTML += `
                <li>
                    <a href="${anchor.getAttribute('href')}" ${isActive ? 'class="active"' : ''}>${anchor.textContent}</a>
                </li>
            `;
        });
        
        mobileNavHTML += '</ul>';
        
        // Add additional mobile-only links
        mobileNavHTML += `
            <div class="mobile-nav-bottom">
                <a href="#" class="mobile-nav-link">
                    <i class="fas fa-user"></i>
                    <span>My Account</span>
                </a>
                <a href="#" class="mobile-nav-link">
                    <i class="fas fa-heart"></i>
                    <span>Wishlist</span>
                </a>
                <a href="#" class="mobile-nav-link">
                    <i class="fas fa-headset"></i>
                    <span>Support</span>
                </a>
            </div>
        `;
        
        // Set HTML content
        mobileNav.innerHTML = mobileNavHTML;
        
        // Add mobile nav to the DOM after header
        header.parentNode.insertBefore(mobileNav, header.nextSibling);
        
        // Add event listeners to mobile nav links
        const mobileNavLinks = mobileNav.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Close mobile nav when a link is clicked
                toggleMobileNav();
            });
        });
    }
    
    // Function to toggle mobile navigation
    function toggleMobileNav() {
        const mobileNav = document.querySelector('.mobile-nav');
        if (!mobileNav) return;
        
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
            padding-top: 70px;
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
        
        .mobile-nav-bottom {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
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
        
        /* Show mobile menu button only on small screens */
        @media screen and (min-width: 992px) {
            .mobile-menu-button {
                display: none;
            }
        }
        
        /* Mobile menu overlay */
        .mobile-nav.active::before {
            content: '';
            position: fixed;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: -1;
        }
        
        /* Additional responsive styles */
        @media screen and (max-width: 992px) {
            .nav-links {
                display: none;
            }
            
            .mobile-menu-button {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                background: none;
                border: none;
                font-size: 1.5rem;
                color: var(--text-color);
                cursor: pointer;
            }
        }
    `;
    document.head.appendChild(mobileStyle);

    // Handle window resize events
    window.addEventListener('resize', function() {
        // If window width is larger than 992px and mobile nav is open, close it
        if (window.innerWidth >= 992) {
            const mobileNav = document.querySelector('.mobile-nav');
            if (mobileNav && mobileNav.classList.contains('active')) {
                toggleMobileNav();
            }
        }
    });
});