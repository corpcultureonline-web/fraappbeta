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