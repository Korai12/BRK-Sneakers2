// Slideshow functionality for homepage
let slideIndex = 1;
let slideshowInitialized = false;

// Initialize the slideshow when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Fetch popular products first
    if (isHomePage()) {
        fetchPopularProducts();
    } else {
        // If not on homepage, just initialize the slideshow with existing slides
        showSlides(slideIndex);
        initAutoSlide();
    }
});

// Check if current page is homepage
function isHomePage() {
    const path = window.location.pathname;
    return path.includes('index.html') || path === '/' || path.endsWith('/');
}

// Fetch popular products from API
function fetchPopularProducts() {
    fetch('/api/popular-products')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(products => {
            if (products && products.length > 0) {
                updateSlideshow(products);
            } else {
                // If no products or API error, initialize with existing slides
                showSlides(slideIndex);
                initAutoSlide();
            }
        })
        .catch(error => {
            console.error('Error fetching popular products:', error);
            // On error, initialize with existing slides
            showSlides(slideIndex);
            initAutoSlide();
        });
}

// Update slideshow with products from API
function updateSlideshow(products) {
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (!slideshowContainer) return;
    
    // Keep navigation elements
    const prevButton = slideshowContainer.querySelector('.prev');
    const nextButton = slideshowContainer.querySelector('.next');
    const dotsContainer = slideshowContainer.querySelector('.dots-container');
    
    // Remove existing slides and dots
    const existingSlides = slideshowContainer.querySelectorAll('.hero-slide');
    existingSlides.forEach(slide => slide.remove());
    
    if (dotsContainer) {
        const existingDots = dotsContainer.querySelectorAll('.dot');
        existingDots.forEach(dot => dot.remove());
    }
    
    // Create new slides for popular products (limit to 5)
    const displayProducts = products.slice(0, 5);
    
    displayProducts.forEach((product, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = 'hero-slide fade';
        
        slide.innerHTML = `
            <div class="slide-content">
                <h1>${product.name}</h1>
                <p>${product.description}</p>
                <a href="products.html" class="cta-button">Shop Now</a>
            </div>
            <img src="images/products/${product.image}" alt="${product.name}">
        `;
        
        // Add the slide before navigation controls
        if (prevButton) {
            slideshowContainer.insertBefore(slide, prevButton);
        } else {
            slideshowContainer.appendChild(slide);
        }
        
        // Add dot for this slide
        if (dotsContainer) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.onclick = function() { currentSlide(index + 1); };
            dotsContainer.appendChild(dot);
        }
    });
    
    // Initialize slideshow
    showSlides(slideIndex);
    initAutoSlide();
    slideshowInitialized = true;
}

// Auto-advance slides
function initAutoSlide() {
    setInterval(function() {
        plusSlides(1);
    }, 5000);
}

// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("hero-slide");
    let dots = document.getElementsByClassName("dot");
    
    // If no slides, exit function
    if (slides.length === 0) return;
    
    // Handle edge cases for navigation
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    
    // Hide all slides
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    // Remove active class from all dots
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    // Show the current slide and set the corresponding dot to active
    slides[slideIndex-1].style.display = "block";
    
    // Make sure dot exists before setting active
    if (dots.length > 0 && dots[slideIndex-1]) {
        dots[slideIndex-1].className += " active";
    }
}