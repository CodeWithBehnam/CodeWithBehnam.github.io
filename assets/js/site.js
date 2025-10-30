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
    setupSocialSharing();
    setupSearch();
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

// Social sharing functionality
function setupSocialSharing() {
    // Copy link functionality
    const copyButtons = document.querySelectorAll('[data-share-url]');
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const url = button.getAttribute('data-share-url');
            try {
                await navigator.clipboard.writeText(url);
                button.classList.add('copied');
                setTimeout(() => {
                    button.classList.remove('copied');
                }, 2000);
            } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = url;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    button.classList.add('copied');
                    setTimeout(() => {
                        button.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
                document.body.removeChild(textArea);
            }
        });
    });

    // Native share API
    const nativeShareButtons = document.querySelectorAll('[data-share-title]');
    nativeShareButtons.forEach(button => {
        if (navigator.share) {
            button.style.display = 'block';
            button.addEventListener('click', async () => {
                try {
                    await navigator.share({
                        title: button.getAttribute('data-share-title'),
                        url: button.getAttribute('data-share-url'),
                        text: button.getAttribute('data-share-text') || ''
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error('Error sharing:', err);
                    }
                }
            });
        } else {
            button.style.display = 'none';
        }
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

// Search functionality
function setupSearch() {
    const searchModal = document.getElementById('search-modal');
    const searchTrigger = document.querySelector('[data-search-trigger]');
    const searchClose = document.querySelectorAll('[data-search-close]');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchEmpty = document.getElementById('search-empty');
    
    if (!searchModal || !searchTrigger || !searchInput) return;

    // Get search index
    const searchIndexElement = document.getElementById('search-index');
    if (!searchIndexElement) return;
    
    let searchIndex = [];
    try {
        searchIndex = JSON.parse(searchIndexElement.textContent);
    } catch (err) {
        console.error('Failed to parse search index:', err);
        return;
    }

    let selectedIndex = -1;
    let currentResults = [];

    // Open search modal
    function openSearch() {
        searchModal.classList.add('is-open');
        searchModal.setAttribute('aria-hidden', 'false');
        searchInput.focus();
        document.body.style.overflow = 'hidden';
    }

    // Close search modal
    function closeSearch() {
        searchModal.classList.remove('is-open');
        searchModal.setAttribute('aria-hidden', 'true');
        searchInput.value = '';
        searchResults.innerHTML = '';
        searchEmpty.style.display = 'none';
        selectedIndex = -1;
        document.body.style.overflow = '';
    }

    // Highlight search terms in text
    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Perform search
    function performSearch(query) {
        if (!query || query.length < 2) {
            searchResults.innerHTML = '';
            searchEmpty.style.display = 'none';
            return;
        }

        const queryLower = query.toLowerCase();
        const terms = queryLower.split(/\s+/).filter(term => term.length > 0);
        
        currentResults = searchIndex
            .map(post => {
                let score = 0;
                const titleLower = post.title.toLowerCase();
                const excerptLower = (post.excerpt || '').toLowerCase();
                const contentLower = (post.content || '').toLowerCase();
                const tagsLower = (post.tags || []).join(' ').toLowerCase();
                const categoriesLower = (post.categories || []).join(' ').toLowerCase();

                terms.forEach(term => {
                    // Title matches get highest score
                    if (titleLower.includes(term)) score += 10;
                    // Exact title match gets bonus
                    if (titleLower === term) score += 5;
                    
                    // Tags and categories
                    if (tagsLower.includes(term)) score += 5;
                    if (categoriesLower.includes(term)) score += 5;
                    
                    // Excerpt matches
                    if (excerptLower.includes(term)) score += 3;
                    
                    // Content matches
                    if (contentLower.includes(term)) score += 1;
                });

                return { post, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(item => item.post);

        displayResults(currentResults, query);
    }

    // Display search results
    function displayResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = '';
            searchEmpty.style.display = 'block';
            return;
        }

        searchEmpty.style.display = 'none';
        searchResults.innerHTML = results.map((post, index) => {
            const title = highlightText(post.title, query);
            const excerpt = highlightText(post.excerpt || '', query);
            const date = new Date(post.date).toLocaleDateString('en-GB', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            return `
                <a href="${post.url}" class="search-result" role="option" data-index="${index}" aria-selected="false">
                    <h3 class="search-result__title">${title}</h3>
                    <div class="search-result__meta">
                        <time>${date}</time>
                        ${post.categories && post.categories.length > 0 ? `<span>• ${post.categories[0]}</span>` : ''}
                    </div>
                    <p class="search-result__excerpt">${excerpt}</p>
                    ${post.tags && post.tags.length > 0 ? `
                        <div class="search-result__tags">
                            ${post.tags.slice(0, 3).map(tag => `<span>${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </a>
            `;
        }).join('');

        // Reset selection
        selectedIndex = -1;
        updateSelection();
    }

    // Update selected result
    function updateSelection() {
        const resultElements = searchResults.querySelectorAll('.search-result');
        resultElements.forEach((el, index) => {
            if (index === selectedIndex) {
                el.classList.add('is-selected');
                el.setAttribute('aria-selected', 'true');
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                el.classList.remove('is-selected');
                el.setAttribute('aria-selected', 'false');
            }
        });
    }

    // Navigate results with keyboard
    function navigateResults(direction) {
        const resultElements = searchResults.querySelectorAll('.search-result');
        if (resultElements.length === 0) return;

        if (direction === 'down') {
            selectedIndex = (selectedIndex + 1) % resultElements.length;
        } else if (direction === 'up') {
            selectedIndex = selectedIndex <= 0 ? resultElements.length - 1 : selectedIndex - 1;
        }

        updateSelection();
    }

    // Select current result
    function selectResult() {
        if (selectedIndex >= 0 && currentResults[selectedIndex]) {
            window.location.href = currentResults[selectedIndex].url;
        } else if (currentResults.length > 0) {
            window.location.href = currentResults[0].url;
        }
    }

    // Event listeners
    searchTrigger.addEventListener('click', openSearch);

    searchClose.forEach(btn => {
        btn.addEventListener('click', closeSearch);
    });

    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateResults('down');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateResults('up');
        } else if (e.key === 'Enter') {
            e.preventDefault();
            selectResult();
        } else if (e.key === 'Escape') {
            closeSearch();
        }
    });

    // Keyboard shortcut (Cmd/Ctrl + K)
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
    });

    // Close on overlay click
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal || e.target.classList.contains('search-modal__overlay')) {
            closeSearch();
        }
    });

    // Track search analytics (optional)
    searchResults.addEventListener('click', (e) => {
        const result = e.target.closest('.search-result');
        if (result) {
            const index = parseInt(result.getAttribute('data-index'));
            // You can add analytics tracking here
            // console.log('Search result clicked:', currentResults[index]?.title);
        }
    });
}
