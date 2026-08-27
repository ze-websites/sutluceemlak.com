
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
