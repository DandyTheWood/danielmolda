document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.dropdown');
    const button = dropdown?.querySelector('.dropdown-button');
    const content = dropdown?.querySelector('.dropdown-content');

    if (!dropdown || !button || !content) return;

    if (!content.id) content.id = 'main-dropdown-content';
    button.setAttribute('aria-controls', content.id);
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');

    const nestedMenus = Array.from(dropdown.querySelectorAll('.nested-dropdown'));

    function setNestedMenuOpen(menu, isOpen) {
        const toggle = menu.querySelector(':scope > a');
        menu.classList.toggle('open', isOpen);
        toggle?.setAttribute('aria-expanded', String(isOpen));
    }

    function closeMenus() {
        dropdown.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
        nestedMenus.forEach(menu => setNestedMenuOpen(menu, false));
    }

    function openDropdown() {
        dropdown.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        content.querySelector('a')?.focus();
    }

    button.addEventListener('click', () => {
        if (dropdown.classList.contains('open')) {
            closeMenus();
        } else {
            openDropdown();
        }
    });

    button.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' && !dropdown.classList.contains('open')) {
            event.preventDefault();
            openDropdown();
        }
    });

    nestedMenus.forEach((menu, index) => {
        const toggle = menu.querySelector(':scope > a');
        const submenu = menu.querySelector(':scope > .nested-dropdown-content');
        if (!toggle || !submenu) return;

        if (!submenu.id) submenu.id = `main-dropdown-submenu-${index + 1}`;
        toggle.setAttribute('aria-controls', submenu.id);
        toggle.setAttribute('aria-haspopup', 'true');
        toggle.setAttribute('aria-expanded', 'false');

        toggle.addEventListener('click', event => {
            event.preventDefault();
            const willOpen = !menu.classList.contains('open');
            nestedMenus.forEach(sibling => setNestedMenuOpen(sibling, sibling === menu && willOpen));

            if (willOpen) submenu.querySelector('a')?.focus();
        });

        toggle.addEventListener('keydown', event => {
            if (event.key === 'ArrowRight' || event.key === ' ') {
                event.preventDefault();
                toggle.click();
            }
        });
    });

    dropdown.querySelectorAll('.dropdown-content a').forEach(link => {
        if (link.parentElement?.classList.contains('nested-dropdown')) return;
        link.addEventListener('click', closeMenus);
    });

    document.addEventListener('click', event => {
        if (!dropdown.contains(event.target)) closeMenus();
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && dropdown.classList.contains('open')) {
            closeMenus();
            button.focus();
        }
    });
});
