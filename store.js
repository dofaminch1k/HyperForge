'use strict';

const $ = id => document.getElementById(id);
const paths = {
  arrow:'M4 12h15m-6-6 6 6-6 6', search:'M20 20l-5-5 M17 10a7 7 0 1 1-14 0 7 7 0 1 1 14 0',
  cart:'M2 3h3l2.6 12h11l2-9H6 M9 20h.01 M18 20h.01',
  filter:'M3 7h9m5 0h4M3 17h3m5 0h10 M12 4v6m-6 4v6',sort:'M3 6h17M3 12h12M3 18h7',
  all:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  pc:'M6 2h12v20H6z M9 6h6 M9 10h6 M11 18h2',
  gpu:'M2 6h20v11H2z M5 17v3h7v-3 M9 11a2 2 0 1 1-4 0 2 2 0 1 1 4 0 M19 11a2 2 0 1 1-4 0 2 2 0 1 1 4 0',
  cpu:'M5 5h14v14H5z M9 9h6v6H9z M9 2v3m6-3v3 M9 19v3m6-3v3 M2 9h3m-3 6h3m14-6h3m-3 6h3',
  board:'M4 2h16v20H4z M7 6h5v6H7z M15 5v8 M7 16h10 M7 19h10',
  ram:'M2 7h20v10H2z M5 10v4m4-4v4m4-4v4m4-4v4 M5 17v2m4-2v2m4-2v2m4-2v2',
  ssd:'M3 5h18v14H3z M6 15h5m5 0h2', psu:'M2 4h20v16H2z M14 12a4 4 0 1 1-8 0 4 4 0 1 1 8 0 M17 9h2m-2 4h2',
  case:'M6 2h12v20H6z M9 5h6m-6 3h6m-5 10h4',cooler:'M12 3a9 9 0 1 0 .01 0 M12 12q-8-4-5-6m5 6q4-8 6-5m-6 5q8 4 5 6m-5-6q-4 8-6 5'
};
const art = {'Gaming PCs':'pc','Graphics cards':'gpu',Processors:'cpu',Motherboards:'board',Memory:'ram',Storage:'ssd','Power supplies':'psu',Cases:'case',Cooling:'cooler'};
const icon = key => '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="'+(paths[key]||paths.all)+'"/></svg>';
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR'}).format(value);
const pic = product => './assets/'+(art[product.category]||'pc')+'.webp';
let products = [], cart = new Map(), category = 'All products', minPrice = '', maxPrice = '', timer;
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));

function notify(message) {
  clearTimeout(timer);
  $('toast').textContent = message;
  timer = setTimeout(()=>$('toast').textContent='',2300);
}
function updateCart(message) {
  const stored = saveCart(cart);
  $('badge').textContent = [...cart.values()].reduce((a,b)=>a+b,0);
  if (message || !stored) notify(stored ? message : 'Cart updated for this visit. Browser storage is unavailable.');
}
function add(id) {
  const quantity = cart.get(id) || 0;
  if (quantity >= 999) return notify('Maximum quantity reached.');
  cart.set(id,quantity+1);
  updateCart('Added to cart');
}
function categoryMenu() {
  $('categories').innerHTML = ['All products',...new Set(products.map(p=>p.category))].map(c=>
    `<button data-category="${esc(c)}" aria-pressed="${category===c}">${icon(art[c]||'all')}${esc(c)}</button>`).join('');
}
function render() {
  const term = $('search').value.trim().toLowerCase(), sort = $('sort').value;
  const visible = products.filter(p=>(category==='All products'||category===p.category) && p.name.toLowerCase().includes(term)
    && (minPrice==='' || p.price>=Number(minPrice)) && (maxPrice==='' || p.price<=Number(maxPrice)));
  const sorts = {low:(a,b)=>a.price-b.price,high:(a,b)=>b.price-a.price,az:(a,b)=>a.name.localeCompare(b.name),za:(a,b)=>b.name.localeCompare(a.name)};
  if (sorts[sort]) visible.sort(sorts[sort]);
  $('reset').hidden = !(term || category!=='All products' || minPrice!=='' || maxPrice!=='' || sort!=='featured');
  $('count').textContent = visible.length+' product'+(visible.length===1?'':'s');
  $('priceOpen').innerHTML = icon('filter') + (minPrice!==''||maxPrice!=='' ? 'Price: '+(minPrice||'0')+'–'+(maxPrice||'∞')+' €':'Price filter');
  $('grid').innerHTML = visible.map(p=>`<article class="card"><div class="shot"><img data-category="${esc(p.category)}" src="${pic(p)}" loading="lazy" alt=""><span class="type">${esc(p.category)}</span></div><div class="cardBody"><h3 style="margin:0"><button class="titleButton" data-detail="${esc(p.id)}">${esc(p.name)}</button></h3><p>${p.specs.slice(0,3).map(esc).join(' · ')||'Specifications unavailable'}</p><div class="buyrow"><strong>${money(p.price)}</strong><button class="add" data-add="${esc(p.id)}">${icon('cart')}Add to cart</button></div></div></article>`).join('') ||
    '<div class="empty"><h3>No products found</h3><p>Try another name or clear your filters.</p><button class="primary" data-reset>Reset filters</button></div>';
}
function reset() {
  category='All products'; minPrice=''; maxPrice=''; $('search').value=''; $('sort').value='featured';
  categoryMenu(); render();
}
function drawCart() {
  const rows = products.filter(p=>cart.has(p.id));
  const total = rows.reduce((sum,p)=>sum+Math.round(p.price*100)*cart.get(p.id),0)/100;
  $('cartBody').innerHTML = rows.map(p=>{
    const n=cart.get(p.id);
    return `<div class="line"><img data-category="${esc(p.category)}" src="${pic(p)}" alt=""><div><p>${esc(p.name)}</p><small>${money(p.price)} each · ${money(Math.round(p.price*100)*n/100)}</small><div class="qty"><button data-act="minus" data-id="${esc(p.id)}" aria-label="Decrease quantity of ${esc(p.name)}" ${n===1?'disabled':''}>−</button><span>${n}</span><button data-act="plus" data-id="${esc(p.id)}" aria-label="Increase quantity of ${esc(p.name)}" ${n>=999?'disabled':''}>+</button><button class="link" data-act="remove" data-id="${esc(p.id)}" aria-label="Remove ${esc(p.name)}">Remove</button></div></div></div>`;
  }).join('') + (rows.length ? `<p class="total"><b>Total</b><strong>${money(total)}</strong></p><button class="link" data-act="clear">Clear cart</button>`:
    '<h3>Your cart is empty</h3><p>Explore the catalog to find your first item.</p><button class="primary" data-act="browse">Browse catalog</button>');
}
function openDetail(id) {
  const p=products.find(item=>item.id===id);
  $('detailBody').innerHTML=`<img data-category="${esc(p.category)}" class="detailImg" src="${pic(p)}" alt="Illustration of the product category"><p class="type">${esc(p.category)}</p><h2 id="detailTitle">${esc(p.name)}</h2><ul>${(p.specs.length?p.specs:['Specifications unavailable']).map(s=>'<li>'+esc(s)+'</li>').join('')}</ul><div class="buyrow"><strong>${money(p.price)}</strong><button class="primary" data-add="${esc(id)}">Add to cart</button></div><p class="note">Demo price · Illustrative image</p>`;
  $('detail').showModal();
}
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.querySelector('.close').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{
    const box=dialog.getBoundingClientRect();
    if(e.target===dialog && (e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)) dialog.close();
  });
});
$('categories').onclick=e=>{
  const b=e.target.closest('[data-category]');
  if (!b) return;
  category=b.dataset.category;
  for(const el of $('categories').children) el.setAttribute('aria-pressed',el===b);
  render();
};
document.addEventListener('click',e=>{
  const b=e.target.closest('button');
  if (!b) return;
  if (b.hasAttribute('data-reset')) {reset(); $('categories').firstElementChild.focus();}
  if (b.dataset.add) {
    add(b.dataset.add);
    if ($('detail').open) $('detail').close();
  }
  if (b.dataset.detail) openDetail(b.dataset.detail);
});
$('cartOpen').onclick=()=>{drawCart();$('cart').showModal();};
$('cartBody').onclick=e=>{
  const b=e.target.closest('[data-act]');
  if(!b) return;
  const {act,id}=b.dataset;
  if(act==='browse'){ $('cart').close(); location.hash='catalog'; $('categories').firstElementChild?.focus(); return; }
  if(act==='clear') cart.clear();
  if(act==='remove') cart.delete(id);
  if(act==='plus' || act==='minus') cart.set(id,Math.max(1,Math.min(999,cart.get(id)+(act==='plus'?1:-1))));
  updateCart(); drawCart();
  const next=[...$('cartBody').querySelectorAll('button')].find(el=>el.dataset.act===act&&el.dataset.id===id&&!el.disabled);
  (next || $('cartBody').querySelector('button:not(:disabled)')).focus();
};
$('search').oninput=render;
$('searchForm').onsubmit=e=>{e.preventDefault();$('catalog').scrollIntoView();};
$('sort').onchange=render; $('reset').onclick=reset;
$('priceOpen').onclick=()=>{$('min').value=minPrice;$('max').value=maxPrice;$('max').setCustomValidity('');$('prices').showModal();};
$('priceForm').oninput=()=>$('max').setCustomValidity('');
$('priceForm').onsubmit=e=>{
  e.preventDefault();
  const min=$('min').value,max=$('max').value;
  if(min && max && Number(max)<Number(min)){ $('max').setCustomValidity('Maximum must be at least the minimum.'); $('max').reportValidity(); return; }
  minPrice=min;maxPrice=max;$('prices').close();render();
};
try {
  products=getProducts();
  cart=readCart(products); updateCart(); categoryMenu(); render();
  window.addEventListener('storage',()=>{cart=readCart(products);$('badge').textContent=[...cart.values()].reduce((a,b)=>a+b,0);if($('cart').open)drawCart();});
} catch {
  $('count').textContent='Could not load the catalog.';
  $('grid').innerHTML='<p><a class="primary" href="">Reload catalog</a></p>';
}

