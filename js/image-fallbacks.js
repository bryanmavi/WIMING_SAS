window.addEventListener('error', (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || image.dataset.fallbackUsed) return;

  const fallback = image.dataset.fallback;
  if (!fallback) return;

  image.dataset.fallbackUsed = 'true';
  image.src = fallback;
}, true);