/**
 * PARAPOWER - Sidebar Navigation
 * Handles sidebar toggle and navigation
 */

(function() {
    'use strict';

    // Get current page path for active link highlighting
    function getCurrentPath() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page.toLowerCase();
    }

    // Set active nav item based on current page
    function setActiveNavItem() {
        const currentPath = getCurrentPath();
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            
            if (href) {
                const hrefPage = href.split('/').pop().toLowerCase();
                // Check if current page matches nav item
                if (currentPath === hrefPage || 
                    (currentPath === '' && hrefPage === 'index.html') ||
                    (currentPath.includes('level') && href.includes('level.html')) ||
                    (currentPath.includes('judge') && href.includes('judge.html'))) {
                    item.classList.add('active');
                }
            }
        });
    }

    // Toggle sidebar
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const toggle = document.querySelector('.sidebar-toggle');
        const body = document.body;

        if (sidebar && overlay && toggle) {
            const isActive = sidebar.classList.contains('active');
            
            if (isActive) {
                // Close sidebar
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                toggle.classList.remove('active');
                body.classList.remove('sidebar-open');
            } else {
                // Open sidebar
                sidebar.classList.add('active');
                overlay.classList.add('active');
                toggle.classList.add('active');
                body.classList.add('sidebar-open');
            }
        }
    }

    // Close sidebar when clicking overlay
    function closeSidebarOnOverlay() {
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                const toggle = document.querySelector('.sidebar-toggle');
                const body = document.body;

                if (sidebar && toggle) {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                    toggle.classList.remove('active');
                    body.classList.remove('sidebar-open');
                }
            });
        }
    }

    // Close sidebar on escape key
    function closeSidebarOnEscape() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const sidebar = document.getElementById('sidebar');
                if (sidebar && sidebar.classList.contains('active')) {
                    toggleSidebar();
                }
            }
        });
    }

    // Handle external links
    function handleExternalLinks() {
        const externalLinks = document.querySelectorAll('.nav-item.external');
        externalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && (href.startsWith('http') || href.startsWith('//'))) {
                    window.open(href, '_blank');
                    e.preventDefault();
                }
            });
        });
    }

    // Initialize sidebar
    function init() {
        // Set active nav item
        setActiveNavItem();

        // Setup toggle button
        const toggle = document.querySelector('.sidebar-toggle');
        if (toggle) {
            toggle.addEventListener('click', toggleSidebar);
        }

        // Setup overlay click
        closeSidebarOnOverlay();

        // Setup escape key
        closeSidebarOnEscape();

        // Handle external links
        handleExternalLinks();

        // Close sidebar when clicking a nav link (mobile)
        const navItems = document.querySelectorAll('.nav-item:not(.external)');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Only close on mobile
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        toggleSidebar();
                    }, 300);
                }
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

