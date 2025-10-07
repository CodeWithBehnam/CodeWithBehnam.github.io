// Modern Blog Interactions

document.addEventListener('DOMContentLoaded', function() {
    
    // Add scroll progress bar
    createScrollProgress();
    
    // Add smooth reveal animations for cards
    addScrollAnimations();
    
    // Mobile menu toggle
    setupMobileMenu();
    
});

// Create scroll progress bar
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Add scroll reveal animations
function addScrollAnimations() {
    const cards = document.querySelectorAll('.post-card, .project-card, .hero, .page-header, .post-header');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });
}

// Mobile menu setup
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const siteNav = document.querySelector('.site-nav');
    
    if (menuToggle && siteNav) {
        menuToggle.addEventListener('click', () => {
            siteNav.classList.toggle('active');
            const isOpen = siteNav.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isOpen);
        });
    }
}

// Add particle effect to hero on mouse move
const hero = document.querySelector('.hero');
if (hero) {
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.borderRadius = '50%';
        particle.style.background = 'linear-gradient(135deg, #6366f1, #ec4899)';
        particle.style.pointerEvents = 'none';
        particle.style.opacity = '0.6';
        particle.style.animation = 'fadeOut 1s ease-out forwards';
        
        hero.style.position = 'relative';
        hero.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    });
}

// Add keyframe animation for particle fade out
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: scale(0);
        }
    }
`;
document.head.appendChild(style);
