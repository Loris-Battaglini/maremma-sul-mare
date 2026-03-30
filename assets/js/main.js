(() => {
  const nav = document.querySelector("#primary-nav");
  const menuToggle = document.querySelector(".menu-toggle");

  const closeMenu = () => {
    if (!nav || !menuToggle) {
      return;
    }

    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  if (nav && menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    const sectionLinks = nav.querySelectorAll('a[href^="#"]');
    sectionLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  let activeSlideIndex = 0;
  let sliderTimerId;

  const setActiveSlide = (targetIndex) => {
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === targetIndex);
    });
  };

  const nextSlide = () => {
    activeSlideIndex = (activeSlideIndex + 1) % slides.length;
    setActiveSlide(activeSlideIndex);
  };

  const startSlider = () => {
    if (slides.length < 2 || sliderTimerId) {
      return;
    }

    sliderTimerId = window.setInterval(nextSlide, 7000);
  };

  const stopSlider = () => {
    if (!sliderTimerId) {
      return;
    }

    window.clearInterval(sliderTimerId);
    sliderTimerId = undefined;
  };

  if (slides.length > 0) {
    setActiveSlide(0);
    startSlider();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopSlider();
        return;
      }

      startSlider();
    });
  }

  const yearNode = document.querySelector("#year");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
})();
