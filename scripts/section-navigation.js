document.addEventListener('DOMContentLoaded', () => {
    const sections = Array.from(document.querySelectorAll('main > section.main'));
    const navigationLinks = document.querySelectorAll('.desktop-navigation a[href^="#"]');
    const dropdown = document.querySelector('.dropdown');
    const dropdownButton = document.querySelector('.dropdown-button');

    if (!sections.length) return;

    function sectionForTarget(targetId) {
        const target = document.getElementById(targetId);
        return target?.closest('main > section.main') || null;
    }

    function scrollProjectToTop(project) {
        const heading = project.querySelector(':scope > h1');
        const navigation = document.querySelector('nav');
        if (!heading) return;

        window.requestAnimationFrame(() => {
            const top = heading.getBoundingClientRect().top + window.scrollY
                - (navigation?.getBoundingClientRect().height || 0)
                - 16;
            window.scrollTo({
                top: Math.max(0, top),
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
            });
        });
    }

    function setProjectExpanded(project, expanded) {
        const details = project?.querySelector('.project-details');
        const button = project?.querySelector('.project-read-more');
        if (!details || !button || project.classList.contains('is-expanded') === expanded) return;

        const currentHeight = details.getBoundingClientRect().height;
        const previewHeight = Number.parseFloat(
            getComputedStyle(details).getPropertyValue('--project-preview-height')
        );
        details.style.maxHeight = `${currentHeight}px`;
        details.offsetHeight;
        project.classList.toggle('is-expanded', expanded);
        details.style.maxHeight = `${expanded ? details.scrollHeight : previewHeight}px`;
        details.inert = !expanded;
        button.setAttribute('aria-expanded', String(expanded));
        button.setAttribute(
            'aria-label',
            `${expanded ? 'Read less' : 'Read more'} about ${project.querySelector(':scope > h1').textContent.trim()}`
        );

        if (!expanded) scrollProjectToTop(project);

        window.clearTimeout(details.transitionCleanup);
        details.transitionCleanup = window.setTimeout(() => {
            details.style.maxHeight = '';
        }, 1000);
    }

    function expandProjectForTarget(targetId) {
        const target = document.getElementById(targetId);
        const project = target?.closest('#it_stuff > .d3');
        if (project?.classList.contains('project-card')) {
            setProjectExpanded(project, true);
        }
    }

    function setGalleryExpanded(card, expanded) {
        const details = card?.querySelector('.gallery-details');
        const button = card?.querySelector('.gallery-read-more');
        const heading = card?.querySelector(':scope > h2');
        if (!details || !button || !heading || card.classList.contains('is-expanded') === expanded) return;

        const currentHeight = details.getBoundingClientRect().height;
        const previewHeight = Number.parseFloat(
            getComputedStyle(details).getPropertyValue('--gallery-preview-height')
        );
        details.style.maxHeight = `${currentHeight}px`;
        details.offsetHeight;
        card.classList.toggle('is-expanded', expanded);
        details.style.maxHeight = `${expanded ? details.scrollHeight : previewHeight}px`;
        details.inert = !expanded;
        button.setAttribute('aria-expanded', String(expanded));
        button.setAttribute(
            'aria-label',
            `${expanded ? 'Show less of' : 'Show more of'} ${heading.textContent.trim()}`
        );

        if (!expanded) {
            window.requestAnimationFrame(() => {
                const navigation = document.querySelector('nav');
                const top = card.getBoundingClientRect().top + window.scrollY
                    - (navigation?.getBoundingClientRect().height || 0)
                    - 16;
                window.scrollTo({
                    top: Math.max(0, top),
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
                });
            });
        }

        window.clearTimeout(details.transitionCleanup);
        details.transitionCleanup = window.setTimeout(() => {
            details.style.maxHeight = '';
        }, 1000);
    }

    function expandGalleryForTarget(targetId) {
        const target = document.getElementById(targetId);
        const card = target?.closest('#photography .gallery-section');
        if (card) setGalleryExpanded(card, true);
    }

    function initializeGalleryCards() {
        document.querySelectorAll('#photography .gallery-section').forEach((card, index) => {
            const heading = card.querySelector(':scope > h2');
            const details = card.querySelector(':scope > .gallery-details');
            if (!heading || !details) return;

            details.id = `gallery-details-${heading.id || index + 1}`;
            details.inert = true;

            const button = document.createElement('button');
            button.className = 'project-read-more gallery-read-more';
            button.type = 'button';
            button.setAttribute('aria-controls', details.id);
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('aria-label', `Show more of ${heading.textContent.trim()}`);

            const arrow = document.createElement('span');
            arrow.className = 'project-arrow';
            arrow.setAttribute('aria-hidden', 'true');
            button.append(arrow);
            details.after(button);

            button.addEventListener('click', () => {
                setGalleryExpanded(card, button.getAttribute('aria-expanded') !== 'true');
            });

            details.addEventListener('transitionend', event => {
                if (event.target === details && event.propertyName === 'max-height') {
                    window.clearTimeout(details.transitionCleanup);
                    details.style.maxHeight = '';
                }
            });
        });
    }

    function initializeGalleryMasonry() {
        const grids = document.querySelectorAll('#photography .gallery-grid');

        function updateItemSize(image) {
            const item = image.closest('.gallery-link');
            const grid = item?.closest('.gallery-grid');
            if (!item || !grid) return;

            const itemHeight = item.getBoundingClientRect().height;
            if (!itemHeight) return;

            const styles = getComputedStyle(grid);
            const rowHeight = Number.parseFloat(styles.gridAutoRows);
            const itemGap = Number.parseFloat(styles.columnGap);
            if (!rowHeight) return;

            const rowSpan = Math.ceil((itemHeight + itemGap) / rowHeight);
            const rowEnd = `span ${rowSpan}`;
            if (item.style.gridRowEnd !== rowEnd) {
                item.style.gridRowEnd = rowEnd;
            }
        }

        grids.forEach(grid => {
            const images = grid.querySelectorAll('img');
            images.forEach(image => {
                image.addEventListener('load', () => updateItemSize(image));
                if (image.complete) updateItemSize(image);

                if ('ResizeObserver' in window) {
                    const observer = new ResizeObserver(() => updateItemSize(image));
                    observer.observe(image);
                }
            });
        });

        window.addEventListener('resize', () => {
            grids.forEach(grid => grid.querySelectorAll('img').forEach(updateItemSize));
        }, { passive: true });
    }

    function updateActiveNavigationIndicator() {
        const activeLink = document.querySelector('.desktop-navigation a[aria-current="page"]');
        const desktopNavigation = document.querySelector('.desktop-navigation');
        if (!activeLink || !desktopNavigation) return;

        desktopNavigation.style.setProperty('--active-link-width', `${activeLink.offsetWidth}px`);
        desktopNavigation.style.setProperty('--active-link-offset', `${activeLink.offsetLeft}px`);
    }

    function initializeProjectCards() {
        const projects = document.querySelectorAll('#it_stuff > .d3[id]');

        projects.forEach(project => {
            if (project.classList.contains('project-card')) return;

            const heading = project.querySelector(':scope > h1');
            const introduction = project.querySelector(':scope > p');
            if (!heading || !introduction) return;

            const content = document.createElement('div');
            const details = document.createElement('div');
            const button = document.createElement('button');

            content.className = 'project-content';
            details.className = 'project-details';
            details.id = `project-details-${project.id}`;
            details.inert = true;

            button.className = 'project-read-more';
            button.type = 'button';
            button.setAttribute('aria-controls', details.id);
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('aria-label', `Read more about ${heading.textContent.trim()}`);
            const arrow = document.createElement('span');
            arrow.className = 'project-arrow';
            arrow.setAttribute('aria-hidden', 'true');
            button.append(arrow);

            Array.from(project.children).forEach(child => {
                if (child !== heading) content.append(child);
            });

            details.append(content);
            heading.after(details, button);
            project.classList.add('project-card');
            button.addEventListener('click', () => {
                setProjectExpanded(project, button.getAttribute('aria-expanded') !== 'true');
            });

            details.addEventListener('transitionend', event => {
                if (event.target === details && event.propertyName === 'max-height') {
                    window.clearTimeout(details.transitionCleanup);
                    details.style.maxHeight = '';
                }
            });
        });
    }

    function activateSection(section, targetId = section.id, updateHistory = false) {
        sections.forEach(page => {
            const isActive = page === section;
            page.hidden = !isActive;
            page.setAttribute('aria-hidden', String(!isActive));
        });

        navigationLinks.forEach(link => {
            if (link.hash === `#${section.id}`) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        updateActiveNavigationIndicator();

        if (updateHistory && window.location.hash !== `#${targetId}`) {
            window.history.pushState(null, '', `#${targetId}`);
        }

        window.requestAnimationFrame(() => {
            const target = document.getElementById(targetId);
            if (target && target !== section) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    function syncWithLocation() {
        const targetId = window.location.hash.slice(1);
        const section = (targetId && sectionForTarget(targetId)) || sections[0];
        expandProjectForTarget(targetId);
        expandGalleryForTarget(targetId);
        activateSection(section, targetId || section.id);
    }

    document.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.hash.slice(1);
        const section = sectionForTarget(targetId);
        if (!section) return;

        event.preventDefault();

        const nestedMenu = link.closest('.nested-dropdown');
        if (nestedMenu && link.parentElement === nestedMenu) {
            link.setAttribute('aria-expanded', String(nestedMenu.classList.contains('open')));
        }

        expandProjectForTarget(targetId);
        expandGalleryForTarget(targetId);
        activateSection(section, targetId, true);
        if (section.id === 'index') {
            window.startHomeEntrance?.();
        }

        if (dropdown && dropdown.contains(link) && !(nestedMenu && link.parentElement === nestedMenu)) {
            dropdown.classList.remove('open');
            dropdownButton?.setAttribute('aria-expanded', 'false');
        }
    });

    document.querySelectorAll('.nested-dropdown > a').forEach(link => {
        link.setAttribute('aria-expanded', 'false');
    });

    window.addEventListener('popstate', syncWithLocation);
    window.addEventListener('hashchange', syncWithLocation);
    window.addEventListener('resize', updateActiveNavigationIndicator);
    const desktopNavigation = document.querySelector('.desktop-navigation');
    if (desktopNavigation && 'ResizeObserver' in window) {
        new ResizeObserver(updateActiveNavigationIndicator).observe(desktopNavigation);
    }
    document.fonts?.ready.then(updateActiveNavigationIndicator);
    initializeGalleryMasonry();
    initializeGalleryCards();
    initializeProjectCards();
    syncWithLocation();
});
