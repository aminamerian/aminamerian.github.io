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

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
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

  // Hero is above the fold — reveal immediately after paint
  requestAnimationFrame(function () {
    document.querySelectorAll(".hero [data-reveal]").forEach(function (el) {
      el.classList.add("is-visible");
    });
  });
})();
