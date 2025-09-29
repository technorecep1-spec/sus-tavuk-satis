// ========================================
// WYANDOTTE TR - MODERN TECH UI JAVASCRIPT
// ========================================

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeTechUI();
    initializeAnimations();
    initializeTooltips();
    initializeModals();
    initializeFormValidation();
    initializeLoadingStates();
    initializeScrollEffects();
    initializeNavbarToggle();
    initializeUserPanel();
    initializeParticleEffect();
    initContactPage();
    initGalleryPage();
    initBlogPage();
    initializeQuantitySelectors();
    initializeProductActions();
    initializeProductDetailPage();
    initializeProductsPage();
});

// Tech UI Initialization
function initializeTechUI() {
    // Add tech UI classes to elements
    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('tech-card');
    });
    
    // Initialize glassmorphism effects
    initializeGlassmorphism();
    
    // Initialize tech gradients
    initializeTechGradients();
    
    // Initialize neon effects
    initializeNeonEffects();
}

// Glassmorphism Effects
function initializeGlassmorphism() {
    const glassElements = document.querySelectorAll('.page-container, .feature-card, .navbar');
    glassElements.forEach(element => {
        element.style.backdropFilter = 'blur(20px)';
        element.style.webkitBackdropFilter = 'blur(20px)';
    });
}

// Tech Gradients
function initializeTechGradients() {
    const gradientElements = document.querySelectorAll('.btn-primary, .hero-section');
    gradientElements.forEach(element => {
        element.style.background = 'linear-gradient(135deg, #ff6b6b, #ffa726)';
    });
}

// Neon Effects
function initializeNeonEffects() {
    const neonElements = document.querySelectorAll('.neon-text');
    neonElements.forEach(element => {
        element.style.textShadow = '0 0 10px rgba(255, 107, 53, 0.5), 0 0 20px rgba(255, 107, 53, 0.3)';
    });
}

// Particle Effect
function initializeParticleEffect() {
    const heroSection = document.querySelector('.hero-section, .modern-hero');
    if (heroSection) {
        createParticleEffect(heroSection);
    }
}

function createParticleEffect(container) {
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            pointer-events: none;
            animation: float ${Math.random() * 10 + 10}s infinite linear;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 10}s;
        `;
        container.appendChild(particle);
    }
}

// Scroll Effects
function initializeScrollEffects() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.card, .stat-card, .feature-card, .btn').forEach(el => {
        observer.observe(el);
    });
}

// Navbar Toggle
function initializeNavbarToggle() {
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarNav = document.querySelector('.navbar-nav');
    
    if (navbarToggle && navbarNav) {
        navbarToggle.addEventListener('click', () => {
            navbarToggle.classList.toggle('active');
            navbarNav.classList.toggle('active');
        });
        
        // Close navbar when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbarToggle.classList.remove('active');
                navbarNav.classList.remove('active');
            });
        });
        
        // Close navbar when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbarToggle.contains(e.target) && !navbarNav.contains(e.target)) {
                navbarToggle.classList.remove('active');
                navbarNav.classList.remove('active');
            }
        });
    }
}

// Dropdown Menu
// Initialize user panel functionality
function initializeUserPanel() {
    // Panel is controlled by toggleUserPanel() and closeUserPanel() functions
    // These are called directly from HTML onclick events
}

// Toggle user panel
function toggleUserPanel() {
    const overlay = document.getElementById('userPanelOverlay');
    const panel = document.getElementById('userPanel');
    
    if (overlay && panel) {
        overlay.classList.add('show');
        panel.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
        console.warn('User panel elements not found. User might not be logged in.');
    }
}

// Close user panel
function closeUserPanel() {
    const overlay = document.getElementById('userPanelOverlay');
    const panel = document.getElementById('userPanel');
    
    if (overlay && panel) {
        overlay.classList.remove('show');
        panel.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Products Page Functions
function filterProducts() {
    // Get filter selects more reliably
    const filterSelects = document.querySelectorAll('select[onchange="filterProducts()"]');
    const categoryFilter = filterSelects[0];
    const priceFilter = filterSelects[1];
    
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    const selectedPrice = priceFilter ? priceFilter.value : '';
    
    console.log('Filtering - Category:', selectedCategory, 'Price:', selectedPrice);
    
    // Get all product cards
    const productCards = document.querySelectorAll('.product-card');
    console.log('Total products found:', productCards.length);
    
    let visibleCount = 0;
    
    productCards.forEach(card => {
        let showCard = true;
        
        // Category filter
        if (selectedCategory) {
            const productCategory = card.getAttribute('data-category') || '';
            console.log('Product category:', productCategory, 'Selected:', selectedCategory);
            if (productCategory !== selectedCategory) {
                showCard = false;
            }
        }
        
        // Price filter
        if (selectedPrice && showCard) {
            const priceElement = card.querySelector('.price-current');
            const priceText = priceElement ? priceElement.textContent : '';
            const price = parseFloat(priceText.replace(/[^\d]/g, ''));
            
            console.log('Product price:', price, 'Price filter:', selectedPrice);
            
            if (selectedPrice === '0-500' && price > 500) showCard = false;
            else if (selectedPrice === '500-1000' && (price < 500 || price > 1000)) showCard = false;
            else if (selectedPrice === '1000-2000' && (price < 1000 || price > 2000)) showCard = false;
            else if (selectedPrice === '2000+' && price < 2000) showCard = false;
        }
        
        // Show/hide card
        if (showCard) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log('Visible products after filtering:', visibleCount);
    
    // Update product count
    updateProductCount();
}

function sortProducts() {
    const sortSelect = document.querySelector('select[onchange="sortProducts()"]');
    const sortBy = sortSelect ? sortSelect.value : 'name';
    
    console.log('Sorting by:', sortBy);
    
    const productsContainer = document.querySelector('.products-grid');
    if (!productsContainer) return;
    
    const productCards = Array.from(productsContainer.querySelectorAll('.product-card'));
    console.log('Products to sort:', productCards.length);
    
    productCards.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                const nameA = a.querySelector('.product-name')?.textContent || '';
                const nameB = b.querySelector('.product-name')?.textContent || '';
                return nameA.localeCompare(nameB, 'tr');
                
            case 'price-low':
                const priceA = parseFloat(a.querySelector('.price-current')?.textContent?.replace(/[^\d]/g, '') || '0');
                const priceB = parseFloat(b.querySelector('.price-current')?.textContent?.replace(/[^\d]/g, '') || '0');
                return priceA - priceB;
                
            case 'price-high':
                const priceAHigh = parseFloat(a.querySelector('.price-current')?.textContent?.replace(/[^\d]/g, '') || '0');
                const priceBHigh = parseFloat(b.querySelector('.price-current')?.textContent?.replace(/[^\d]/g, '') || '0');
                return priceBHigh - priceAHigh;
                
            case 'stock':
                // Get stock number from the stock info
                const stockTextA = a.querySelector('.stock-info span')?.textContent || '';
                const stockTextB = b.querySelector('.stock-info span')?.textContent || '';
                const stockA = parseInt(stockTextA.replace(/[^\d]/g, '')) || 0;
                const stockB = parseInt(stockTextB.replace(/[^\d]/g, '')) || 0;
                console.log('Stock A:', stockA, 'Stock B:', stockB);
                return stockB - stockA; // Higher stock first
                
            default:
                return 0;
        }
    });
    
    // Re-append sorted cards
    productCards.forEach(card => productsContainer.appendChild(card));
    
    console.log('Products sorted by:', sortBy);
}

function updateProductCount() {
    const visibleProducts = document.querySelectorAll('.product-card[style*="block"], .product-card:not([style*="none"])');
    const totalProducts = document.querySelectorAll('.product-card').length;
    
    // Update any product count display if it exists
    const countElement = document.querySelector('.product-count');
    if (countElement) {
        countElement.textContent = `${visibleProducts.length} / ${totalProducts} ürün`;
    }
}

// Add to cart functionality
function addToCart(productId) {
    // This would be implemented with actual cart functionality
    console.log('Adding product to cart:', productId);
    showNotification('Ürün sepete eklendi!', 'success');
}

// Initialize products page
function initializeProductsPage() {
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchProducts(this.value);
        });
    }
    
    // Add to cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            addToCart(productId);
        });
    });
    
    // Top action buttons (wishlist and compare)
    document.querySelectorAll('.top-action-btn.wishlist').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            toggleWishlist(productId);
        });
    });
    
    document.querySelectorAll('.top-action-btn.compare').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            toggleCompare(productId);
        });
    });
    
    // Quantity selectors
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const isIncrease = this.classList.contains('qty-increase');
            const quantityDisplay = this.parentElement.querySelector('.qty-display');
            let currentQty = parseInt(quantityDisplay.textContent) || 1;
            
            if (isIncrease) {
                currentQty = Math.min(currentQty + 1, 99);
            } else {
                currentQty = Math.max(currentQty - 1, 1);
            }
            
            quantityDisplay.textContent = currentQty;
            animateQuantityChange(quantityDisplay);
        });
    });
}

// Search products function
function searchProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    const term = searchTerm.toLowerCase().trim();
    
    console.log('Searching for:', term);
    
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name')?.textContent?.toLowerCase() || '';
        const productDescription = card.querySelector('.product-description')?.textContent?.toLowerCase() || '';
        const productCategory = card.getAttribute('data-category')?.toLowerCase() || '';
        
        const matches = productName.includes(term) || 
                       productDescription.includes(term) || 
                       productCategory.includes(term);
        
        // Only show if it matches search AND current filters
        if (matches) {
            // Apply current filters
            const filterSelects = document.querySelectorAll('select[onchange="filterProducts()"]');
            const categoryFilter = filterSelects[0];
            const priceFilter = filterSelects[1];
            
            const selectedCategory = categoryFilter ? categoryFilter.value : '';
            const selectedPrice = priceFilter ? priceFilter.value : '';
            
            let showCard = true;
            
            // Category filter
            if (selectedCategory && productCategory !== selectedCategory) {
                showCard = false;
            }
            
            // Price filter
            if (selectedPrice && showCard) {
                const priceElement = card.querySelector('.price-current');
                const priceText = priceElement ? priceElement.textContent : '';
                const price = parseFloat(priceText.replace(/[^\d]/g, ''));
                
                if (selectedPrice === '0-500' && price > 500) showCard = false;
                else if (selectedPrice === '500-1000' && (price < 500 || price > 1000)) showCard = false;
                else if (selectedPrice === '1000-2000' && (price < 1000 || price > 2000)) showCard = false;
                else if (selectedPrice === '2000+' && price < 2000) showCard = false;
            }
            
            card.style.display = showCard ? 'block' : 'none';
        } else {
            card.style.display = 'none';
        }
    });
    
    updateProductCount();
}

function toggleWishlist(productId) {
    console.log('Toggling wishlist for product:', productId);
    showNotification('Favorilere eklendi!', 'success');
}

function toggleCompare(productId) {
    console.log('Toggling compare for product:', productId);
    showNotification('Karşılaştırma listesine eklendi!', 'success');
}

function openQuickView(productId) {
    console.log('Opening quick view for product:', productId);
    showQuickView(productId);
}

// Quantity change animation
function animateQuantityChange(element) {
    element.style.transform = 'scale(1.2)';
    element.style.color = 'var(--primary-color)';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.color = '';
    }, 200);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="bi bi-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #17a2b8, #6f42c1)'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Quantity functions
function increaseQuantity(productId) {
    const qtyDisplay = document.getElementById(`qty-${productId}`);
    let currentQty = parseInt(qtyDisplay.textContent) || 0;
    currentQty++;
    qtyDisplay.textContent = currentQty;
    qtyDisplay.style.color = currentQty > 0 ? 'var(--primary-color)' : 'var(--white)';
}

function decreaseQuantity(productId) {
    const qtyDisplay = document.getElementById(`qty-${productId}`);
    let currentQty = parseInt(qtyDisplay.textContent) || 0;
    if (currentQty > 0) {
        currentQty--;
        qtyDisplay.textContent = currentQty;
        qtyDisplay.style.color = currentQty > 0 ? 'var(--primary-color)' : 'var(--white)';
    }
}

// Animations
function initializeAnimations() {
    // Staggered fade-in animation for cards
    const cards = document.querySelectorAll('.card, .stat-card, .feature-card, .btn');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-fade-in');
    });
}

// Tooltips
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = this.getAttribute('title');
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.cssText = `
                position: absolute;
                top: ${rect.top - 40}px;
                left: ${rect.left + rect.width / 2}px;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
            `;
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.custom-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Modals
function initializeModals() {
    const modalTriggers = document.querySelectorAll('[data-bs-toggle="modal"]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const targetModal = document.querySelector(this.getAttribute('data-bs-target'));
            if (targetModal) {
                targetModal.style.display = 'block';
                targetModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    const modalCloses = document.querySelectorAll('[data-bs-dismiss="modal"]');
    modalCloses.forEach(close => {
        close.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    });
}

// Form Validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#e74c3c';
                    field.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
                } else {
                    field.style.borderColor = '#2ecc71';
                    field.style.boxShadow = '0 0 0 2px rgba(46, 204, 113, 0.2)';
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('Lütfen tüm gerekli alanları doldurun!', 'error');
            }
        });
    });
}

// Loading States
function initializeLoadingStates() {
    // Add loading states to buttons (but exclude login and register forms)
    const buttons = document.querySelectorAll('.btn[type="submit"]');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Skip loading state for login and register forms
            if (this.form && (this.form.id === 'loginForm' || this.form.id === 'registerForm')) {
                return;
            }
            
            if (this.form && this.form.checkValidity()) {
                this.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Yükleniyor...';
                this.disabled = true;
            }
        });
    });
}

// Initialize Quantity Selectors
function initializeQuantitySelectors() {
    // Use event delegation for dynamically added elements
    document.addEventListener('click', function(e) {
        if (e.target.closest('.qty-btn')) {
            const button = e.target.closest('.qty-btn');
            const targetId = button.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const isPlus = button.classList.contains('plus');
            const isMinus = button.classList.contains('minus');
            
            if (input) {
                let currentValue = parseInt(input.value) || 1;
                const maxValue = parseInt(input.getAttribute('max')) || 999;
                const minValue = parseInt(input.getAttribute('min')) || 1;
                
                if (isPlus && currentValue < maxValue) {
                    currentValue++;
                } else if (isMinus && currentValue > minValue) {
                    currentValue--;
                }
                
                input.value = currentValue;
                
                // Add animation effect
                input.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    input.style.transform = 'scale(1)';
                }, 150);
            }
        }
    });
}

// Initialize Product Actions
function initializeProductActions() {
    // Use event delegation for dynamically added elements
    document.addEventListener('click', function(e) {
        // Wishlist functionality
        if (e.target.closest('.wishlist')) {
            e.preventDefault();
            const button = e.target.closest('.wishlist');
            const productId = button.getAttribute('data-product');
            const icon = button.querySelector('i');
            
            // Toggle wishlist state
            if (icon.classList.contains('bi-heart')) {
                icon.classList.remove('bi-heart');
                icon.classList.add('bi-heart-fill');
                button.style.color = '#e74c3c';
                
                // Show success message
                showNotification('Ürün favorilere eklendi!', 'success');
            } else {
                icon.classList.remove('bi-heart-fill');
                icon.classList.add('bi-heart');
                button.style.color = '';
                
                // Show info message
                showNotification('Ürün favorilerden çıkarıldı!', 'info');
            }
        }
        
        // Compare functionality
        if (e.target.closest('.compare')) {
            e.preventDefault();
            const button = e.target.closest('.compare');
            const productId = button.getAttribute('data-product');
            
            // Toggle compare state
            if (button.classList.contains('active')) {
                button.classList.remove('active');
                button.style.color = '';
                showNotification('Ürün karşılaştırmadan çıkarıldı!', 'info');
            } else {
                button.classList.add('active');
                button.style.color = '#3498db';
                showNotification('Ürün karşılaştırmaya eklendi!', 'success');
            }
        }
        
        // Quick view functionality
        if (e.target.closest('.quick-view')) {
            e.preventDefault();
            const button = e.target.closest('.quick-view');
            const productId = button.getAttribute('data-product');
            showQuickView(productId);
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Show quick view modal
function showQuickView(productId) {
    // Find the product card to get product info
    const productCard = document.querySelector(`[data-product="${productId}"]`) || 
                       document.querySelector(`.product-card:has([data-product="${productId}"])`) ||
                       document.querySelector('.product-card');
    
    // Get product information from the card
    const productName = productCard?.querySelector('.product-name')?.textContent || 'Ürün';
    const productDescription = productCard?.querySelector('.product-description')?.textContent || 'Ürün açıklaması mevcut değil.';
    const productPrice = productCard?.querySelector('.price-current')?.textContent || 'Fiyat bilgisi yok';
    const productStock = productCard?.querySelector('.stock-info span')?.textContent || 'Stok bilgisi yok';
    const productImage = productCard?.querySelector('.product-image img')?.src || '';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Hızlı Görünüm</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="product-preview">
                        <div class="product-image-section">
                            <img src="${productImage}" alt="${productName}" class="preview-image">
                        </div>
                        <div class="product-details">
                            <h4 class="product-title">${productName}</h4>
                            <p class="product-desc">${productDescription}</p>
                            <div class="product-price-section">
                                <span class="price">${productPrice}</span>
                                <span class="stock">${productStock}</span>
                            </div>
                            <div class="product-actions">
                                <a href="/product/${productId}" class="btn btn-primary">Detayları Gör</a>
                                <button class="btn btn-secondary" onclick="addToCart('${productId}')">Sepete Ekle</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
            }, 300);
        }
    });
}

// Gallery Page Functions
function initGalleryPage() {
    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeInUp 0.5s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Load more functionality
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simulate loading more images
            this.innerHTML = '<i class="bi bi-hourglass-split"></i> <span>Yükleniyor...</span>';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = '<i class="bi bi-arrow-down-circle"></i> <span>Daha Fazla Yükle</span>';
                this.disabled = false;
                showNotification('Tüm fotoğraflar yüklendi!', 'info');
            }, 2000);
        });
    }
    
    // Gallery item interactions
    galleryItems.forEach(item => {
        const heartIcon = item.querySelector('.gallery-icon:nth-child(2)');
        const shareIcon = item.querySelector('.gallery-icon:nth-child(3)');
        
        if (heartIcon) {
            heartIcon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                this.classList.toggle('liked');
                if (this.classList.contains('liked')) {
                    this.innerHTML = '<i class="bi bi-heart-fill"></i>';
                    showNotification('Fotoğraf beğenildi!', 'success');
                } else {
                    this.innerHTML = '<i class="bi bi-heart"></i>';
                    showNotification('Beğeni kaldırıldı!', 'info');
                }
            });
        }
        
        if (shareIcon) {
            shareIcon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const imageUrl = item.querySelector('img').src;
                const imageTitle = item.querySelector('h3').textContent;
                
                if (navigator.share) {
                    navigator.share({
                        title: imageTitle,
                        text: 'Silver Wyandotte Galerisi',
                        url: imageUrl
                    });
                } else {
                    // Fallback for browsers that don't support Web Share API
                    navigator.clipboard.writeText(imageUrl).then(() => {
                        showNotification('Fotoğraf linki kopyalandı!', 'success');
                    });
                }
            });
        }
    });
}

// Blog Page Functions
function initBlogPage() {
    // Filter functionality
    const filterBtns = document.querySelectorAll('.blog-filters .filter-btn');
    const blogItems = document.querySelectorAll('.blog-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            blogItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeInUp 0.5s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Load more functionality
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simulate loading more posts
            this.innerHTML = '<i class="bi bi-hourglass-split"></i> <span>Yükleniyor...</span>';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = '<i class="bi bi-arrow-down-circle"></i> <span>Daha Fazla Yükle</span>';
                this.disabled = false;
                showNotification('Tüm makaleler yüklendi!', 'info');
            }, 2000);
        });
    }
    
    // Blog item interactions
    blogItems.forEach(item => {
        const readMoreLink = item.querySelector('.read-more');
        
        if (readMoreLink) {
            readMoreLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const postTitle = item.querySelector('.blog-title a').textContent;
                showNotification(`"${postTitle}" makalesi açılıyor...`, 'info');
                
                // Simulate navigation
                setTimeout(() => {
                    window.location.href = this.href;
                }, 1000);
            });
        }
    });
}

// Contact Page Functions
function initContactPage() {
    // Form validasyonu
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form verilerini al
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            // Validasyon
            if (!name || !email || !subject || !message) {
                showNotification('Lütfen tüm alanları doldurun!', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Geçerli bir e-posta adresi girin!', 'error');
                return;
            }
            
            // Form gönderimi simülasyonu
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> <span>Gönderiliyor...</span>';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                showNotification('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.', 'success');
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
    
    // Form alanları için real-time validasyon
    const formInputs = document.querySelectorAll('.form-control');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
    
    // Sosyal medya linklerine tıklama efekti
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Sosyal medya sayfalarımız yakında aktif olacak!', 'info');
        });
    });
}

// E-posta validasyonu
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Alan validasyonu
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.getAttribute('name');
    
    clearFieldError(field);
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Bu alan zorunludur');
        return false;
    }
    
    if (fieldName === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Geçerli bir e-posta adresi girin');
        return false;
    }
    
    if (fieldName === 'name' && value && value.length < 2) {
        showFieldError(field, 'Ad en az 2 karakter olmalıdır');
        return false;
    }
    
    if (fieldName === 'message' && value && value.length < 10) {
        showFieldError(field, 'Mesaj en az 10 karakter olmalıdır');
        return false;
    }
    
    return true;
}

// Alan hatası göster
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#dc3545';
    field.style.backgroundColor = '#fff5f5';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = 'color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.25rem;';
    errorDiv.innerHTML = `<i class="bi bi-exclamation-circle"></i> ${message}`;
    
    field.parentNode.appendChild(errorDiv);
}

// Alan hatasını temizle
function clearFieldError(field) {
    field.style.borderColor = '';
    field.style.backgroundColor = '';
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Product Detail Page Functions
function changeMainImage(imageSrc) {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.src === imageSrc) {
            thumb.classList.add('active');
        }
    });
}

function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    if (modal && modalImage) {
        modalImage.src = imageSrc;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

function increaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value) || 1;
        const maxValue = parseInt(quantityInput.getAttribute('max')) || 999;
        
        if (currentValue < maxValue) {
            quantityInput.value = currentValue + 1;
            animateQuantityChange(quantityInput);
        }
    }
}

function decreaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value) || 1;
        const minValue = parseInt(quantityInput.getAttribute('min')) || 1;
        
        if (currentValue > minValue) {
            quantityInput.value = currentValue - 1;
            animateQuantityChange(quantityInput);
        }
    }
}

function animateQuantityChange(input) {
    input.style.transform = 'scale(1.1)';
    input.style.borderColor = 'var(--primary)';
    
    setTimeout(() => {
        input.style.transform = 'scale(1)';
        input.style.borderColor = '';
    }, 150);
}

function toggleWishlist(productId) {
    const btn = event.target.closest('.wishlist');
    const icon = btn.querySelector('i');
    
    if (icon.classList.contains('bi-heart')) {
        icon.classList.remove('bi-heart');
        icon.classList.add('bi-heart-fill');
        btn.style.color = '#e74c3c';
        showNotification('Ürün favorilere eklendi!', 'success');
    } else {
        icon.classList.remove('bi-heart-fill');
        icon.classList.add('bi-heart');
        btn.style.color = '';
        showNotification('Ürün favorilerden çıkarıldı!', 'info');
    }
}

function toggleCompare(productId) {
    const btn = event.target.closest('.compare');
    
    if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        btn.style.color = '';
        showNotification('Ürün karşılaştırmadan çıkarıldı!', 'info');
    } else {
        btn.classList.add('active');
        btn.style.color = '#3498db';
        showNotification('Ürün karşılaştırmaya eklendi!', 'success');
    }
}

function shareProduct() {
    if (navigator.share) {
        navigator.share({
            title: document.querySelector('.product-title')?.textContent || 'Ürün',
            text: 'Bu ürünü inceleyin!',
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href).then(() => {
            showNotification('Ürün linki kopyalandı!', 'success');
        });
    }
}

// Tab functionality for product detail page
function initializeProductTabs() {
    // Use event delegation for tab buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.tab-btn')) {
            const button = e.target.closest('.tab-btn');
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        }
    });
}

// Initialize product detail page functions
function initializeProductDetailPage() {
    initializeProductTabs();
    
    // Close image modal when clicking outside
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                closeImageModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    });
}


// Smooth Scrolling
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Search Functionality
function initializeSearch() {
    const searchInputs = document.querySelectorAll('input[type="search"], input[name="search"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const searchableElements = document.querySelectorAll('.product-card, .card');
            
            searchableElements.forEach(element => {
                const text = element.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            });
        });
    });
}

// Initialize search on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});