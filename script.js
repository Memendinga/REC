// Formulaire d'adhésion — Réseau des Entrepreneurs du Congo (REC)

const FORMSPREE_URL = "https://formspree.io/f/mljrnzwq";
const WHATSAPP_NUMBER = "242067257950"; // +242 06 725 7950

const form = document.getElementById("rec-form");
const doneBox = document.getElementById("rec-done");
const errorBox = document.getElementById("rec-error");
const submitBtn = document.getElementById("rec-submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.style.display = "none";
  submitBtn.disabled = true;
  submitBtn.textContent = "Envoi en cours…";

  const data = {
    nom: form.nom.value,
    ville: form.ville.value,
    secteur: form.secteur.value,
    contact: form.contact.value,
    motivation: form.motivation.value,
  };

  try {
    const res = await fetch(FORMSPREE_URL, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Échec de l'envoi");

    form.style.display = "none";
    doneBox.style.display = "block";

    const msg = encodeURIComponent(
      `Bonjour, je viens de m'inscrire au REC (Réseau des Entrepreneurs du Congo) — ${data.nom}, secteur : ${data.secteur}.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  } catch (err) {
    errorBox.style.display = "block";
    submitBtn.disabled = false;
    submitBtn.textContent = "Adhérer au réseau";
  }
});
