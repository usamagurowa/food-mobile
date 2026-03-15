async function fetchMenu(){
  const res = await fetch('/api/menu');
  return res.json();
}

const cart = {};
function renderMenu(items){
  const el = document.getElementById('menu-list');
  el.innerHTML = '';
  items.forEach(item=>{
    const card = document.createElement('div'); card.className='card';
    // create img element to attach onload/onerror
    const img = document.createElement('img'); img.className='thumb'; img.alt = item.name;
    img.loading = 'lazy';
    img.src = item.image || 'images/placeholder.svg';
    const title = document.createElement('div'); title.className='name'; title.textContent = item.name;
    const meta = document.createElement('div'); meta.className='meta'; meta.textContent = '#'+item.price;
    const row = document.createElement('div'); row.className='row';
    const addBtn = document.createElement('button'); addBtn.className='btn add'; addBtn.dataset.id = item.id; addBtn.textContent = 'Add';
    row.appendChild(addBtn);
    card.appendChild(img); card.appendChild(title); card.appendChild(meta); card.appendChild(row);
    el.appendChild(card);
  });
  el.querySelectorAll('.add').forEach(b=>b.addEventListener('click',()=>{ addToCart(+b.dataset.id); }));
  // attach image load handlers and error fallback
  el.querySelectorAll('.thumb').forEach((img, index)=>{
    img.onload = ()=> img.classList.add('loaded');
    img.onerror = ()=> { img.src = 'images/placeholder.svg'; img.classList.add('loaded'); };
    img.addEventListener('click', () => { showItemModal(items[index].image, items[index].name); });
  });
}

function addToCart(id){ cart[id] = (cart[id]||0)+1; renderCart(); animateAddButton(id); }
function animateAddButton(id){
  const btn = document.querySelector(`button.add[data-id="${id}"]`);
  if(!btn) return;
  btn.classList.add('bounce');
  setTimeout(()=>btn.classList.remove('bounce'),360);
  showToast('Added to cart');
}
function removeFromCart(id){ if(!cart[id]) return; cart[id]--; if(cart[id]===0) delete cart[id]; renderCart(); }

function renderCart(){
  const list = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  list.innerHTML = '';
  let total = 0;
  for(const idS of Object.keys(cart)){
    const id = +idS; const qty = cart[id];
    // find name/price from last fetched menu stored on window
    const item = (window.__MENU__||[]).find(m=>m.id===id) || {name:'Item',price:0};
    total += item.price * qty;
    const li = document.createElement('li');
    li.innerHTML = `${item.name} x ${qty} <button class="btn rm" data-id="${id}">-</button> <span style="float:right">#${(item.price*qty).toFixed(2)}</span>`;
    list.appendChild(li);
  }
  totalEl.textContent = total.toFixed(2);
  document.getElementById('checkout').disabled = Object.keys(cart).length===0;
  document.querySelectorAll('.rm').forEach(b=>b.addEventListener('click',()=>removeFromCart(+b.dataset.id)));
}

document.getElementById('checkout').addEventListener('click', ()=>{
  document.getElementById('order-modal').classList.add('active');
});

document.getElementById('cancel').addEventListener('click', ()=>{
  document.getElementById('order-modal').classList.remove('active');
});

document.getElementById('order-form').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const form = new FormData(e.target);
  const customer = {name:form.get('name'), phone:form.get('phone'), address:form.get('address')};
  const items = Object.keys(cart).map(id=>({id:+id, qty:cart[id]}));
  const total = parseFloat(document.getElementById('cart-total').textContent)||0;
  const order = {customer, items, total};
  try{
    const res = await fetch('/api/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(order)});
    if(!res.ok) throw new Error('network');
    const saved = await res.json();
    document.getElementById('order-result').textContent = 'Order placed! id: '+saved.id;
    // clear
    for(const k of Object.keys(cart)) delete cart[k]; renderCart();
    setTimeout(()=>{ document.getElementById('order-modal').classList.remove('active'); document.getElementById('order-result').textContent=''; },3000);
  }catch(err){
    document.getElementById('order-result').textContent = 'Failed to send order. Try again later.';
  }
});

// init
(async ()=>{
  const menu = await fetchMenu();
  window.__MENU__ = menu;
  renderMenu(menu);
  renderCart();
})();

function showItemModal(imageSrc, name) {
  const modal = document.getElementById('item-modal');
  const img = document.getElementById('item-image');
  img.src = imageSrc;
  img.alt = name;
  modal.classList.add('active');
}

document.getElementById('close-item-modal').addEventListener('click', () => {
  document.getElementById('item-modal').classList.remove('active');
});

/* toast implementation */
function showToast(msg){
  let t = document.querySelector('.toast');
  if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),1200);
}

// ensure images load nicely: add fade in
document.addEventListener('click', (e)=>{
  if(e.target.matches('.add')) e.target.focus();
});
