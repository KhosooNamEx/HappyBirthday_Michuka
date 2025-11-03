// ---- Global personalization ----
const CONFIG = {
  NAME: "Your Friend",                    // shown on pages
  PHOTOS: [
    "assets/photo1.jpg",
    "assets/photo2.jpg",
    "assets/photo3.jpg",
    "assets/photo4.jpg",
    "assets/photo5.jpg"
  ]
};

// Set footer/home name if present
document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("bday-name");
  if (nameEl) nameEl.textContent = CONFIG.NAME;
  const f = document.getElementById("bday-name-footer");
  if (f) f.textContent = CONFIG.NAME;
});
