(function () {
  function ensureContainer() {
    let c = document.getElementById('toast');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast';
      c.setAttribute('aria-live', 'polite');
      c.setAttribute('aria-atomic', 'true');
      document.body.appendChild(c);
    }
    return c;
  }

  function showToast(message, type) {
    const container = ensureContainer();
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : ' info');
    el.textContent = message;
    container.appendChild(el);

    requestAnimationFrame(() => {
      el.classList.add('show');
    });

    const ttl = 3000;
    setTimeout(() => {
      el.classList.remove('show');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
    }, ttl);
  }

  window.showToast = showToast;
})();
