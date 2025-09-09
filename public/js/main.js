// main.js

// -------------------------
// Feather icons initialization
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (typeof feather !== 'undefined') {
    feather.replace();
  }

  // -------------------------
  // Hero lightbox functionality
  // -------------------------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');

  document.querySelectorAll('.hero-img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightbox.classList.remove('hidden');
    });
  });

  window.closeLightbox = () => {
    lightbox.classList.add('hidden');
  };

  lightbox.addEventListener('click', e => {
    if (e.target.id === 'lightbox') {
      window.closeLightbox();
    }
  });

  // -------------------------
  // Hero slider functionality (if you are using it)
  // -------------------------
  const sliderInner = document.getElementById('sliderInner');
  const slides = sliderInner ? sliderInner.children : [];
  let currentIndex = 0;

  const showSlide = index => {
    if (!sliderInner) return;
    sliderInner.style.transform = `translateX(-${index * 100}%)`;
  };

  const nextSlideBtn = document.getElementById('nextSlide');
  const prevSlideBtn = document.getElementById('prevSlide');

  if (nextSlideBtn) {
    nextSlideBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    });
  }

  if (prevSlideBtn) {
    prevSlideBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    });
  }

  // Optional: auto-slide every 5 seconds
  if (slides.length > 1) {
    setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }, 5000);
  }
});
