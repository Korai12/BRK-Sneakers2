//Αναζητηση προϊόντων στο header(οχι του products page) 
document.addEventListener('DOMContentLoaded', function() {
    
    const searchIcon = document.querySelector('.header-actions .search-icon');
    
    if (searchIcon) {
        searchIcon.addEventListener('click', function(e) {
            e.preventDefault();
            
            
            if (document.querySelector('.search-overlay')) {
                toggleSearchOverlay();
                return;
            }
            
            
            const searchOverlay = document.createElement('div');
            searchOverlay.className = 'search-overlay';
            searchOverlay.innerHTML = `
                <div class="search-container">
                    <form action="products.html" method="get" class="header-search-form">
                        <input type="text" name="query" id="header-search-input" placeholder="Search for products..." autocomplete="off">
                        <button type="submit"><i class="fas fa-search"></i></button>
                    </form>
                    <button class="close-search"><i class="fas fa-times"></i></button>
                    <div class="search-results"></div>
                </div>
            `;
            
            document.body.appendChild(searchOverlay);
            
            
            const closeButton = searchOverlay.querySelector('.close-search');
            closeButton.addEventListener('click', toggleSearchOverlay);
            
            
            setTimeout(() => {
                const input = searchOverlay.querySelector('input');
                input.focus();
                
                
                searchOverlay.classList.add('active');
            }, 10);
            
            
            searchOverlay.addEventListener('click', function(e) {
                if (e.target === searchOverlay) {
                    toggleSearchOverlay();
                }
            });
            
            
            document.addEventListener('keydown', function handleEsc(e) {
                if (e.key === 'Escape') {
                    toggleSearchOverlay();
                    document.removeEventListener('keydown', handleEsc);
                }
            });
            
            
            setupDynamicSearch();
        });
    }
    
    // Εμφανίζει ή κρύβει το overlay αναζήτησης
    function toggleSearchOverlay() {
        const searchOverlay = document.querySelector('.search-overlay');
        if (!searchOverlay) return;
        
        if (searchOverlay.classList.contains('active')) {
           
            searchOverlay.classList.remove('active');
            
            
            setTimeout(() => {
                if (searchOverlay.parentNode) {
                    searchOverlay.parentNode.removeChild(searchOverlay);
                }
            }, 300);
        } else {
            
            searchOverlay.classList.add('active');
        }
    }
    
    //Δυναμική αναζήτηση προϊόντων με κλήσεις API καθώς πληκτρολογεί ο χρήστης
    function setupDynamicSearch() {
        const searchInput = document.getElementById('header-search-input');
        const searchResults = document.querySelector('.search-results');
        
        if (!searchInput || !searchResults) return;
        
        
        searchInput.addEventListener('input', debounce(function() {
            const query = searchInput.value.trim();
            
            if (query.length < 2) {
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
                return;
            }
            
            
            searchResults.innerHTML = '<div class="search-loading">Searching...</div>';
            searchResults.style.display = 'block';
            
            
            fetch(`/api/search?query=${encodeURIComponent(query)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(products => {
                    displaySearchResults(products, searchResults);
                })
                .catch(error => {
                    console.error('Error fetching search results:', error);
                    searchResults.innerHTML = '<div class="search-error">Sorry, something went wrong. Please try again.</div>';
                });
        }, 300)); 
        
        
        const searchForm = document.querySelector('.header-search-form');
        searchForm.addEventListener('submit', function(e) {
            const query = searchInput.value.trim();
            if (query.length < 2) {
                e.preventDefault(); 
            }
        });
    }
    
    // Εμφανίζει τα αποτελέσματα αναζήτησης ανα κατηγορία
    function displaySearchResults(products, resultsContainer) {
        if (!products || products.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No products found</div>';
            return;
        }
        
        
        const categorizedProducts = {};
        
        products.forEach(product => {
            const category = product.category || 'Other';
            if (!categorizedProducts[category]) {
                categorizedProducts[category] = [];
            }
            categorizedProducts[category].push(product);
        });
        
        
        let resultsHTML = '';
        
        
        resultsHTML += `<div class="search-summary">${products.length} products found</div>`;
        
        
        for (const category in categorizedProducts) {
            resultsHTML += `
                <div class="search-category">
                    <h3>${capitalizeFirstLetter(category)}</h3>
                    <div class="search-category-products">
            `;
            
            
            categorizedProducts[category].forEach(product => {
                resultsHTML += `
                    <a href="product-detail.html?product_id=${product._id}" class="search-product">
                    <div class="search-product-image">
                        <img src="images/products/${product.image}" alt="${product.name}">
                    </div>
                    <div class="search-product-info">
                        <h4>${product.name}</h4>
                        <p class="search-product-price">€${product.price.toFixed(2)}</p>
                    </div>
                </a>
                `;
            });
            
            resultsHTML += `
                    </div>
                </div>
            `;
        }
        
        
        resultsHTML += `
            <div class="search-view-all">
                <a href="products.html?query=${encodeURIComponent(document.getElementById('header-search-input').value)}">
                    View all results <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
        
        
        resultsContainer.innerHTML = resultsHTML;
    }
    
    //Βοηθητική συνάρτηση για να κεφαλαιοποιεί το πρώτο γράμμα μιας λέξης
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Αμα εχουμε πολλαπλές κλήσεις σε σύντομο χρονικό διάστημα
    function debounce(func, delay) {
        let timeoutId;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }
    
    //css για το overlay αναζήτησης
    const searchStyle = document.createElement('style');
    searchStyle.textContent = `
        .search-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 80px;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        
        .search-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .search-container {
            width: 90%;
            max-width: 800px;
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            position: relative;
            transform: translateY(-30px);
            transition: transform 0.3s ease;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .search-overlay.active .search-container {
            transform: translateY(0);
        }
        
        .header-search-form {
            display: flex;
            margin-bottom: 20px;
        }
        
        .header-search-form input {
            flex: 1;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-right: none;
            border-radius: 4px 0 0 4px;
            font-family: 'Poppins', sans-serif;
            font-size: 1rem;
        }
        
        .header-search-form button {
            padding: 0 20px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 0 4px 4px 0;
            cursor: pointer;
        }
        
        .close-search {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            color: var(--text-color);
            font-size: 1.2rem;
            cursor: pointer;
        }
        
        /* Search results styles */
        .search-results {
            display: none;
            margin-top: 20px;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .search-loading,
        .search-error,
        .no-results {
            padding: 20px;
            text-align: center;
            color: var(--light-text);
        }
        
        .search-summary {
            padding: 10px 0;
            margin-bottom: 15px;
            font-size: 0.9rem;
            color: var(--light-text);
            border-bottom: 1px solid #eee;
        }
        
        .search-category {
            margin-bottom: 20px;
        }
        
        .search-category h3 {
            font-size: 1.1rem;
            margin-bottom: 10px;
            color: var(--text-color);
        }
        
        .search-category-products {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .search-product {
            display: flex;
            flex-direction: column;
            padding: 10px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        
        .search-product:hover {
            background-color: #f9f9f9;
        }
        
        .search-product-image {
            width: 100%;
            height: 120px;
            margin-bottom: 10px;
        }
        
        .search-product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 4px;
        }
        
        .search-product-info h4 {
            margin: 0 0 5px;
            font-size: 0.95rem;
            color: var(--text-color);
        }
        
        .search-product-price {
            font-weight: 600;
            color: var(--primary-color);
            margin: 0;
        }
        
        .search-view-all {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        
        .search-view-all a {
            color: var(--primary-color);
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        
        .search-view-all a:hover {
            text-decoration: underline;
        }
        
        @media screen and (max-width: 768px) {
            .search-category-products {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            }
        }
    `;
    document.head.appendChild(searchStyle);
});