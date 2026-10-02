// Loader overlay: hide after page load
const LOADER_VISIBLE_MS = 500; // keep the splash brief before revealing the page
let homeEntranceEligible = false;
let homeEntranceFinishListener;
let loaderFadeFinished = false;

window.startHomeEntrance = () => {
    const home = document.getElementById('index');
    const continueEntry = home?.querySelector('.home-continue-entry');
    if (!home || home.hidden || !continueEntry
        || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    if (homeEntranceFinishListener) {
        continueEntry.removeEventListener('animationend', homeEntranceFinishListener);
        continueEntry.removeEventListener('animationcancel', homeEntranceFinishListener);
    }

    document.body.classList.remove('home-entrance');
    void document.body.offsetWidth;

    homeEntranceFinishListener = event => {
        if (event.target === continueEntry && event.animationName === 'fly-in') {
            document.body.classList.remove('home-entrance');
            continueEntry.removeEventListener('animationend', homeEntranceFinishListener);
            continueEntry.removeEventListener('animationcancel', homeEntranceFinishListener);
            homeEntranceFinishListener = undefined;
        }
    };

    continueEntry.addEventListener('animationend', homeEntranceFinishListener);
    continueEntry.addEventListener('animationcancel', homeEntranceFinishListener);
    document.body.classList.add('home-entrance');
};

function finishLoaderFade() {
    if (loaderFadeFinished) return;
    loaderFadeFinished = true;
    const overlay = document.getElementById('loader-overlay');
    if (overlay) overlay.style.display = 'none';
}

function hideLoader() {
    const overlay = document.getElementById('loader-overlay');
    const loader = document.querySelector('.banter-loader');
    if (overlay && !overlay.classList.contains('hidden')) {
        if (homeEntranceEligible) {
            window.startHomeEntrance();
        }
        overlay.classList.add('hidden');
        overlay.addEventListener('transitionend', event => {
            if (event.target === overlay && event.propertyName === 'opacity') {
                finishLoaderFade();
            }
        }, { once: true });
        setTimeout(finishLoaderFade, 500);
    } else if (!overlay) {
        finishLoaderFade();
    }
    if (loader) loader.classList.add('hidden');

    try { console.debug('Loader: hideLoader executed'); } catch (e) { }
}

function scheduleLoaderHide() {
    const home = document.getElementById('index');
    homeEntranceEligible = Boolean(home && !home.hidden);
    // Give a short delay so the splash is visible briefly
    setTimeout(hideLoader, LOADER_VISIBLE_MS);
}

window.addEventListener('load', scheduleLoaderHide);

// If script runs after load, hide immediately
if (document.readyState === 'complete') {
    scheduleLoaderHide();
}

// Fallback: ensure loader is hidden after a max timeout
setTimeout(() => {
    hideLoader();
}, 8000);
