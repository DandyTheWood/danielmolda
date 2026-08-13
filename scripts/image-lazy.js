// Lazy-load images that don't declare loading and aren't marked as critical
document.addEventListener('DOMContentLoaded', () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    imgs.forEach(img => {
        // don't override explicitly declared policies
        if (img.hasAttribute('loading')) return;
        // respect fetchpriority or explicit critical images
        if (img.hasAttribute('fetchpriority')) return;
        if (img.id === 'image_animation') return;
        // don't lazy load images inside the loader or hero
        if (img.closest('#loader-overlay')) return;
        try {
            img.setAttribute('loading', 'lazy');
            if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
        } catch (e) {
            // ignore if browser doesn't allow
            console.debug('image-lazy: could not set attrs', e);
        }
    });
});
