// Gallery lightbox functionality
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxText = document.querySelector('.lightbox-text');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    const galleryLinks = document.querySelectorAll('.gallery-link');

    let currentIndex = 0;
    const imageUrls = Array.from(galleryLinks).map(link => link.getAttribute('href'));
    const imageAltTexts = Array.from(galleryLinks).map(link => link.querySelector('img')?.getAttribute('alt') || '');

    function openLightbox(index) {
        if (!imageUrls.length) return;
        currentIndex = Math.max(0, Math.min(index, imageUrls.length - 1));
        lightboxImage.src = imageUrls[currentIndex];
        if (lightboxText) lightboxText.textContent = imageAltTexts[currentIndex];
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
        lightboxImage.src = imageUrls[currentIndex];
        if (lightboxText) lightboxText.textContent = imageAltTexts[currentIndex];
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % imageUrls.length;
        lightboxImage.src = imageUrls[currentIndex];
        if (lightboxText) lightboxText.textContent = imageAltTexts[currentIndex];
    }

    galleryLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => { e.preventDefault(); openLightbox(index); });
    });

    closeBtn?.addEventListener('click', closeLightbox);
    prevBtn?.addEventListener('click', showPrev);
    nextBtn?.addEventListener('click', showNext);

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });

    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
});
