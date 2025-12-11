// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initPortfolioFilters();
    initContactForm();
    initScrollAnimations();
    initSkillAnimations();
    initCountingNumbers();
    initModals(); // Fixed modal system
    initScrollToTop();
    initPrintFunction();
    initAdvancedAnimations();
});

// Enhanced Navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const sections = document.querySelectorAll('section');
    const header = document.querySelector('.header');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('open')) {
                    navMenu.classList.remove('open');
                    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
    
    // Enhanced active navigation highlighting with intersection observer
    const observerOptions = {
        rootMargin: '-120px 0px -60% 0px',
        threshold: 0
    };
    
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        navObserver.observe(section);
    });

    // Enhanced header effects
    const toggleHeaderEffects = () => {
        if (header) {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    };
    
    window.addEventListener('scroll', debounce(toggleHeaderEffects, 10));
    toggleHeaderEffects();

    // Mobile navigation
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            
            // Animate hamburger icon
            const icon = navToggle.querySelector('i');
            if (icon) {
                if (isOpen) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                const icon = navToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        });
    }

}

// Enhanced Portfolio Filters with Search
function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const searchInput = document.getElementById('portfolioSearch');
    
    let currentFilter = 'all';
    let searchTerm = '';
    
    function filterItems() {
        portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');
            const title = item.getAttribute('data-title')?.toLowerCase() || '';
            const description = item.getAttribute('data-description')?.toLowerCase() || '';
            
            const matchesFilter = currentFilter === 'all' || category === currentFilter;
            const matchesSearch = !searchTerm || 
                title.includes(searchTerm.toLowerCase()) || 
                description.includes(searchTerm.toLowerCase());
            
            if (matchesFilter && matchesSearch) {
                item.classList.remove('hidden');
                item.style.animation = 'fadeIn 0.5s ease-in-out';
            } else {
                item.classList.add('hidden');
            }
        });
    }
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            filterItems();
        });
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            searchTerm = e.target.value.trim();
            filterItems();
        }, 300));
    }
}

// Enhanced Contact Form with Formspree Integration
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const btnText = submitButton?.querySelector('.btn-text');
            const btnLoading = submitButton?.querySelector('.btn-loading');
            
            // Validate form
            if (!validateForm(formData)) {
                return;
            }
            
            // Show loading state
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'flex';
            if (submitButton) submitButton.disabled = true;
            
            try {
                const response = await fetch(contactForm.action || '#', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                    contactForm.reset();
                    
                    // Add success animation
                    contactForm.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        contactForm.style.transform = 'scale(1)';
                    }, 200);
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Failed to send message. Please try again or contact me directly.', 'error');
            } finally {
                // Reset button state
                if (btnText) btnText.style.display = 'inline';
                if (btnLoading) btnLoading.style.display = 'none';
                if (submitButton) submitButton.disabled = false;
            }
        });
    }
}

// Enhanced Form Validation
function validateForm(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    if (!name || name.length < 2) {
        showNotification('Please enter a valid name (at least 2 characters)', 'error');
        return false;
    }
    
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    if (!subject || subject.length < 5) {
        showNotification('Please enter a subject (at least 5 characters)', 'error');
        return false;
    }
    
    if (!message || message.length < 10) {
        showNotification('Please enter a message (at least 10 characters)', 'error');
        return false;
    }
    
    return true;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Enhanced Notification System
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Create notification content
    const content = document.createElement('div');
    content.className = 'notification-content';
    
    const icon = document.createElement('i');
    const text = document.createElement('span');
    text.textContent = message;
    
    // Set icon based on type
    switch (type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            break;
        default:
            icon.className = 'fas fa-info-circle';
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.addEventListener('click', () => removeNotification(notification));
    
    content.appendChild(icon);
    content.appendChild(text);
    notification.appendChild(content);
    notification.appendChild(closeBtn);
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    `;
    
    // Set background color based on type
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        info: 'linear-gradient(135deg, #06ffa5, #8b5cf6)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Auto remove
    setTimeout(() => removeNotification(notification), duration);
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// FIXED MODAL SYSTEM
function initModals() {
    console.log('Initializing modals...');
    
    // Remove any existing event listeners to prevent duplicates
    const existingListeners = document.querySelectorAll('[data-modal-initialized]');
    existingListeners.forEach(el => {
        el.removeAttribute('data-modal-initialized');
    });

    // Project detail buttons
    const detailsBtns = document.querySelectorAll('.details-btn');
    console.log('Found detail buttons:', detailsBtns.length);
    
    detailsBtns.forEach(btn => {
        btn.setAttribute('data-modal-initialized', 'true');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const projectId = btn.getAttribute('data-project');
            console.log('Clicked project:', projectId);
            if (projectId) {
                showProjectDetails(projectId);
            }
        });
    });

    // Service detail buttons
    const serviceReadMoreBtns = document.querySelectorAll('.read-more-btn');
    serviceReadMoreBtns.forEach(btn => {
        btn.setAttribute('data-modal-initialized', 'true');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const serviceId = btn.getAttribute('data-service');
            if (serviceId) {
                showServiceDetails(serviceId);
            }
        });
    });

    // Blog read more buttons - now open external Blogger links
    const blogReadBtns = document.querySelectorAll('.read-more-blog');
    blogReadBtns.forEach(btn => {
        btn.setAttribute('data-modal-initialized', 'true');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const postId = btn.getAttribute('data-post');
            if (postId) {
                openBlogPost(postId);
            }
        });
    });

    // Close modal buttons
    const modalCloses = document.querySelectorAll('.modal-close');
    modalCloses.forEach(btn => {
        btn.setAttribute('data-modal-initialized', 'true');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal on outside click
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (!modal.getAttribute('data-modal-initialized')) {
            modal.setAttribute('data-modal-initialized', 'true');
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        }
    });

    // Close modal on Escape key (only add once)
    if (!document.hasAttribute('data-escape-listener')) {
        document.setAttribute('data-escape-listener', 'true');
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active, .modal.open');
                if (activeModal) {
                    closeModal(activeModal);
                }
            }
        });
    }
}

// Unified modal show function
function showModal(modal) {
    if (!modal) return;
    
    console.log('Showing modal:', modal.id);
    
    // Remove any existing active/open classes from all modals
    document.querySelectorAll('.modal').forEach(m => {
        m.classList.remove('active', 'open');
        m.style.display = 'none';
    });
    
    // Show the target modal
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Focus management for accessibility
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusableElements[0];
    
    if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100);
    }
}

// Unified modal close function
function closeModal(modal) {
    if (!modal) return;
    
    console.log('Closing modal:', modal.id);
    
    // Hide modal
    modal.classList.remove('active', 'open');
    modal.style.display = 'none';
    
    // Restore body scroll
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
}

function showProjectDetails(projectId) {
    console.log('showProjectDetails called with:', projectId);
    
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal) {
        console.error('Project modal not found');
        return;
    }
    
    if (!modalTitle) {
        console.error('Modal title element not found');
        return;
    }
    
    if (!modalContent) {
        console.error('Modal content element not found');
        return;
    }

    const projects = {
        'pixelprompt': {
            title: 'PixelPrompt - AI Wireframe Generator',
            content: `
                <div class="project-detail">
                    <div class="project-images">
                        <img src="https://via.placeholder.com/600x300/1a1a2e/06ffa5?text=PixelPrompt+Demo" alt="PixelPrompt Demo" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
                    </div>
                    <h3>Project Overview</h3>
                    <p>PixelPrompt is an innovative AI-powered tool that converts hand-drawn wireframes into fully functional websites. Using advanced computer vision and natural language processing, it understands design intentions and generates clean, responsive code.</p>
                    
                    <h3>Key Features</h3>
                    <ul>
                        <li>AI-powered wireframe recognition</li>
                        <li>Automatic code generation (HTML, CSS, JavaScript)</li>
                        <li>Component library integration</li>
                        <li>Real-time preview and editing</li>
                        <li>Export to popular frameworks (React, Vue)</li>
                        <li>Responsive design optimization</li>
                    </ul>
                    
                    <h3>Technology Stack</h3>
                    <div class="tech-stack">
                        <span class="tech-item">React</span>
                        <span class="tech-item">Node.js</span>
                        <span class="tech-item">OpenAI API</span>
                        <span class="tech-item">TensorFlow</span>
                        <span class="tech-item">MongoDB</span>
                        <span class="tech-item">AWS</span>
                    </div>
                    
                    <h3>Challenges & Solutions</h3>
                    <p>The main challenge was achieving accurate wireframe recognition. We implemented a multi-stage AI pipeline combining computer vision for element detection and NLP for understanding user intentions. The result is 85% accuracy in converting wireframes to functional code.</p>
                    
                    <h3>Impact & Results</h3>
                    <ul>
                        <li>Reduced design-to-code time by 70%</li>
                        <li>Served 1000+ designers and developers</li>
                        <li>Generated 5000+ unique websites</li>
                        <li>4.8/5 user satisfaction rating</li>
                    </ul>
                    
                    <div class="project-links">
                        <a href="#" class="btn btn-primary" target="_blank">View Live Demo</a>
                        <a href="#" class="btn btn-secondary" target="_blank">GitHub Repository</a>
                    </div>
                </div>
            `
        },
        'license-plate': {
            title: 'Smart License Plate Detection System',
            content: `
                <div class="project-detail">
                    <div class="project-images">
                        <img src="https://via.placeholder.com/600x300/1a1a2e/06ffa5?text=License+Plate+Detection" alt="License Plate Detection" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
                    </div>
                    <h3>Project Overview</h3>
                    <p>An intelligent license plate recognition system designed for automated gate control and parking management. Uses deep learning algorithms to detect and read license plates in real-time.</p>
                    
                    <h3>Key Features</h3>
                    <ul>
                        <li>Real-time license plate detection</li>
                        <li>OCR with 95% accuracy</li>
                        <li>Multi-country plate format support</li>
                        <li>Integration with gate control systems</li>
                        <li>Vehicle database management</li>
                        <li>Alert system for unauthorized vehicles</li>
                    </ul>
                    
                    <h3>Technology Stack</h3>
                    <div class="tech-stack">
                        <span class="tech-item">Python</span>
                        <span class="tech-item">OpenCV</span>
                        <span class="tech-item">TensorFlow</span>
                        <span class="tech-item">YOLO</span>
                        <span class="tech-item">Tesseract OCR</span>
                        <span class="tech-item">Raspberry Pi</span>
                    </div>
                    
                    <h3>Implementation Details</h3>
                    <p>The system uses a two-stage approach: first, YOLO detects license plates in the image, then a custom CNN extracts and recognizes the characters. The entire pipeline processes frames at 30 FPS on edge devices.</p>
                    
                    <h3>Results & Performance</h3>
                    <ul>
                        <li>95% plate detection accuracy</li>
                        <li>92% character recognition accuracy</li>
                        <li>Processing time: <200ms per frame</li>
                        <li>Successfully deployed in 3 parking facilities</li>
                    </ul>
                    
                    <div class="project-links">
                        <a href="#" class="btn btn-primary" target="_blank">View Demo Video</a>
                        <a href="#" class="btn btn-secondary" target="_blank">GitHub Repository</a>
                    </div>
                </div>
            `
        },
        'bus-tracker': {
            title: 'Smart Bus Arrival Detection System',
            content: `
                <div class="project-detail">
                    <div class="project-images">
                        <img src="https://via.placeholder.com/600x300/1a1a2e/06ffa5?text=Bus+Tracker+App" alt="Bus Tracker App" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
                    </div>
                    <h3>Project Overview</h3>
                    <p>A comprehensive mobile application that provides real-time bus tracking and arrival predictions for public transportation in Pokhara, Nepal. Helps commuters plan their journeys efficiently.</p>
                    
                    <h3>Key Features</h3>
                    <ul>
                        <li>Real-time bus location tracking</li>
                        <li>Accurate arrival time predictions</li>
                        <li>Route optimization suggestions</li>
                        <li>Offline map support</li>
                        <li>Push notifications for delays</li>
                        <li>User-friendly interface</li>
                    </ul>
                    
                    <h3>Technology Stack</h3>
                    <div class="tech-stack">
                        <span class="tech-item">React Native</span>
                        <span class="tech-item">Firebase</span>
                        <span class="tech-item">Google Maps API</span>
                        <span class="tech-item">Node.js</span>
                        <span class="tech-item">MongoDB</span>
                        <span class="tech-item">Socket.io</span>
                    </div>
                    
                    <h3>Machine Learning Integration</h3>
                    <p>The app uses machine learning algorithms to predict bus arrival times based on historical data, traffic patterns, weather conditions, and real-time GPS data. The prediction model achieves 85% accuracy within a 5-minute window.</p>
                    
                    <h3>Impact on Community</h3>
                    <ul>
                        <li>Reduced average waiting time by 40%</li>
                        <li>5000+ active daily users</li>
                        <li>Improved public transport efficiency</li>
                        <li>Featured in local tech news</li>
                    </ul>
                    
                    <div class="project-links">
                        <a href="#" class="btn btn-primary" target="_blank">Download Android App</a>
                        <a href="#" class="btn btn-secondary" target="_blank">GitHub Repository</a>
                    </div>
                </div>
            `
        },
        'ecommerce': {
            title: 'Full-Stack E-Commerce Platform',
            content: `
                <div class="project-detail">
                    <div class="project-images">
                        <img src="https://via.placeholder.com/600x300/1a1a2e/06ffa5?text=E-Commerce+Platform" alt="E-Commerce Platform" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
                    </div>
                    <h3>Project Overview</h3>
                    <p>A complete e-commerce solution with modern design, secure payments, and advanced features. Built for scalability and performance to handle high traffic and transaction volumes.</p>
                    
                    <h3>Key Features</h3>
                    <ul>
                        <li>Product catalog with search and filtering</li>
                        <li>User authentication and profiles</li>
                        <li>Shopping cart and wishlist</li>
                        <li>Secure payment integration (Stripe)</li>
                        <li>Order management system</li>
                        <li>Admin dashboard</li>
                        <li>Inventory management</li>
                        <li>Email notifications</li>
                    </ul>
                    
                    <h3>Technology Stack</h3>
                    <div class="tech-stack">
                        <span class="tech-item">Next.js</span>
                        <span class="tech-item">TypeScript</span>
                        <span class="tech-item">Stripe API</span>
                        <span class="tech-item">MongoDB</span>
                        <span class="tech-item">Tailwind CSS</span>
                        <span class="tech-item">Vercel</span>
                    </div>
                    
                    <h3>Architecture & Performance</h3>
                    <p>Built with a serverless architecture using Next.js API routes and MongoDB Atlas. Implements advanced caching strategies, image optimization, and lazy loading for optimal performance. Achieves 95+ Lighthouse scores.</p>
                    
                    <h3>Security Features</h3>
                    <ul>
                        <li>JWT-based authentication</li>
                        <li>PCI DSS compliant payment processing</li>
                        <li>SQL injection protection</li>
                        <li>Rate limiting and DDoS protection</li>
                        <li>Secure data encryption</li>
                    </ul>
                    
                    <div class="project-links">
                        <a href="#" class="btn btn-primary" target="_blank">View Live Site</a>
                        <a href="#" class="btn btn-secondary" target="_blank">GitHub Repository</a>
                    </div>
                </div>
            `
        },
        'ai-chatbot': {
            title: 'AI Customer Service Chatbot',
            content: `
                <div class="project-detail">
                    <div class="project-images">
                        <img src="https://via.placeholder.com/600x300/1a1a2e/06ffa5?text=AI+Chatbot" alt="AI Chatbot" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
                    </div>
                    <h3>Project Overview</h3>
                    <p>An intelligent chatbot system designed to automate customer service operations. Uses natural language processing to understand customer queries and provide accurate responses 24/7.</p>
                    
                    <h3>Key Features</h3>
                    <ul>
                        <li>Natural language understanding</li>
                        <li>Multi-language support</li>
                        <li>Intent recognition and entity extraction</li>
                        <li>Context-aware conversations</li>
                        <li>Integration with helpdesk systems</li>
                        <li>Analytics and reporting dashboard</li>
                    </ul>
                    
                    <h3>Technology Stack</h3>
                    <div class="tech-stack">
                        <span class="tech-item">Python</span>
                        <span class="tech-item">FastAPI</span>
                        <span class="tech-item">spaCy</span>
                        <span class="tech-item">OpenAI API</span>
                        <span class="tech-item">PostgreSQL</span>
                        <span class="tech-item">Docker</span>
                    </div>
                    
                    <h3>AI Capabilities</h3>
                    <p>The chatbot leverages advanced NLP models for intent classification, sentiment analysis, and response generation. It can handle complex queries, maintain conversation context, and escalate to human agents when necessary.</p>
                    
                    <h3>Business Impact</h3>
                    <ul>
                        <li>Reduced customer service costs by 60%</li>
                        <li>Handles 80% of queries automatically</li>
                        <li>24/7 availability with 2-second response time</li>
                        <li>95% customer satisfaction rating</li>
                    </ul>
                    
                    <div class="project-links">
                        <a href="#" class="btn btn-primary" target="_blank">Try Live Demo</a>
                        <a href="#" class="btn btn-secondary" target="_blank">GitHub Repository</a>
                    </div>
                </div>
            `
        }
    };

    const project = projects[projectId];
    if (project) {
        modalTitle.textContent = project.title;
        modalContent.innerHTML = project.content;
        showModal(modal);
    } else {
        console.error('Project not found:', projectId);
        showNotification('Project details not found', 'error');
    }
}

function showServiceDetails(serviceId) {
    const modal = document.getElementById('serviceModal');
    const modalTitle = document.getElementById('serviceModalTitle');
    const modalContent = document.getElementById('serviceModalContent');
    
    if (!modal || !modalTitle || !modalContent) {
        console.error('Service modal elements not found');
        return;
    }

    const services = {
        'web': {
            title: 'Web Development Services',
            content: `
                <div class="service-detail">
                    <h3>What I Offer</h3>
                    <p>I create modern, responsive websites that not only look great but also perform excellently across all devices and browsers.</p>
                    
                    <h3>Services Included</h3>
                    <ul>
                        <li><strong>Frontend Development:</strong> HTML5, CSS3, JavaScript, React, Vue.js</li>
                        <li><strong>Responsive Design:</strong> Mobile-first approach, cross-browser compatibility</li>
                        <li><strong>Performance Optimization:</strong> Fast loading times, SEO optimization</li>
                        <li><strong>UI/UX Design:</strong> User-centered design, accessibility compliance</li>
                        <li><strong>Content Management:</strong> Easy-to-use admin panels</li>
                        <li><strong>Maintenance & Support:</strong> Ongoing updates and bug fixes</li>
                    </ul>
                    
                    <div class="cta-section">
                        <h3>Ready to Start Your Project?</h3>
                        <p>Let's discuss your web development needs and create something amazing together.</p>
                        <a href="#contact" class="btn btn-primary">Get Free Quote</a>
                    </div>
                </div>
            `
        },
        'fullstack': {
            title: 'Full Stack Development Services', 
            content: `
                <div class="service-detail">
                    <h3>Complete End-to-End Solutions</h3>
                    <p>I provide comprehensive full-stack development services, handling everything from user interface design to database architecture and server deployment.</p>
                    
                    <h3>What's Included</h3>
                    <ul>
                        <li><strong>Frontend Development:</strong> Modern React/Vue.js applications</li>
                        <li><strong>Backend Development:</strong> RESTful APIs, GraphQL, microservices</li>
                        <li><strong>Database Design:</strong> SQL and NoSQL database optimization</li>
                        <li><strong>Authentication:</strong> Secure user management systems</li>
                        <li><strong>Cloud Deployment:</strong> AWS, Google Cloud, Azure hosting</li>
                        <li><strong>DevOps:</strong> CI/CD pipelines, containerization</li>
                    </ul>
                    
                    <div class="cta-section">
                        <h3>Let's Build Your Full Stack Application</h3>
                        <p>Contact me to discuss your project requirements and get a detailed proposal.</p>
                        <a href="#contact" class="btn btn-primary">Start Your Project</a>
                    </div>
                </div>
            `
        },
        'mobile': {
            title: 'Mobile App Development',
            content: `
                <div class="service-detail">
                    <h3>Cross-Platform Mobile Solutions</h3>
                    <p>I develop high-performance mobile applications using React Native and Flutter, ensuring your app works seamlessly on both iOS and Android platforms.</p>
                    
                    <div class="cta-section">
                        <h3>Ready to Launch Your Mobile App?</h3>
                        <p>Let's turn your app idea into reality with cutting-edge mobile development.</p>
                        <a href="#contact" class="btn btn-primary">Discuss Your App Idea</a>
                    </div>
                </div>
            `
        },
        'ai': {
            title: 'AI Integration Services',
            content: `
                <div class="service-detail">
                    <h3>Intelligent Solutions for Modern Applications</h3>
                    <p>I integrate cutting-edge AI and machine learning capabilities into your applications, making them smarter and more efficient.</p>
                    
                    <div class="cta-section">
                        <h3>Make Your Application Intelligent</h3>
                        <p>Let's explore how AI can transform your business and improve user experience.</p>
                        <a href="#contact" class="btn btn-primary">Explore AI Solutions</a>
                    </div>
                </div>
            `
        },
        'cloud': {
            title: 'Cloud Solutions & DevOps',
            content: `
                <div class="service-detail">
                    <h3>Scalable Cloud Infrastructure</h3>
                    <p>I help businesses migrate to the cloud and implement DevOps practices for improved scalability, reliability, and cost efficiency.</p>
                    
                    <div class="cta-section">
                        <h3>Ready to Move to the Cloud?</h3>
                        <p>Let's discuss your cloud migration strategy and DevOps implementation.</p>
                        <a href="#contact" class="btn btn-primary">Get Cloud Consultation</a>
                    </div>
                </div>
            `
        },
        'consulting': {
            title: 'Technical Consulting Services',
            content: `
                <div class="service-detail">
                    <h3>Expert Technical Guidance</h3>
                    <p>I provide strategic technical consulting to help you make informed decisions about technology stack, architecture, and development practices.</p>
                    
                    <div class="cta-section">
                        <h3>Need Expert Technical Advice?</h3>
                        <p>Let's schedule a consultation to discuss your technical challenges and opportunities.</p>
                        <a href="#contact" class="btn btn-primary">Book Consultation</a>
                    </div>
                </div>
            `
        }
    };

    const service = services[serviceId];
    if (service) {
        modalTitle.textContent = service.title;
        modalContent.innerHTML = service.content;
        showModal(modal);
    }
}

function openBlogPost(postId) {
    // Mapping of blog post IDs to their Blogger URLs
    const blogUrls = {
        'web-trends': 'https://nischal-bhandari.blogspot.com/2025/07/ai-in-web-development-pragmatic.html',
        'Web-color': 'https://nischal-bhandari.blogspot.com/2025/07/psychology-of-color-in-web-design.html',
        'react-optimization': 'https://nischal-bhandari.blogspot.com/2025/07/react-performance-optimization.html'
    };

    const blogUrl = blogUrls[postId];
    const targetUrl = blogUrl || 'https://nischal-bhandari.blogspot.com/';
    
    // Show confirmation dialog before opening external link
    const confirmed = confirm(
        `This will open an external blog post in a new tab.\n\n` +
        `URL: ${targetUrl}\n\n` +
        `Do you want to continue?`
    );
    
    if (confirmed) {
        // Open the Blogger URL in a new tab
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
}


// Counting Numbers Animation
function initCountingNumbers() {
    const countElements = document.querySelectorAll('[data-count]');
    
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const targetCount = parseInt(element.getAttribute('data-count'));
                animateCount(element, targetCount);
                countObserver.unobserve(element);
            }
        });
    }, { threshold: 0.5 });
    
    countElements.forEach(element => {
        countObserver.observe(element);
    });
}

function animateCount(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 30);
}

// Enhanced Scroll Animations with Intersection Observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                
                // Add stagger effect for grid items
                if (entry.target.parentElement.classList.contains('services-grid') ||
                    entry.target.parentElement.classList.contains('portfolio-grid') ||
                    entry.target.parentElement.classList.contains('testimonials-grid') ||
                    entry.target.parentElement.classList.contains('certifications-grid') ||
                    entry.target.parentElement.classList.contains('blog-grid')) {
                    const siblings = Array.from(entry.target.parentElement.children);
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 100}ms`;
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .portfolio-item, .stat-card, .skill-item, .blog-card, .testimonial-card, .timeline-item, .certification-card, .resource-card');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Enhanced Skill Animations
function initSkillAnimations() {
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillCircles = document.querySelectorAll('.circle-progress');
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('skill-progress')) {
                    const targetWidth = entry.target.getAttribute('data-width');
                    entry.target.style.width = '0%';
                    setTimeout(() => {
                        entry.target.style.width = targetWidth;
                    }, 200);
                } else if (entry.target.classList.contains('circle-progress')) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'scale(1)';
                    }, 300);
                }
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => skillObserver.observe(bar));
    skillCircles.forEach(circle => skillObserver.observe(circle));
}

// Enhanced Blog System with Filtering and Pagination
function initBlogSystem() {
    const blogCards = document.querySelectorAll('.blog-card');
    const blogFilters = document.querySelectorAll('.blog-filter-btn');
    const blogSearch = document.getElementById('blogSearch');
    
    let currentBlogFilter = 'all';
    let blogSearchTerm = '';
    let currentPage = 1;
    const itemsPerPage = 6;
    
    function filterBlogPosts() {
        let visiblePosts = [];
        
        blogCards.forEach(card => {
            const category = card.getAttribute('data-category') || '';
            const title = card.getAttribute('data-title')?.toLowerCase() || '';
            const content = card.getAttribute('data-content')?.toLowerCase() || '';
            
            const matchesFilter = currentBlogFilter === 'all' || category === currentBlogFilter;
            const matchesSearch = !blogSearchTerm || 
                title.includes(blogSearchTerm.toLowerCase()) || 
                content.includes(blogSearchTerm.toLowerCase());
            
            card.style.display = 'none';

            if (matchesFilter && matchesSearch) {
                visiblePosts.push(card);
            }
        });
        
        paginateBlogPosts(visiblePosts);
    }
    
    function paginateBlogPosts(posts) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        posts.forEach((post, index) => {
            if (index >= startIndex && index < endIndex) {
                post.style.display = 'block';
            }
        });
    }
    
    blogFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            blogFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBlogFilter = btn.getAttribute('data-category');
            currentPage = 1;
            filterBlogPosts();
        });
    });
    
    if (blogSearch) {
        blogSearch.addEventListener('input', debounce((e) => {
            blogSearchTerm = e.target.value.trim();
            currentPage = 1;
            filterBlogPosts();
        }, 300));
    }
    
    filterBlogPosts();
}



// Social Sharing
function initSocialSharing() {
    const socialBtns = document.querySelectorAll('.social-share');
    
    socialBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.getAttribute('data-platform');
            const blogCard = btn.closest('.blog-card');
            if (blogCard) {
                const titleElement = blogCard.querySelector('h3');
                const title = titleElement ? titleElement.textContent : 'Check this out';
                const url = window.location.href;
                shareContent(platform, title, url);
            }
        });
    });
}

function shareContent(platform, title, url) {
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);
    
    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    };
    
    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

// Scroll to Top
function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTop');
    
    if (scrollBtn) {
        window.addEventListener('scroll', debounce(() => {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        }, 100));
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Print Function
function initPrintFunction() {
    const printBtn = document.getElementById('printPage');
    
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

// Advanced Animations
function initAdvancedAnimations() {
    // Mouse movement effect for cards
    const cards = document.querySelectorAll('.service-card, .portfolio-item, .testimonial-card, .certification-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Initialize performance optimizations
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

console.log('Enhanced Portfolio JavaScript loaded successfully!');