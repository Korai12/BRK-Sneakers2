// Slideshow για την αρχική σελίδα,διαχειρίζεται η αυτόματη εναλλαγή slides και τη φόρτωση δημοφιλών προϊόντων.
let slideIndex = 1;
let slideshowInitialized = false;


document.addEventListener('DOMContentLoaded', function() {
    // Φόρτωση δημοφιλών προϊόντων
    if (isHomePage()) {
        fetchPopularProducts();
    } else {
        showSlides(slideIndex);
        initAutoSlide();
    }
});


function isHomePage() {
    const path = window.location.pathname;
    return path.includes('index.html') || path === '/' || path.endsWith('/');
}

// Φόρτωση δημοφιλών προϊόντων από το API
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
                showSlides(slideIndex);
                initAutoSlide();
            }
        })
        .catch(error => {
            console.error('Error fetching popular products:', error);
            showSlides(slideIndex);
            initAutoSlide();
        });
}

// Ενημέρωση slideshow με προϊόντα από το API
function updateSlideshow(products) {
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (!slideshowContainer) return;
    
    
    const prevButton = slideshowContainer.querySelector('.prev');
    const nextButton = slideshowContainer.querySelector('.next');
    const dotsContainer = slideshowContainer.querySelector('.dots-container');
    
    
    const existingSlides = slideshowContainer.querySelectorAll('.hero-slide');
    existingSlides.forEach(slide => slide.remove());
    
    if (dotsContainer) {
        const existingDots = dotsContainer.querySelectorAll('.dot');
        existingDots.forEach(dot => dot.remove());
    }
    
    
    const displayProducts = products.slice(0, 5);
    
    displayProducts.forEach((product, index) => {
        
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
        
        
        if (prevButton) {
            slideshowContainer.insertBefore(slide, prevButton);
        } else {
            slideshowContainer.appendChild(slide);
        }
        
        
        if (dotsContainer) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.onclick = function() { currentSlide(index + 1); };
            dotsContainer.appendChild(dot);
        }
    });
    
    // Αρχικοποίηση slideshow
    showSlides(slideIndex);
    initAutoSlide();
    slideshowInitialized = true;
}

// Αυτόματη αλλαγή slide κάθε 5 δευτερόλεπτα
function initAutoSlide() {
    setInterval(function() {
        plusSlides(1);
    }, 5000);
}


function plusSlides(n) {
    showSlides(slideIndex += n);
}


function currentSlide(n) {
    showSlides(slideIndex = n);
}

// Εμφάνιση του slide
function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("hero-slide");
    let dots = document.getElementsByClassName("dot");
    
    
    if (slides.length === 0) return;
    
    
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    
    
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    
    slides[slideIndex-1].style.display = "block";
    
    
    if (dots.length > 0 && dots[slideIndex-1]) {
        dots[slideIndex-1].className += " active";
    }
}