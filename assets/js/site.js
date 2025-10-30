// Modern Blog Interactions

document.addEventListener('DOMContentLoaded', function() {
    createScrollProgress();
    addScrollAnimations();
    setupNavigationToggle();
    initialiseThemeToggle();
    setupBreadcrumbs();
    setupKeyboardNavigation();
    setupHeaderScroll();
    setupArticleReadingProgress();
    setupTOCHighlighting();
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

// Header scroll effect
function setupHeaderScroll() {
    const header = document.querySelector('.global-header');
    if (!header) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });
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

// Enhanced navigation toggle with smooth animations
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
        // Prevent body scroll when nav is open on mobile
        document.body.style.overflow = '';
    }

    function openNav() {
        primaryNav.classList.add(OPEN_CLASS);
        toggle.classList.add(OPEN_CLASS);
        toggle.setAttribute('aria-expanded', 'true');
        // Prevent body scroll when nav is open on mobile
        if (window.innerWidth < 900) {
            document.body.style.overflow = 'hidden';
        }
    }

    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeNav();
        } else {
            openNav();
        }
    });

    // Close nav when clicking outside
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!primaryNav.contains(target) && !toggle.contains(target) && primaryNav.classList.contains(OPEN_CLASS)) {
            closeNav();
        }
    });

    // Close nav on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && primaryNav.classList.contains(OPEN_CLASS)) {
            closeNav();
            toggle.focus();
        }
    });

    // Close nav on window resize if it becomes desktop size
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 900 && primaryNav.classList.contains(OPEN_CLASS)) {
            closeNav();
        }
    });
}

// Keyboard navigation enhancements
function setupKeyboardNavigation() {
    const navLinks = document.querySelectorAll('.primary-nav__link');
    
    navLinks.forEach((link, index) => {
        // Arrow key navigation
        link.addEventListener('keydown', (e) => {
            let target;
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                target = navLinks[index + 1] || navLinks[0];
                target.focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                target = navLinks[index - 1] || navLinks[navLinks.length - 1];
                target.focus();
            } else if (e.key === 'Home') {
                e.preventDefault();
                navLinks[0].focus();
            } else if (e.key === 'End') {
                e.preventDefault();
                navLinks[navLinks.length - 1].focus();
            }
        });
    });

    // Skip link enhancement
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('site-main');
            if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => target.removeAttribute('tabindex'), 1000);
            }
        });
    }
}

// Breadcrumb navigation setup
function setupBreadcrumbs() {
    const breadcrumbs = document.querySelectorAll('.breadcrumb__link');
    breadcrumbs.forEach((link, index) => {
        link.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const next = breadcrumbs[index + 1];
                if (next) next.focus();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prev = breadcrumbs[index - 1];
                if (prev) prev.focus();
            }
        });
    });
}

// Enhanced theme toggle with persistence
function initialiseThemeToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) {
        return;
    }

    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('theme-dark');
        toggle.setAttribute('aria-pressed', 'true');
    } else {
        document.documentElement.classList.remove('theme-dark');
        toggle.setAttribute('aria-pressed', 'false');
    }

    toggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('theme-dark');
        if (isDark) {
            document.documentElement.classList.remove('theme-dark');
            localStorage.setItem('theme', 'light');
            toggle.setAttribute('aria-pressed', 'false');
        } else {
            document.documentElement.classList.add('theme-dark');
            localStorage.setItem('theme', 'dark');
            toggle.setAttribute('aria-pressed', 'true');
        }
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.documentElement.classList.add('theme-dark');
                toggle.setAttribute('aria-pressed', 'true');
            } else {
                document.documentElement.classList.remove('theme-dark');
                toggle.setAttribute('aria-pressed', 'false');
            }
        }
    });
}

// Article reading progress
function setupArticleReadingProgress() {
    const article = document.querySelector('.article__content');
    if (!article) return;

    const progressBar = document.createElement('div');
    progressBar.className = 'article-reading-progress';
    progressBar.innerHTML = '<div class="article-reading-progress__bar"></div>';
    document.body.insertBefore(progressBar, document.body.firstChild);

    const bar = progressBar.querySelector('.article-reading-progress__bar');
    const articleTop = article.offsetTop;
    const articleHeight = article.offsetHeight;

    function updateProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const articleBottom = articleTop + articleHeight;
        
        if (scrollTop + windowHeight > articleTop && scrollTop < articleBottom) {
            progressBar.classList.add('is-active');
            const scrollProgress = ((scrollTop + windowHeight - articleTop) / articleHeight) * 100;
            bar.style.width = Math.min(100, Math.max(0, scrollProgress)) + '%';
        } else {
            progressBar.classList.remove('is-active');
        }
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
}

// TOC highlighting for active sections
function setupTOCHighlighting() {
    const tocLinks = document.querySelectorAll('.article-toc__body a');
    const headings = document.querySelectorAll('.article__content h2, .article__content h3, .article__content h4');
    
    if (tocLinks.length === 0 || headings.length === 0) return;

    const observerOptions = {
        rootMargin: '-20% 0% -70% 0%',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id || entry.target.getAttribute('id');
                if (id) {
                    tocLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                            // Scroll TOC link into view if needed
                            link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    });
                }
            }
        });
    }, observerOptions);

    headings.forEach(heading => {
        observer.observe(heading);
    });
}
