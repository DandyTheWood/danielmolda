// Loader overlay: hide after page load
const LOADER_VISIBLE_MS = 1500; // how long the splash stays visible after load

function hideLoader() {
    const overlay = document.getElementById('loader-overlay');
    const loader = document.querySelector('.banter-loader');
    if (overlay) {
        overlay.classList.add('hidden');
        // remove from layout after transition completes
        overlay.addEventListener('transitionend', () => {
            overlay.style.display = 'none';
        }, { once: true });
    }
    if (loader) loader.classList.add('hidden');
    try { console.debug('Loader: hideLoader executed'); } catch (e) { }
}

window.addEventListener('load', () => {
    // Give a short delay so the splash is visible briefly
    setTimeout(hideLoader, LOADER_VISIBLE_MS);
});

// If script runs after load, hide immediately
if (document.readyState === 'complete') {
    setTimeout(hideLoader, LOADER_VISIBLE_MS);
}

// Fallback: ensure loader is hidden after a max timeout
setTimeout(() => {
    hideLoader();
}, 8000);
