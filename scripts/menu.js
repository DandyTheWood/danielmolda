// Menu toggle script
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.dropdown');
    const dropdownButton = document.querySelector('.dropdown-button');

    if (!dropdown || !dropdownButton) return;

    // ensure ARIA attributes
    dropdownButton.setAttribute('aria-haspopup', 'true');
    dropdownButton.setAttribute('aria-expanded', 'false');
    const content = dropdown.querySelector('.dropdown-content');
    if (content && !content.id) content.id = 'main-dropdown-content';
    if (content) dropdownButton.setAttribute('aria-controls', content.id);

    // ensure menus start closed (in case of stale classes)
    document.querySelectorAll('.dropdown, .nested-dropdown').forEach(el => el.classList.remove('open'));
    const mobileMenuInit = document.querySelector('.menu');
    if (mobileMenuInit) mobileMenuInit.classList.remove('showMenu');

    function closeAll() {
        document.querySelectorAll('.dropdown.open, .nested-dropdown.open').forEach(el => el.classList.remove('open'));
        dropdownButton.setAttribute('aria-expanded', 'false');
    }

    dropdownButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        dropdownButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        // focus first link when opened
        if (isOpen) {
            const first = dropdown.querySelector('.dropdown-content a');
            if (first) first.focus();
        }
    });

    // close dropdown when a link inside it is clicked (so state doesn't persist)
    // but avoid closing when clicking the parent toggles for nested-dropdowns
    dropdown.querySelectorAll('.dropdown-content a').forEach(a => {
        a.addEventListener('click', (e) => {
            // if this anchor is the toggle element for a nested dropdown (direct child of .nested-dropdown), don't close
            if (a.parentElement && a.parentElement.classList.contains('nested-dropdown')) {
                return;
            }
            closeAll();
        });
    });

    // keyboard support on the button: open with ArrowDown
    dropdownButton.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!dropdown.classList.contains('open')) {
                dropdown.classList.add('open');
                dropdownButton.setAttribute('aria-expanded', 'true');
                const first = dropdown.querySelector('.dropdown-content a');
                if (first) first.focus();
            }
        }
    });

    // handle nested dropdown toggles
    document.querySelectorAll('.nested-dropdown > a').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            // prevent following the anchor
            e.preventDefault();
            const parent = anchor.closest('.nested-dropdown');
            if (!parent) return;
            const nowOpen = parent.classList.toggle('open');
            // close sibling nested-dropdowns
            parent.parentElement.querySelectorAll('.nested-dropdown').forEach(sib => {
                if (sib !== parent) sib.classList.remove('open');
            });
            // focus first link inside nested
            if (nowOpen) {
                const first = parent.querySelector('.nested-dropdown-content a');
                if (first) first.focus();
            }
        });
        // make nested dropdowns keyboard accessible
        anchor.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                anchor.click();
            }
        });
    });

    // close when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) closeAll();
    });

    // close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAll();
    });

    /* Mobile hamburger full-screen menu (from tutorial) */
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.menu');
    if (hamburger && mobileMenu) {
        const menuItems = mobileMenu.querySelectorAll('.menuItem');

        function toggleMobileMenu() {
            if (mobileMenu.classList.contains('showMenu')) {
                mobileMenu.classList.remove('showMenu');
                hamburger.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('no-scroll');
            } else {
                // close any desktop dropdowns first
                closeAll();
                mobileMenu.classList.add('showMenu');
                hamburger.setAttribute('aria-expanded', 'true');
                mobileMenu.setAttribute('aria-hidden', 'false');
                document.body.classList.add('no-scroll');
            }
        }

        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        });

        // close when clicking a menu item
        menuItems.forEach(mi => mi.addEventListener('click', () => toggleMobileMenu()));

        // close on escape when mobile menu open
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('showMenu')) toggleMobileMenu();
        });

        // clicking outside the menu should close it
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target) && mobileMenu.classList.contains('showMenu')) {
                toggleMobileMenu();
            }
        });

        // close mobile menu if the window is resized above mobile breakpoint
        window.addEventListener('resize', () => {
            if (window.innerWidth > 800 && mobileMenu.classList.contains('showMenu')) {
                toggleMobileMenu();
            }
        });
    }

        // Scrollspy removed — menu remains JS-click controlled without auto-glow
});
