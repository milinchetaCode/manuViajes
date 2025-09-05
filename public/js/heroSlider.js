document.addEventListener('DOMContentLoaded', () => {
  const sliderInner = document.getElementById('sliderInner');
  if (!sliderInner) return;

  const slides = sliderInner.children;
  let currentIndex = 0;

  function showSlide(index) {
    sliderInner.style.transform = `translateX(-${index * 100}%)`;
  }

  document.getElementById('prevSlide')?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
  });

  document.getElementById('nextSlide')?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  });

  if (slides.length > 1) {
    setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }, 5000);
  }

  if (window.feather) feather.replace();
});
