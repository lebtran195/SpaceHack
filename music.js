"use strict";
// Background music, controlled by the existing SOUND ON / SOUND OFF button.
(() => {
  const music = new Audio(encodeURI("Astronaut Type Beat.mp3"));
  music.loop = true;
  music.volume = 0.35;
  music.preload = "auto";
  window.gameMusic = music;

  const soundEnabled = () => typeof soundOn === "undefined" || soundOn;

  function play() {
    if (!soundEnabled() || document.hidden) return;
    // Browsers only allow audio after a user gesture; a rejected play() is retried on the next one.
    const attempt = music.play();
    if (attempt && attempt.catch) attempt.catch(() => {});
  }

  function sync() {
    if (soundEnabled()) play();
    else music.pause();
  }

  // Start on the first interaction anywhere on the page.
  for (const type of ["pointerdown", "keydown", "touchstart"]) {
    window.addEventListener(
      type,
      () => {
        if (music.paused) play();
      },
      { capture: true, passive: true },
    );
  }

  // The inline handler flips soundOn first; read the new value afterwards.
  const toggle = document.getElementById("soundToggle");
  if (toggle) toggle.addEventListener("click", () => setTimeout(sync, 0));

  // Pause while the tab is hidden, resume when the player returns.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) music.pause();
    else sync();
  });
})();
