const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealItems = document.querySelectorAll("[data-reveal], .reveal-up, .reveal-scale");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -5%" }
);

revealItems.forEach((item, index) => {
  item.style.setProperty("--reveal-delay", `${Math.min((index % 4) * 70, 210)}ms`);
  revealObserver.observe(item);
});

const titleLines = document.querySelectorAll(".title-line > span");
requestAnimationFrame(() => titleLines.forEach((line, index) => {
  line.style.transitionDelay = `${120 + index * 120}ms`;
  line.classList.add("is-visible");
}));

const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");
const parallaxItems = document.querySelectorAll("[data-parallax]");
let ticking = false;

function updateScrollEffects() {
  const scrollY = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.transform = `scaleX(${scrollable > 0 ? scrollY / scrollable : 0})`;
  header?.classList.toggle("is-scrolled", scrollY > 24);
  if (!reducedMotion) {
    parallaxItems.forEach((item) => {
      const speed = Number(item.dataset.parallax || 0);
      item.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
    });
  }
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollEffects);
    ticking = true;
  }
}, { passive: true });
updateScrollEffects();

if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  const stage = document.querySelector(".hero-stage");
  const depthItems = document.querySelectorAll("[data-depth]");
  stage?.addEventListener("pointermove", (event) => {
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    depthItems.forEach((item) => {
      const depth = Number(item.dataset.depth || 1);
      item.style.translate = `${x * 14 * depth}px ${y * 11 * depth}px`;
    });
  });
  stage?.addEventListener("pointerleave", () => depthItems.forEach((item) => { item.style.translate = "0 0"; }));
}

const counters = document.querySelectorAll("[data-count]");
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count);
    if (reducedMotion || target === 0) {
      element.textContent = String(target);
    } else {
      const started = performance.now();
      const duration = 900;
      const tick = (now) => {
        const progress = Math.min((now - started) / duration, 1);
        element.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    counterObserver.unobserve(element);
  });
}, { threshold: 0.6 });
counters.forEach((counter) => counterObserver.observe(counter));

document.querySelectorAll("[data-drag-scroll]").forEach((rail) => {
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  rail.addEventListener("pointerdown", (event) => {
    dragging = true;
    startX = event.clientX;
    startScroll = rail.scrollLeft;
    rail.setPointerCapture(event.pointerId);
    rail.classList.add("is-dragging");
  });
  rail.addEventListener("pointermove", (event) => {
    if (dragging) rail.scrollLeft = startScroll - (event.clientX - startX);
  });
  const stopDragging = () => { dragging = false; rail.classList.remove("is-dragging"); };
  rail.addEventListener("pointerup", stopDragging);
  rail.addEventListener("pointercancel", stopDragging);
});
