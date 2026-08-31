
document.querySelectorAll('[data-menu]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const nav=document.querySelector('.navlinks');
    if(!nav) return;
    const open=nav.style.display==='flex';
    nav.style.display=open?'none':'flex';
    if(!open){
      Object.assign(nav.style,{position:'absolute',left:'18px',right:'18px',top:'72px',background:'#fff',
      padding:'18px',border:'1px solid #e5e7eb',borderRadius:'16px',flexDirection:'column',alignItems:'stretch',
      boxShadow:'0 14px 45px rgba(17,24,39,.12)'});
    }
  })
});

const filterInputs = document.querySelectorAll('[data-filter]');
filterInputs.forEach(input => input.addEventListener('change', () => {
  const status = document.querySelector('[data-filter="status"]')?.value || '';
  const type = document.querySelector('[data-filter="type"]')?.value || '';
  let visible = 0;
  document.querySelectorAll('[data-listings] > div').forEach(item => {
    const show = (!status || item.dataset.status === status) && (!type || item.dataset.type === type);
    item.hidden = !show;
    if (show) visible++;
  });
  const empty = document.querySelector('[data-empty]');
  if (empty) empty.hidden = visible !== 0;
}));

document.querySelectorAll('[data-whatsapp-form]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const message = [
      `Merhaba, ben ${data.get('name')}.`,
      `Konu: ${data.get('subject')}`,
      data.get('phone') ? `Telefon: ${data.get('phone')}` : '',
      data.get('email') ? `E-posta: ${data.get('email')}` : '',
      `Mesaj: ${data.get('message')}`
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${form.dataset.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });
});

document.querySelectorAll('[data-gallery]').forEach(gallery => {
  const thumbs = [...gallery.querySelectorAll('[data-gallery-thumb]')];
  const sources = thumbs.length ? thumbs.map(thumb => thumb.dataset.src) : [gallery.querySelector('[data-gallery-main]').src];
  const mainImage = gallery.querySelector('[data-gallery-main]');
  const count = gallery.querySelector('[data-gallery-count]');
  const lightbox = gallery.nextElementSibling?.matches('[data-lightbox]') ? gallery.nextElementSibling : null;
  const lightboxImage = lightbox?.querySelector('[data-lightbox-image]');
  const lightboxCount = lightbox?.querySelector('[data-lightbox-count]');
  let current = 0;

  const show = index => {
    current = (index + sources.length) % sources.length;
    mainImage.src = sources[current];
    mainImage.alt = `${gallery.dataset.title} fotoğrafı ${current + 1}`;
    if (lightboxImage) {
      lightboxImage.src = sources[current];
      lightboxImage.alt = mainImage.alt;
    }
    if (count) count.textContent = `${current + 1} / ${sources.length}`;
    if (lightboxCount) lightboxCount.textContent = `${current + 1} / ${sources.length}`;
    thumbs.forEach((thumb, index) => {
      thumb.classList.toggle('active', index === current);
      thumb.setAttribute('aria-current', index === current ? 'true' : 'false');
    });
    thumbs[current]?.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
  };

  thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => show(index)));
  document.querySelectorAll('[data-gallery-prev]').forEach(button => {
    if (gallery.contains(button) || lightbox?.contains(button)) button.addEventListener('click', () => show(current - 1));
  });
  document.querySelectorAll('[data-gallery-next]').forEach(button => {
    if (gallery.contains(button) || lightbox?.contains(button)) button.addEventListener('click', () => show(current + 1));
  });

  gallery.querySelector('[data-gallery-open]')?.addEventListener('click', () => {
    if (!lightbox) return;
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    lightbox.querySelector('[data-lightbox-close]')?.focus();
  });
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
    gallery.querySelector('[data-gallery-open]')?.focus();
  };
  lightbox?.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (!lightbox || lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });
});
