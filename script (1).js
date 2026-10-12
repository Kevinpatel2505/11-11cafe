const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwOjRWKYJ1tOOjmtumdL2u_5LJJXacXPqIMqsW46SSDbQtLjMZaTCg2sdUcRgKyCy7N/exec';

const reviewContainer = document.querySelector("#reviewsList");

/* ---------- MENU TABS ---------- */
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".menu-panel");

function showPanel(name) {
  tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  panels.forEach(p => {
    const isActive = p.dataset.panel === name;
    p.classList.toggle("active", isActive);
    if (isActive) {
      p.querySelectorAll(".menu-item").forEach((item, i) => {
        item.classList.remove("reveal");
        void item.offsetWidth; // animation restart
        item.style.animationDelay = (i * 0.05) + "s";
        item.classList.add("reveal");
      });
    }
  });
}

tabs.forEach(t => t.addEventListener("click", () => showPanel(t.dataset.tab)));
if (tabs.length) showPanel(tabs[0].dataset.tab);

/* ---------- REVIEWS ---------- */
function esc(str) {
  const d = document.createElement("div");
  d.textContent = str == null ? "" : String(str);
  return d.innerHTML;
}

async function loadReviews() {
  try {
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error("API response error");
    const data = await response.json();

    if (!data.reviews || data.reviews.length === 0) {
      reviewContainer.innerHTML = '<p class="reviews-empty">Abhi koi review nahi hai.</p>';
      return;
    }

    reviewContainer.innerHTML = "";
    data.reviews.slice().reverse().forEach(review => {
      const rating = Math.max(0, Math.min(5, parseInt(review.rating, 10) || 0));
      const card = document.createElement("div");
      card.className = "review-card";
      card.innerHTML = `
        <div class="review-top">
          <span class="review-name">${esc(review.name)}</span>
          <span class="review-stars">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</span>
        </div>
        <p class="review-msg">${esc(review.message)}</p>
      `;
      reviewContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Review error:", error);
    reviewContainer.innerHTML = '<p class="reviews-empty">Reviews load nahi ho rahe hain.</p>';
  }
}

/* ---------- FEEDBACK FORM ---------- */
const form = document.querySelector("#feedbackForm");
const note = document.querySelector("#formNote");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = form.querySelector(".submit-btn");
  btn.disabled = true;
  note.textContent = "Bhej rahe hain...";

  const payload = {
    fbName: form.fbName.value.trim(),
    fbContact: form.fbContact.value.trim(),
    fbRating: form.fbRating.value,
    fbMessage: form.fbMessage.value.trim()
  };

  try {
    // text/plain rakha hai taaki Google Apps Script ke saath CORS problem na aaye
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    note.textContent = "Shukriya! Aapka feedback mil gaya.";
    form.reset();
    setTimeout(loadReviews, 1500);
  } catch (err) {
    console.error(err);
    note.textContent = "Kuch gadbad ho gayi, dobara try kijiye.";
  } finally {
    btn.disabled = false;
  }
});

document.addEventListener("DOMContentLoaded", loadReviews);
