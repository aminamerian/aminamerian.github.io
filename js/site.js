(function () {
  "use strict";

  var media = document.getElementById("hero-media");
  if (media) {
    var n = Math.floor(Math.random() * 17) + 1;
    media.style.backgroundImage = "url(images/header-background-" + n + ".jpg)";
  }

  var start = new Date("2021-01-01");
  var now = new Date();
  var years = now.getFullYear() - start.getFullYear();
  var monthDiff = now.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) {
    years--;
  }
  var yearsEl = document.getElementById("experience-years");
  if (yearsEl) {
    yearsEl.textContent = years + "+";
  }

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(now.getFullYear());
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll("[data-reveal]");

  function showReveals() {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    showReveals();
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  reveals.forEach(function (el) {
    observer.observe(el);
  });

  requestAnimationFrame(function () {
    document.querySelectorAll(".hero [data-reveal]").forEach(function (el) {
      el.classList.add("is-visible");
    });
  });

  /* —— Cinematic scroll handoff —— */
  var hero = document.getElementById("home");
  var lower = document.querySelector(".lower");
  var ticking = false;

  function updateScrollHandoff() {
    ticking = false;
    if (!hero) return;

    var rect = hero.getBoundingClientRect();
    var height = Math.max(rect.height, 1);
    var progress = Math.min(1, Math.max(0, -rect.top / (height * 0.72)));
    hero.style.setProperty("--scroll-progress", progress.toFixed(4));

    if (lower) {
      var lowerRect = lower.getBoundingClientRect();
      var arrive = Math.min(1, Math.max(0, 1 - lowerRect.top / (window.innerHeight * 0.85)));
      lower.style.setProperty("--arrive", arrive.toFixed(4));
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScrollHandoff);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateScrollHandoff();

  /* —— Magnetic social icons —— */
  var socialLinks = Array.prototype.slice.call(document.querySelectorAll(".social a"));
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  if (!finePointer || !socialLinks.length) return;

  var strength = 10;
  var radius = 88;

  function resetMagnets() {
    socialLinks.forEach(function (link) {
      link.style.setProperty("--mx", "0px");
      link.style.setProperty("--my", "0px");
    });
  }

  window.addEventListener(
    "pointermove",
    function (event) {
      socialLinks.forEach(function (link) {
        var rect = link.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = event.clientX - cx;
        var dy = event.clientY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius && dist > 0.5) {
          var pull = (1 - dist / radius) * strength;
          link.style.setProperty("--mx", (dx / dist) * pull + "px");
          link.style.setProperty("--my", (dy / dist) * pull + "px");
        } else {
          link.style.setProperty("--mx", "0px");
          link.style.setProperty("--my", "0px");
        }
      });
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", resetMagnets);
})();
