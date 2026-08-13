// ============================================================
// REC — Réseau des Entrepreneurs du Congo
// ============================================================

// Numéro WhatsApp REC : (+242) 06 725 79 50
// Format requis par WhatsApp : chiffres uniquement, sans "+", espaces ni parenthèses.
// Laisser vide ("") pour désactiver l'ouverture automatique vers ce numéro.
const REC_WHATSAPP_NUMBER = "242067257950";

// Formulaire d'adhésion : les réponses sont enregistrées via Formspree
// avant l'ouverture de WhatsApp. Voir https://formspree.io
const FORMSPREE_URL = "https://formspree.io/f/mljrnzwq";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Footer year ---------------- */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------------- Mobile menu ---------------- */
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------------- Scroll reveal ---------------- */
const revealTargets = document.querySelectorAll("[data-reveal]");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}

/* ---------------- Join form → Formspree + WhatsApp ---------------- */
const joinForm = document.getElementById("joinForm");
const joinSubmitBtn = document.getElementById("joinSubmitBtn");
const joinFormError = document.getElementById("joinFormError");

if (joinForm) {
  joinForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (joinFormError) joinFormError.style.display = "none";

    const data = new FormData(joinForm);
    const name = (data.get("name") || "").toString().trim();
    const activity = (data.get("activity") || "").toString().trim();
    const phone = (data.get("phone") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();

    if (joinSubmitBtn) {
      joinSubmitBtn.disabled = true;
      joinSubmitBtn.textContent = "Envoi en cours…";
    }

    try {
      // Enregistrement de la demande via Formspree
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ name, activity, phone, email }),
      });
      if (!res.ok) throw new Error("Échec de l'envoi à Formspree");

      // Ouverture de WhatsApp avec le message prérempli
      const lines = [
        "Bonjour REC, je souhaite rejoindre le réseau.",
        `Nom : ${name}`,
        `Activité / projet : ${activity}`,
        `Téléphone : ${phone}`,
      ];
      if (email) lines.push(`Email : ${email}`);

      const message = encodeURIComponent(lines.join("\n"));

      if (REC_WHATSAPP_NUMBER) {
        window.open(`https://wa.me/${REC_WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener");
      } else {
        window.open(`https://wa.me/?text=${message}`, "_blank", "noopener");
      }

      joinForm.reset();
    } catch (err) {
      if (joinFormError) joinFormError.style.display = "block";
    } finally {
      if (joinSubmitBtn) {
        joinSubmitBtn.disabled = false;
        joinSubmitBtn.textContent = "Envoyer ma demande";
      }
    }
  });
}

/* ---------------- Hero network canvas ----------------
   Signature visuelle : le "réseau" pris au pied de la lettre —
   des nœuds représentant les entrepreneurs, reliés dynamiquement
   quand ils sont proches, comme le maillage que le REC construit.
------------------------------------------------------- */
(function initNetworkCanvas() {
  const canvas = document.getElementById("networkCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const card = canvas.closest(".hero-card");
  let width, height, nodes, animationId;

  const NODE_COLOR = "rgba(224, 189, 107, 0.85)"; // gold-soft
  const LINE_COLOR = "rgba(224, 189, 107, 0.22)";
  const ACCENT_NODE = "rgba(181, 72, 46, 0.9)"; // clay, sparse accent
  const LINK_DISTANCE = 150;
  const NODE_COUNT_BASE = 46;

  function resize() {
    const rect = card.getBoundingClientRect();
    width = canvas.width = rect.width * window.devicePixelRatio;
    height = canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function createNodes() {
    const rect = card.getBoundingClientRect();
    const count = Math.max(18, Math.min(NODE_COUNT_BASE, Math.round((rect.width * rect.height) / 9000)));
    nodes = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 1,
      accent: i % 11 === 0,
    }));
  }

  function step() {
    const rect = card.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Update positions
    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > rect.width) n.vx *= -1;
      if (n.y < 0 || n.y > rect.height) n.vy *= -1;
    });

    // Draw links
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DISTANCE) {
          ctx.strokeStyle = LINE_COLOR;
          ctx.globalAlpha = 1 - dist / LINK_DISTANCE;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    // Draw nodes
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.fillStyle = n.accent ? ACCENT_NODE : NODE_COLOR;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    animationId = requestAnimationFrame(step);
  }

  function start() {
    resize();
    createNodes();
    if (!prefersReducedMotion) {
      cancelAnimationFrame(animationId);
      step();
    } else {
      // Static single frame for reduced-motion users.
      const rect = card.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.fillStyle = n.accent ? ACCENT_NODE : NODE_COLOR;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(start, 200);
  });

  start();
})();
