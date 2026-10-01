const STORAGE_KEY = "fra-audit";
const form = document.querySelector(".audit-form");
const statusEl = document.querySelector(".actions-status");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const goTo = (url) => {
  if (reduceMotion) { window.location.href = url; return; }
  document.body.classList.add("is-leaving");
  setTimeout(() => { window.location.href = url; }, 200);
};

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || link.target || event.metaKey || event.ctrlKey || event.shiftKey) return;
  const href = link.getAttribute("href");
  if (!href.endsWith(".html")) return;
  event.preventDefault();
  goTo(href);
});

// Pages restored from the back/forward cache keep the faded-out state; clear it.
window.addEventListener("pageshow", () => document.body.classList.remove("is-leaving"));

const loadAnswers = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
};

const saveAnswers = (answers) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch { /* storage unavailable */ }
};

const fieldNames = () => [...new Set([...form.elements].filter((el) => el.name).map((el) => el.name))];

const isFilled = (name) => {
  const field = form.elements[name];
  if (field instanceof RadioNodeList) return field.value !== "";
  return field.value.trim() !== "";
};

const fieldError = (name) => {
  const field = form.elements[name];
  if (!isFilled(name)) return "Please fill this in.";
  if (field.type === "email" && !field.checkValidity()) return "Please enter a valid email address.";
  return "";
};

const showError = (name, message) => {
  const error = document.getElementById(`${name}-error`);
  if (error) error.textContent = message;
  const field = form.elements[name];
  if (!(field instanceof RadioNodeList)) field.setAttribute("aria-invalid", message ? "true" : "false");
};

const updateStatus = () => {
  const remaining = fieldNames().filter((name) => fieldError(name)).length;
  statusEl.textContent = remaining === 0
    ? "All set — continue when you are ready"
    : `${remaining} ${remaining === 1 ? "answer" : "answers"} left in this section`;
  statusEl.classList.toggle("is-pending", remaining > 0);
};

const restore = () => {
  const answers = loadAnswers();
  fieldNames().forEach((name) => {
    if (answers[name] !== undefined) form.elements[name].value = answers[name];
  });
};

const persist = () => {
  const answers = loadAnswers();
  fieldNames().forEach((name) => { answers[name] = form.elements[name].value; });
  saveAnswers(answers);
};

if (form) {
  restore();
  updateStatus();

  form.addEventListener("input", (event) => {
    persist();
    updateStatus();
    if (event.target.name && event.target.getAttribute("aria-invalid") === "true") {
      showError(event.target.name, fieldError(event.target.name));
    }
  });
  form.addEventListener("change", (event) => {
    persist();
    updateStatus();
    if (event.target.name) showError(event.target.name, fieldError(event.target.name));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const invalid = fieldNames().filter((name) => {
      const message = fieldError(name);
      showError(name, message);
      return message;
    });
    if (invalid.length) {
      const first = form.elements[invalid[0]];
      (first instanceof RadioNodeList ? first[0] : first).focus();
      return;
    }
    persist();
    goTo(form.dataset.next);
  });
}

// Review and result pages: show saved answers wherever [data-answer] appears.
const YES_NO = { yes: "Yes", partially: "Partially", no: "No" };
const ANSWER_LABELS = {
  outlets: { "1": "1", "2-5": "2–5", "6-15": "6–15", "16+": "16+" },
  payback: { "36+": "More than 36 months", "24-36": "24–36 months", "18-24": "18–24 months", "12-18": "12–18 months", "0-12": "Less than 12 months" },
  margin: { "0-10": "Less than 10%", "10-15": "10–15%", "15-20": "15–20%", "20-25": "20–25%", "25+": "More than 25%" },
  documented: YES_NO,
  sop: { none: "None", few: "A few", half: "About half", most: "Most", all: "All" },
  enquiries: { "0": "0", "1-5": "1–5", "6-15": "6–15", "16-40": "16–40", "40+": "More than 40" },
  cities: { "1": "1", "2-3": "2–3", "4+": "4 or more" },
  partner_profile: YES_NO,
  training: YES_NO,
  authority: {
    "1": "I am involved in most daily decisions",
    "2": "Routine tasks delegated, decisions come to me",
    "3": "A manager runs the day-to-day within limits I set",
    "4": "Managers decide; I review outcomes",
    "5": "The business runs without me day to day",
  },
  trademark: { registered: "Registered", filed: "Application filed", neither: "Neither" },
  disputes: { yes: "Yes", no: "No" },
};

const answerText = (key, value, format) => {
  const label = (ANSWER_LABELS[key] && ANSWER_LABELS[key][value]) || value;
  if (format === "outlets") return value === "1" ? "1 outlet" : `${label} outlets`;
  return label;
};

const savedAnswers = loadAnswers();
document.querySelectorAll("[data-answer]").forEach((el) => {
  const value = savedAnswers[el.dataset.answer];
  if (value) el.textContent = answerText(el.dataset.answer, value, el.dataset.format);
});

document.querySelectorAll("[data-today]").forEach((el) => {
  el.textContent = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
});

document.querySelectorAll("[data-interest]").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.add("is-sent");
    button.disabled = true;
    button.querySelector("span").textContent = "You’re on the list";
  });
});
