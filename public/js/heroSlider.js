document.addEventListener('DOMContentLoaded', () => {
  const sliderInner = document.getElementById('sliderInner');
  if (!sliderInner) {
    console.warn("Hero slider container not found (sliderInner is null).");
    return;
  }

  const slides = sliderInner.children;
  console.log("Number of slides found:", slides.length);

  if (slides.length === 0) {
    console.warn("No slides inside sliderInner. Falling back to default image.");
  } else {
    Array.from(slides).forEach((slide, idx) => {
      const img = slide.querySelector('img');
      console.log(`Slide ${idx} src:`, img ? img.src : "No img found");
    });
  }

  let currentIndex = 0;

  function showSlide(index) {
    sliderInner.style.transform = `translateX(-${index * 100}%)`;
    console.log("Showing slide index:", index);
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
