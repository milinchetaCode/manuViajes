// main.js
document.addEventListener('DOMContentLoaded', () => {
  // --- Feather Icons ---
  if (typeof feather !== 'undefined') {
    feather.replace();
  }

  // --- Hero Slider ---
  const sliderInner = document.getElementById('sliderInner');
  const heroSlider = document.getElementById('heroSlider');
  const prevSlide = document.getElementById('prevSlide');
  const nextSlide = document.getElementById('nextSlide');

  if (sliderInner && heroSlider && prevSlide && nextSlide) {
    let currentIndex = 0;
    const slides = sliderInner.children;
    const totalSlides = slides.length;
    let autoSlideInterval;

    const updateSlider = () => {
      sliderInner.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    const startAutoSlide = () => {
      autoSlideInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
      }, 5000); // 5 seconds
    };

    const stopAutoSlide = () => {
      clearInterval(autoSlideInterval);
    };

    // Start auto slide
    startAutoSlide();

    // Pause auto-slide on hover
    heroSlider.addEventListener('mouseenter', stopAutoSlide);
    heroSlider.addEventListener('mouseleave', startAutoSlide);

    // Manual navigation
    prevSlide.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateSlider();
    });

    nextSlide.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateSlider();
    });
  }

  // --- Lightbox ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');

  if (lightbox && lightboxImg) {
    const heroImages = document.querySelectorAll('.hero-img');
    heroImages.forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightbox.classList.remove('hidden');
      });
    });

    // Close button
    window.closeLightbox = () => lightbox.classList.add('hidden');

    // Click outside image to close
    lightbox.addEventListener('click', e => {
      if (e.target.id === 'lightbox') window.closeLightbox();
    });
  }

  // --- Continent Filter Chips ---
  const chips = document.querySelectorAll('#continent-filters .chip');
  const cards = document.querySelectorAll('#packages-grid .card');

  chips.forEach(chip => {
    chip.addEventListener('click', function() {
      // Update active state
      chips.forEach(c => c.classList.remove('active'));
      this.classList.add('active');

      // Filter cards
      const continent = this.dataset.continent;
      cards.forEach(card => {
        if (continent === 'all' || card.dataset.continent === continent) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});
