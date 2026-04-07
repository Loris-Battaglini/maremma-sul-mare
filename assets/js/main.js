(() => {
  document.body.classList.add("js-ready");

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

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 760) {
        closeMenu();
      }
    });
  }

  const frames = Array.from(document.querySelectorAll(".hero-frame"));
  let frameIndex = 0;
  let frameTimer;

  const setFrame = (index) => {
    frames.forEach((frame, currentIndex) => {
      frame.classList.toggle("is-active", currentIndex === index);
    });
  };

  const runFrameLoop = () => {
    if (frames.length < 2 || frameTimer) {
      return;
    }

    frameTimer = window.setInterval(() => {
      frameIndex = (frameIndex + 1) % frames.length;
      setFrame(frameIndex);
    }, 6200);
  };

  const stopFrameLoop = () => {
    if (!frameTimer) {
      return;
    }

    window.clearInterval(frameTimer);
    frameTimer = undefined;
  };

  if (frames.length > 0) {
    setFrame(0);
    runFrameLoop();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopFrameLoop();
        return;
      }

      runFrameLoop();
    });
  }

  const revealNodes = Array.from(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && revealNodes.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  const yearNode = document.querySelector("#year");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  const bookingForm = document.querySelector("#booking-form");
  if (!bookingForm) {
    return;
  }

  const arrivalInput = bookingForm.querySelector("#arrival-date");
  const departureInput = bookingForm.querySelector("#departure-date");
  const hintNode = bookingForm.querySelector(".form-hint");

  const today = new Date();
  const todayAsISO = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  if (arrivalInput && departureInput) {
    arrivalInput.min = todayAsISO;
    departureInput.min = todayAsISO;

    arrivalInput.addEventListener("change", () => {
      if (!arrivalInput.value) {
        return;
      }

      departureInput.min = arrivalInput.value;
      if (departureInput.value && departureInput.value < arrivalInput.value) {
        departureInput.value = arrivalInput.value;
      }
    });
  }

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      if (hintNode) {
        hintNode.textContent = "Controlla i campi obbligatori prima di inviare la richiesta.";
      }
      return;
    }

    if (arrivalInput && departureInput && arrivalInput.value > departureInput.value) {
      if (hintNode) {
        hintNode.textContent = "La data di partenza deve essere successiva all'arrivo.";
      }
      departureInput.focus();
      return;
    }

    const formData = new FormData(bookingForm);
    const guestName = String(formData.get("guest-name") || "");
    const arrivalDate = String(formData.get("arrival-date") || "");
    const departureDate = String(formData.get("departure-date") || "");
    const guestsCount = String(formData.get("guests-count") || "");
    const guestEmail = String(formData.get("guest-email") || "");
    const guestNote = String(formData.get("guest-note") || "");

    const subject = encodeURIComponent("Richiesta prenotazione - Maremma sul Mare");
    const body = encodeURIComponent(
      [
        `Nome: ${guestName}`,
        `Email: ${guestEmail}`,
        `Arrivo: ${arrivalDate}`,
        `Partenza: ${departureDate}`,
        `Ospiti: ${guestsCount}`,
        "",
        "Messaggio:",
        guestNote || "Nessuna nota aggiuntiva",
      ].join("\n")
    );

    window.location.href = `mailto:info@hotelmaremmamare.com?subject=${subject}&body=${body}`;

    if (hintNode) {
      hintNode.textContent = "Perfetto: email precompilata pronta per l'invio.";
    }
  });
})();
