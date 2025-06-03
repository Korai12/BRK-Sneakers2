// Διαχειρίζεται το μενού για μικρές οθόνες
document.addEventListener('DOMContentLoaded', function() {
   
    const mobileMenuBtn = document.querySelector('.mobile-menu-button');
    let mobileNav = null;
    
   
    if (mobileMenuBtn) {
       
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation(); 
            toggleMobileMenu();
        });
    }
    
    
    function createMobileNav() {
        
        mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav';
        
        
        let mobileNavHTML = '<ul>';
        
        // Link αρχικής σελίδας
        mobileNavHTML += `
            <li>
                <a href="index.html">Home</a>
            </li>
        `;
        
        // Link προϊόντων
        mobileNavHTML += `
            <li>
                <a href="products.html">All Products</a>
            </li>
        `;
        
        // Links συγκεκριμένων κατηγοριών
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
        
        
        mobileNav.innerHTML = mobileNavHTML;
        
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mobile-menu-close';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        mobileNav.insertBefore(closeBtn, mobileNav.firstChild);
        
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation(); 
            closeMobileMenu();
        });
        
        
        const header = document.querySelector('header');
        if (header) {
            header.parentNode.insertBefore(mobileNav, header.nextSibling);
        } else {
            document.body.appendChild(mobileNav);
        }
        
        
        const mobileNavLinks = mobileNav.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                
                if (link.classList.contains('support-link')) {
                    e.preventDefault();
                    
                    
                    const infoModal = document.getElementById('info-modal');
                    const modalContent = document.getElementById('modal-content');
                    
                    
                    if (infoModal && modalContent) {
                        
                        const contactContent = `
                            <h2>Contact Us</h2>
                            <p>We'd love to hear from you! Get in touch with our team for any questions, feedback, or assistance.</p>
                            <div class="contact-info">
                                <p><strong>Email:</strong> support@brksneakers.com</p>
                                <p><strong>Phone:</strong> +30 6999999999</p>
                                <p><strong>Address:</strong> Thessaloniki 541 24</p>
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
                        `;
                        
                        
                        modalContent.innerHTML = contactContent;
                        
                        
                        infoModal.style.display = 'block';
                        document.body.style.overflow = 'hidden'; 
                        
                        
                        const contactForm = modalContent.querySelector('.contact-form');
                        if (contactForm) {
                            contactForm.addEventListener('submit', function(event) {
                                event.preventDefault();
                                
                                
                                if (typeof showNotification === 'function') {
                                    showNotification('Thank you for your message! We will contact you as soon as possible.', 'success', 4000);
                                } else {
                                    alert('Thank you for your message! We will contact you as soon as possible.');
                                }
                                
                                
                                this.reset();
                                
                                
                                setTimeout(() => {
                                    infoModal.style.display = 'none';
                                    document.body.style.overflow = ''; 
                                }, 2000);
                            });
                        }
                        
                        
                        const closeModalBtn = infoModal.querySelector('.close-modal');
                        if (closeModalBtn) {
                            closeModalBtn.addEventListener('click', function() {
                                infoModal.style.display = 'none';
                                document.body.style.overflow = ''; 
                            });
                        }
                    } else {
                        
                        if (typeof showNotification === 'function') {
                            showNotification('Support is available at support@brksneakers.com', 'info', 4000);
                        } else {
                            alert('Support is available at support@brksneakers.com');
                        }
                    }
                }
                
                
                closeMobileMenu();
            });
        });
        
        
        mobileNav.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Συνάρτηση για εναλλαγή του mobile menu
    function toggleMobileMenu() {
       
        if (!mobileNav) {
            createMobileNav();
        }
        
        
        mobileNav.classList.toggle('active');
        
        
        if (mobileNav.classList.contains('active')) {
            mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            document.body.style.overflow = 'hidden'; 
        } else {
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.style.overflow = ''; 
        }
    }
    
    // Συνάρτηση για να κλεισει το mobile menu
    function closeMobileMenu() {
        if (mobileNav) {
            mobileNav.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.style.overflow = '';
        }
    }
    

    setTimeout(function() {
        // Κλείνει το μενού όταν κάνουμε κλικ έξω
        document.addEventListener('click', function(e) {
            if (mobileNav && mobileNav.classList.contains('active')) {
                if (!mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    closeMobileMenu();
                }
            }
        });
    }, 100);
    
    // Κλείσιμο του mobile menu με το πλήκτρο Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // CSS για το mobile menu
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