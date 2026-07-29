document.addEventListener('DOMContentLoaded', function () {
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
