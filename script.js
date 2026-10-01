const revealItems = document.querySelectorAll(".reveal");
const backToTop = document.querySelector(".back-to-top");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const updateBackToTop = () => {
  backToTop.classList.toggle("is-visible", window.scrollY > 500);
};

window.addEventListener("scroll", updateBackToTop, { passive: true });
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
updateBackToTop();
document.querySelectorAll('a[href="audit-1.html"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(() => { window.location.href = link.href; }, 260);
  });
});

window.addEventListener("pageshow", () => document.body.classList.remove("is-leaving"));

// FAQ: every answer shows on desktop; on phones it is an accordion with the first answer open.
const faqItems = document.querySelectorAll(".faq-item");
const phone = window.matchMedia("(max-width: 760px)");

const syncFaq = () => {
  faqItems.forEach((item, index) => { item.open = phone.matches ? index === 0 : true; });
};

faqItems.forEach((item) => {
  item.querySelector("summary").addEventListener("click", (event) => {
    if (!phone.matches) event.preventDefault();
  });
});

syncFaq();
phone.addEventListener("change", syncFaq);
