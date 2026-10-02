(function () {
  const page = document.body.dataset.page || "";
  const depth = document.body.dataset.depth || "";
  const base = depth === "1" ? "../" : "";
  const THEME_KEY = "lumedia-theme";

  const getTheme = () => {
    try {
      return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  };
  const applyTheme = (theme) => {
    const dark = theme === "dark";
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try {
      if (dark) localStorage.setItem(THEME_KEY, "dark");
      else localStorage.removeItem(THEME_KEY);
    } catch (e) {}
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      btn.title = dark ? "Light mode" : "Dark mode";
    });
  };
  applyTheme(getTheme());

  const nav = document.querySelector(".nav");
  if (nav && !nav.querySelector(".theme-toggle")) {
    const toggle = document.createElement("button");
    toggle.className = "theme-toggle";
    toggle.type = "button";
    toggle.innerHTML =
      '<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"/></svg>' +
      '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
    const burger = nav.querySelector(".burger");
    if (burger) nav.insertBefore(toggle, burger);
    else nav.appendChild(toggle);
    toggle.addEventListener("click", () => {
      applyTheme(getTheme() === "dark" ? "light" : "dark");
    });
    applyTheme(getTheme());
  }

  const loader = document.querySelector(".loader");
  if (loader) {
    const seen = sessionStorage.getItem("lumedia-loader");
    const hide = () => loader.classList.add("hide");
    if (seen) hide();
    else {
      sessionStorage.setItem("lumedia-loader", "1");
      window.setTimeout(hide, 1100);
    }
  }

  const pages = document.querySelector(".hero-pages");
  if (pages) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sheets = [...pages.querySelectorAll(".hero-page")];
    if (!reduce && sheets.length) {
      const order = sheets.map((_, index) => index);
      const stack = () => {
        order.forEach((sheetIndex, depth) => {
          sheets[sheetIndex].style.zIndex = String(order.length - depth);
        });
      };
      const park = (el) => {
        el.style.transition = "none";
        el.classList.remove("is-slid");
        void el.offsetWidth;
        el.style.transition = "";
      };
      stack();
      const advance = () => {
        const top = sheets[order[0]];
        top.classList.add("is-slid");
        window.setTimeout(() => {
          order.push(order.shift());
          stack();
          park(top);
          advance();
        }, 3000);
      };
      window.setTimeout(advance, 3000);
    }
  }

  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.dataset.page === page) link.classList.add("is-active");
  });

  const burger = document.querySelector(".burger");
  const panel = document.querySelector(".menu-panel");
  const closeMenu = document.querySelector(".menu-close");
  function setMenu(open) {
    if (!panel) return;
    panel.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger && burger.addEventListener("click", () => setMenu(true));
  closeMenu && closeMenu.addEventListener("click", () => setMenu(false));
  panel && panel.addEventListener("click", (event) => {
    if (event.target === panel) setMenu(false);
  });
  panel && panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    window.setTimeout(() => setMenu(false), 400);
  }));

  document.querySelectorAll(".service").forEach((item, index) => {
    if (index === 0) item.classList.add("open");
    item.querySelector(".service-btn").addEventListener("click", () => {
      const was = item.classList.contains("open");
      document.querySelectorAll(".service").forEach((s) => s.classList.remove("open"));
      if (!was) item.classList.add("open");
    });
  });

  document.querySelectorAll(".faq-item").forEach((item) => {
    item.querySelector(".faq-q").addEventListener("click", () => {
      const was = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((s) => {
        s.classList.remove("open");
        const plus = s.querySelector(".plus");
        if (plus) plus.textContent = "+";
      });
      if (!was) item.classList.add("open");
      item.querySelector(".plus").textContent = item.classList.contains("open") ? "–" : "+";
    });
  });

  const tabs = [...document.querySelectorAll(".hero-tabs button")];
  const services = ["Electronic billboards"];
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      const label = document.querySelector("[data-service-label]");
      if (label) label.textContent = services[i];
    });
  });

  const track = document.querySelector("[data-hero-track]");
  if (track && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const count = track.children.length;
    let index = 0;
    window.setInterval(() => {
      index = (index + 1) % count;
      track.style.transform = "translateY(-" + (index * 100) / count + "%)";
    }, 2800);
  }

  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const decimals = Number(el.dataset.decimals || 0);
    let started = false;
    const run = () => {
      if (started) return;
      const top = el.getBoundingClientRect().top;
      if (top > window.innerHeight * 0.9) return;
      started = true;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / 1200);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        el.textContent = prefix + value.toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", run, { passive: true });
    run();
  });

  document.querySelectorAll("form[data-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const showSuccess = () => {
        form.hidden = true;
        const ok = form.parentElement.querySelector(".success");
        if (ok) ok.style.display = "block";
      };

      const data = new FormData(form);
      if (!data.get("form-name")) {
        data.set("form-name", form.getAttribute("name") || "form");
      }

      const endpoint = form.getAttribute("data-form-endpoint");
      const host = location.hostname || "";
      const onNetlify = /\.netlify\.app$|\.netlify\.com$/i.test(host);

      // Optional custom endpoint (e.g. form backend). Never commit secrets here —
      // set data-form-endpoint on the form element in the environment that needs it.
      if (endpoint) {
        try {
          await fetch(endpoint, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: data,
          });
        } catch (e) {}
        showSuccess();
        return;
      }

      // Netlify Forms when hosted on Netlify.
      if (onNetlify && (form.hasAttribute("data-netlify") || form.getAttribute("netlify") !== null)) {
        try {
          const res = await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(data).toString(),
          });
          if (res.ok) showSuccess();
        } catch (e) {}
        return;
      }

      // EC2 / plain Nginx static hosting: mailto fallback (no server-side form processor).
      const formName = (form.getAttribute("name") || data.get("form-name") || "form").toString().toLowerCase();
      const lines = [];
      data.forEach((value, key) => {
        if (key === "bot-field" || key === "form-name") return;
        lines.push(key + ": " + String(value));
      });
      const to =
        formName === "newsletter" || formName === "career"
          ? "career@lumediaads.com"
          : "contact@lumediaads.com";
      const subject =
        formName === "newsletter"
          ? "Lumedia newsletter signup"
          : formName === "career"
            ? "Lumedia career enquiry"
            : formName === "contact"
              ? "Lumedia project enquiry"
              : "Lumedia website form";
      const mailto =
        "mailto:" +
        to +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(lines.join("\n"));
      window.location.href = mailto;
    });
  });

  const contactCard = document.querySelector(".hero-contact");
  if (contactCard && window.matchMedia("(hover: none)").matches) {
    contactCard.addEventListener("click", () => {
      contactCard.classList.toggle("is-open");
    });
  }

  const reel = document.querySelector(".reel");
  if (reel && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const updateReel = () => {
      const rect = reel.getBoundingClientRect();
      const range = reel.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), range);
      reel.style.setProperty("--p", range > 0 ? String(scrolled / range) : "0");
    };
    updateReel();
    window.addEventListener("scroll", updateReel, { passive: true });
    window.addEventListener("resize", updateReel);
  } else if (reel) {
    reel.style.setProperty("--p", "1");
  }

  const modal = document.querySelector(".modal");
  document.querySelectorAll("[data-play]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!modal) return;
      modal.classList.add("open");
      const video = modal.querySelector("video");
      video && video.play();
    });
  });
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-close]")) {
        modal.classList.remove("open");
        const video = modal.querySelector("video");
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }

  if (window.matchMedia("(pointer:fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const colors = ["#ff3b30", "#007aff", "#34c759"];
    const trails = colors.map((color, i) => {
      const el = document.createElement("span");
      el.className = "trail";
      el.style.background = color;
      el.style.opacity = String(0.55 - i * 0.08);
      el.style.width = el.style.height = 12 - i * 1.5 + "px";
      document.body.appendChild(el);
      return { el, x: 0, y: 0 };
    });
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    });
    const loop = () => {
      let x = mx;
      let y = my;
      trails.forEach((dot) => {
        dot.x += (x - dot.x) * 0.28;
        dot.y += (y - dot.y) * 0.28;
        dot.el.style.transform = `translate(${dot.x}px, ${dot.y}px)`;
        x = dot.x;
        y = dot.y;
      });
      requestAnimationFrame(loop);
    };
    loop();
  }

  document.querySelectorAll(".run-letters").forEach((el) => {
    const text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text) return;
    el.setAttribute("aria-label", text);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const words = text.split(" ");
    let index = 0;
    el.textContent = "";
    words.forEach((word, wi) => {
      const wordEl = document.createElement("span");
      wordEl.className = "run-word";
      wordEl.setAttribute("aria-hidden", "true");
      [...word].forEach((ch) => {
        const span = document.createElement("span");
        span.className = "run-char";
        span.textContent = ch;
        span.style.setProperty("--i", String(index));
        index += 1;
        wordEl.appendChild(span);
      });
      el.appendChild(wordEl);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    const start = () => el.classList.add("is-running");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          start();
          observer.disconnect();
        }
      }, { threshold: 0.4 });
      observer.observe(el);
    } else {
      start();
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const whyCarousel = document.querySelector("[data-why-carousel]");
  if (whyCarousel) {
    const slides = [...whyCarousel.querySelectorAll(".why-slide")];
    const dots = [...whyCarousel.querySelectorAll(".why-dot")];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let timer = null;

    const goTo = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };
    const start = () => {
      if (slides.length < 2) return;
      stop();
      timer = window.setInterval(() => goTo(index + 1), 1750);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => goTo(i));
    });

    whyCarousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(index + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(index - 1);
      }
    });
    whyCarousel.setAttribute("tabindex", "0");

    goTo(0);
    start();

    if (reduceMotion) {
      // Still auto-advance; CSS already disables motion.
    }
  }

  window.LUMEDIA_BASE = base;
})();
