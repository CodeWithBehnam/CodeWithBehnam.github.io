// Modern Blog Interactions

document.addEventListener('DOMContentLoaded', function() {
    createScrollProgress();
    addScrollAnimations();
    setupNavigationToggle();
    initialiseThemeToggle();
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
    const cards = document.querySelectorAll('.post-card, .project-card, .home-hero, .page__header, .article__header');
    
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

// Navigation toggle
function setupNavigationToggle() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const primaryNav = document.getElementById('primary-nav');

    if (!toggle || !primaryNav) {
        return;
    }

    const OPEN_CLASS = 'is-open';

    function closeNav() {
        primaryNav.classList.remove(OPEN_CLASS);
        toggle.classList.remove(OPEN_CLASS);
        toggle.setAttribute('aria-expanded', 'false');
    }

    function openNav() {
        primaryNav.classList.add(OPEN_CLASS);
        toggle.classList.add(OPEN_CLASS);
        toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeNav();
        } else {
            openNav();
        }
    });

    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!primaryNav.contains(target) && !toggle.contains(target)) {
            closeNav();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeNav();
            toggle.focus();
        }
    });
}

// Theme toggle stub
function initialiseThemeToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) {
        return;
    }

    toggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('theme-dark');
        toggle.setAttribute('aria-pressed', document.documentElement.classList.contains('theme-dark'));
    });
}

// Respect reduced motion preference for scroll reveals
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const animatedElements = document.querySelectorAll('.post-card, .project-card, .home-hero, .page__header, .article__header');
    animatedElements.forEach((element) => {
        element.style.opacity = '1';
        element.style.transform = 'none';
    });
}
