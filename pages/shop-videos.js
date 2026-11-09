document.addEventListener('DOMContentLoaded', function () {
  const player = document.querySelector('.sv-episode-video');
  const loadButton = document.querySelector('.sv-youtube-load');
  const iframe = document.querySelector('.sv-episode-video iframe');
  const status = document.querySelector('.sv-player-status');
  function loadYoutube(seconds) {
    if (!iframe) return;
    iframe.src = 'https://www.youtube-nocookie.com/embed/7v1KFmHd_L4?autoplay=1&rel=0&start=' + Math.floor(seconds || 0);
    iframe.hidden = false;
    if (loadButton) loadButton.hidden = true;
    if (status) status.textContent = 'YouTube player loaded.';
  }
  if (loadButton) loadButton.addEventListener('click', function () { loadYoutube(0); });
  document.querySelectorAll('.sv-seek').forEach(function (button) {
    button.addEventListener('click', function () {
      loadYoutube(Number(button.dataset.seek));
      if (player) player.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'center'});
    });
  });
});
