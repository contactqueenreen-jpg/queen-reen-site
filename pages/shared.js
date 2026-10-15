document.addEventListener('DOMContentLoaded', function () {
var navToggle = document.querySelector('.nav-toggle');
var navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  var shopLink = navLinks.querySelector('a[href="/shop-all"]');
  if (shopLink) {
    var shopItem = shopLink.closest('li');
    shopItem.classList.add('nav-shop-item');
    shopLink.setAttribute('aria-haspopup', 'true');

    var shopToggle = document.createElement('button');
    shopToggle.type = 'button';
    shopToggle.className = 'nav-shop-toggle';
    shopToggle.setAttribute('aria-expanded', 'false');
    shopToggle.setAttribute('aria-label', 'Show Shop categories');

    var shopMenu = document.createElement('ul');
    shopMenu.className = 'nav-submenu';
    shopMenu.innerHTML =
      '<li><a href="/shop-all">Shop All</a></li>' +
      '<li><a href="/shop-looks">Shop My Looks</a></li>' +
      '<li><a href="/shop">Beauty</a></li>' +
      '<li><a href="/shop-fashion">Fashion</a></li>' +
      '<li><a href="/shop-hair">Hair</a></li>' +
      '<li><a href="/shop-home">Home &amp; Lifestyle</a></li>';

    shopItem.appendChild(shopToggle);
    shopItem.appendChild(shopMenu);
    shopToggle.addEventListener('click', function () {
      var isShopOpen = shopItem.classList.toggle('is-open');
      shopToggle.setAttribute('aria-expanded', isShopOpen ? 'true' : 'false');
    });
  }

  navToggle.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      if (shopItem) {
        shopItem.classList.remove('is-open');
        shopToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

var tiktokCards = document.querySelectorAll('.disc-card[href*="tiktok.com/"][href*="/video/"]');
if (tiktokCards.length) {
  var hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var videoModal = document.createElement('div');
  videoModal.className = 'video-modal';
  videoModal.hidden = true;
  videoModal.innerHTML =
    '<div class="video-modal-panel" role="dialog" aria-modal="true" aria-labelledby="videoModalTitle">' +
      '<button type="button" class="video-modal-close" aria-label="Close video">&times;</button>' +
      '<div class="video-modal-frame"></div>' +
      '<div class="video-modal-footer">' +
        '<p class="video-modal-title" id="videoModalTitle"></p>' +
        '<a class="video-modal-original" target="_blank" rel="noopener">View on TikTok ↗</a>' +
      '</div>' +
    '</div>';
  document.body.appendChild(videoModal);

  var modalFrame = videoModal.querySelector('.video-modal-frame');
  var modalTitle = videoModal.querySelector('.video-modal-title');
  var modalOriginal = videoModal.querySelector('.video-modal-original');
  var modalClose = videoModal.querySelector('.video-modal-close');
  var lastVideoCard = null;

  function playerUrl(id, options) {
    return 'https://www.tiktok.com/player/v1/' + id + '?' + options;
  }

  function stopHoverPreview(card) {
    clearTimeout(card._previewTimer);
    var player = card.querySelector('.video-hover-player');
    if (player) player.remove();
    card.classList.remove('is-previewing');
  }

  function openVideo(card) {
    var id = card.getAttribute('data-tiktok-id');
    var heading = card.querySelector('h3');
    var title = heading ? heading.textContent.trim() : 'Queen Reen video';
    stopHoverPreview(card);
    lastVideoCard = card;
    modalTitle.textContent = title;
    modalOriginal.href = card.href;

    var frame = document.createElement('iframe');
    frame.src = playerUrl(id, 'autoplay=1&controls=1&loop=0&rel=0&description=0&music_info=0');
    frame.title = title;
    frame.allow = 'autoplay; fullscreen';
    frame.setAttribute('allowfullscreen', '');
    modalFrame.replaceChildren(frame);
    videoModal.hidden = false;
    document.body.classList.add('video-modal-open');
    modalClose.focus();
  }

  function closeVideo() {
    if (videoModal.hidden) return;
    videoModal.hidden = true;
    modalFrame.replaceChildren();
    document.body.classList.remove('video-modal-open');
    if (lastVideoCard) lastVideoCard.focus();
  }

  tiktokCards.forEach(function (card) {
    var match = card.href.match(/\/video\/(\d+)/);
    var thumb = card.querySelector('.thumb');
    if (!match || !thumb) return;

    var id = match[1];
    var heading = card.querySelector('h3');
    var title = heading ? heading.textContent.trim() : 'Queen Reen video';
    card.classList.add('video-card');
    card.setAttribute('data-tiktok-id', id);
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-label', 'Play ' + title + ' on this page');

    var badge = document.createElement('span');
    badge.className = 'video-play-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = 'Play';
    thumb.appendChild(badge);

    if (hoverCapable) {
      card.addEventListener('mouseenter', function () {
        card._previewTimer = setTimeout(function () {
          if (thumb.querySelector('.video-hover-player')) return;
          var frame = document.createElement('iframe');
          frame.className = 'video-hover-player';
          frame.src = playerUrl(id, 'autoplay=1&muted=1&controls=0&loop=1&rel=0&description=0&music_info=0');
          frame.title = title + ' muted preview';
          frame.allow = 'autoplay';
          frame.setAttribute('tabindex', '-1');
          thumb.appendChild(frame);
          card.classList.add('is-previewing');
        }, 320);
      });
      card.addEventListener('mouseleave', function () { stopHoverPreview(card); });
    }

    card.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      openVideo(card);
    });
  });

  modalClose.addEventListener('click', closeVideo);
  videoModal.addEventListener('click', function (e) {
    if (e.target === videoModal) closeVideo();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeVideo();
  });
}

var instagramPreviewCards = document.querySelectorAll('.disc-card[href*="instagram.com/"][data-preview-src]');
if (instagramPreviewCards.length && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  instagramPreviewCards.forEach(function (card) {
    var thumb = card.querySelector('.thumb');
    var previewSrc = card.getAttribute('data-preview-src');
    if (!thumb || !previewSrc) return;

    card.addEventListener('mouseenter', function () {
      card._instagramPreviewTimer = setTimeout(function () {
        if (thumb.querySelector('.video-hover-player')) return;
        var preview = document.createElement('video');
        preview.className = 'video-hover-player';
        preview.src = previewSrc;
        preview.muted = true;
        preview.autoplay = true;
        preview.loop = true;
        preview.playsInline = true;
        preview.preload = 'auto';
        preview.setAttribute('aria-hidden', 'true');
        preview.setAttribute('tabindex', '-1');
        thumb.appendChild(preview);
        card.classList.add('is-previewing');
        preview.play().catch(function () {
          preview.remove();
          card.classList.remove('is-previewing');
        });
      }, 320);
    });

    card.addEventListener('mouseleave', function () {
      clearTimeout(card._instagramPreviewTimer);
      var preview = thumb.querySelector('.video-hover-player');
      if (preview) preview.remove();
      card.classList.remove('is-previewing');
    });
  });
}

document.addEventListener('error', function (e) {
  if (e.target.tagName === 'IMG') {
    var parent = e.target.closest('.thumb, .hero-ph');
    if (parent) parent.classList.add('img-fallback');
    e.target.remove();
  }
}, true);

document.querySelectorAll('.chip-row').forEach(function (chipRow) {
  var grid = document.getElementById(chipRow.getAttribute('data-grid'));
  if (!grid) return;
  chipRow.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;
    chipRow.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
    chip.classList.add('active');
    var filter = chip.getAttribute('data-filter');
    grid.querySelectorAll('.product-card').forEach(function (card) {
      var show = filter === 'all' || card.getAttribute('data-cat') === filter;
      card.classList.toggle('is-hidden', !show);
    });
  });
});

document.querySelectorAll('.look-gallery').forEach(function (gallery) {
  var viewport = gallery.querySelector('[data-look-gallery]');
  var slides = Array.from(gallery.querySelectorAll('.look-slide'));
  var thumbs = Array.from(gallery.querySelectorAll('[data-look-index]'));
  var previous = gallery.querySelector('[data-look-prev]');
  var next = gallery.querySelector('[data-look-next]');
  var activeIndex = 0;
  var scrollTimer;
  if (!viewport || !slides.length) return;

  function setActive(index, shouldScroll) {
    activeIndex = (index + slides.length) % slides.length;
    thumbs.forEach(function (thumb, thumbIndex) {
      var isActive = thumbIndex === activeIndex;
      thumb.classList.toggle('is-active', isActive);
      if (isActive) thumb.setAttribute('aria-current', 'true');
      else thumb.removeAttribute('aria-current');
    });
    if (shouldScroll) slides[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    slides.forEach(function (slide, slideIndex) {
      if (slideIndex !== activeIndex) {
        var video = slide.querySelector('video');
        if (video) video.pause();
      }
    });
  }

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      setActive(Number(thumb.getAttribute('data-look-index')), true);
    });
  });
  if (previous) previous.addEventListener('click', function () { setActive(activeIndex - 1, true); });
  if (next) next.addEventListener('click', function () { setActive(activeIndex + 1, true); });
  viewport.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); setActive(activeIndex - 1, true); }
    if (event.key === 'ArrowRight') { event.preventDefault(); setActive(activeIndex + 1, true); }
  });
  viewport.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      var index = Math.round(viewport.scrollLeft / viewport.clientWidth);
      setActive(Math.max(0, Math.min(index, slides.length - 1)), false);
    }, 90);
  }, { passive: true });
});

document.querySelectorAll('.share-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var url = window.location.href.split('#')[0] + btn.getAttribute('data-share-url');
    var title = btn.getAttribute('data-share-title') || document.title;
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        var original = btn.textContent;
        btn.textContent = 'Link copied!';
        setTimeout(function () { btn.textContent = original; }, 2000);
      }).catch(function () {});
    }
  });
});
});
