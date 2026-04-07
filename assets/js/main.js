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

  const mountMapFallback = (mapNode, fallbackAddress) => {
    if (!mapNode || mapNode.dataset.mapMounted === "true") {
      return;
    }

    const query = encodeURIComponent(fallbackAddress || "Hotel Maremma, Lungomare Harmine, 42, 01014 Montalto Marina VT");
    mapNode.innerHTML = `<iframe title="Mappa Maremma sul Mare" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${query}&output=embed"></iframe>`;
    mapNode.dataset.mapMounted = "true";
  };

  const initGoogleMap = (mapNode) => {
    if (!mapNode || mapNode.dataset.mapStarted === "true") {
      return;
    }

    mapNode.dataset.mapStarted = "true";

    const lat = Number.parseFloat(mapNode.dataset.lat || "");
    const lng = Number.parseFloat(mapNode.dataset.lng || "");
    const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
    const fallbackAddress = mapNode.dataset.address || (hasCoordinates ? `${lat},${lng}` : "Hotel Maremma, Lungomare Harmine, 42, 01014 Montalto Marina VT");
    const markerTitle = mapNode.dataset.title || "Maremma sul Mare";

    const fallbackToIframe = () => {
      mountMapFallback(mapNode, fallbackAddress);
    };

    const keyFromMeta = document.querySelector('meta[name="google-maps-api-key"]')?.content?.trim() || "";
    const keyFromWindow = typeof window.MAREMMA_MAPS_API_KEY === "string" ? window.MAREMMA_MAPS_API_KEY.trim() : "";
    const apiKey = keyFromWindow || keyFromMeta;

    if (!apiKey || !hasCoordinates) {
      fallbackToIframe();
      return;
    }

    const drawInteractiveMap = () => {
      if (!window.google || !window.google.maps) {
        fallbackToIframe();
        return;
      }

      mapNode.innerHTML = "";
      const center = { lat, lng };
      const map = new window.google.maps.Map(mapNode, {
        center,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      new window.google.maps.Marker({
        position: center,
        map,
        title: markerTitle,
      });
    };

    if (window.google && window.google.maps) {
      drawInteractiveMap();
      return;
    }

    window.addEventListener("maremma:maps-ready", drawInteractiveMap, { once: true });
    window.addEventListener("maremma:maps-error", fallbackToIframe, { once: true });

    const existingLoader = document.querySelector('script[data-google-maps-loader="maremma"]');
    if (existingLoader) {
      return;
    }

    const callbackName = "__maremmaGoogleMapsReady";
    window[callbackName] = () => {
      window.dispatchEvent(new Event("maremma:maps-ready"));
      try {
        delete window[callbackName];
      } catch (_) {
        window[callbackName] = undefined;
      }
    };

    const script = document.createElement("script");
    script.dataset.googleMapsLoader = "maremma";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${callbackName}&loading=async`;
    script.addEventListener(
      "error",
      () => {
        window.dispatchEvent(new Event("maremma:maps-error"));
      },
      { once: true }
    );

    document.head.appendChild(script);
  };

  const mapNode = document.querySelector("[data-map-canvas]");
  if (mapNode) {
    if ("IntersectionObserver" in window) {
      const mapObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            initGoogleMap(mapNode);
            mapObserver.unobserve(entry.target);
          });
        },
        {
          threshold: 0.16,
          rootMargin: "0px 0px -8% 0px",
        }
      );

      mapObserver.observe(mapNode);
    } else {
      initGoogleMap(mapNode);
    }
  }

  const bookingForm = document.querySelector("#booking-form");
  if (!bookingForm) {
    return;
  }

  const requestTypeSelect = bookingForm.querySelector("#request-type");
  const arrivalInput = bookingForm.querySelector("#arrival-date");
  const departureInput = bookingForm.querySelector("#departure-date");
  const guestsInput = bookingForm.querySelector("#guests-count");
  const hotelOnlyGroups = Array.from(bookingForm.querySelectorAll("[data-hotel-only]"));
  const hintNode = bookingForm.querySelector(".form-hint");

  const syncHotelOnlyFields = () => {
    const isHotelRequest = requestTypeSelect?.value === "Hotel";
    bookingForm.classList.toggle("is-hotel-request", isHotelRequest);

    hotelOnlyGroups.forEach((group) => {
      group.hidden = !isHotelRequest;

      group.querySelectorAll("input, select, textarea").forEach((field) => {
        field.disabled = !isHotelRequest;
      });
    });

    if (arrivalInput) {
      arrivalInput.required = isHotelRequest;
      if (!isHotelRequest) {
        arrivalInput.value = "";
      }
    }

    if (departureInput) {
      departureInput.required = isHotelRequest;
      if (!isHotelRequest) {
        departureInput.value = "";
      }
    }

    if (guestsInput) {
      if (!isHotelRequest) {
        guestsInput.value = "2";
      }
    }
  };

  if (requestTypeSelect) {
    requestTypeSelect.addEventListener("change", syncHotelOnlyFields);
    syncHotelOnlyFields();
  }

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

    const formData = new FormData(bookingForm);
    const requestType = String(formData.get("request-type") || "");
    const isHotelRequest = requestType === "Hotel";

    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      if (hintNode) {
        hintNode.textContent = "Controlla i campi obbligatori prima di inviare la richiesta.";
      }
      return;
    }

    if (isHotelRequest && arrivalInput && departureInput && arrivalInput.value > departureInput.value) {
      if (hintNode) {
        hintNode.textContent = "La data di partenza deve essere successiva all'arrivo.";
      }
      departureInput.focus();
      return;
    }

    const guestName = String(formData.get("guest-name") || "");
    const requestTypeForMail = String(formData.get("request-type") || "");
    const arrivalDate = String(formData.get("arrival-date") || "");
    const departureDate = String(formData.get("departure-date") || "");
    const guestsCount = String(formData.get("guests-count") || "");
    const guestEmail = String(formData.get("guest-email") || "");
    const guestNote = String(formData.get("guest-note") || "");

    const subject = encodeURIComponent("Richiesta prenotazione - Maremma sul Mare");
    const body = encodeURIComponent(
      [
        `Nome: ${guestName}`,
        `Richiesta per: ${requestTypeForMail || "Non specificato"}`,
        `Email: ${guestEmail}`,
        `Arrivo: ${isHotelRequest ? arrivalDate : "Non richiesto"}`,
        `Partenza: ${isHotelRequest ? departureDate : "Non richiesto"}`,
        `Ospiti: ${isHotelRequest ? guestsCount : "Non richiesto"}`,
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
