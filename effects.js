/* Vanilla adaptations of the React Bits Pixel Card and Cursor Grid interactions.
   https://github.com/DavidHDev/react-bits/tree/main/src/content */
const catalog = document.querySelector('#grid');
const motion = matchMedia('(prefers-reduced-motion: no-preference)');
const finePointer = matchMedia('(any-hover: hover) and (any-pointer: fine)');
const cellSize = 24;
const radius = 40;
const lineWidth = 0.8;
const colors = ['#56fa8a', '#99ffbb', '#30c773'];
const activeCards = new Map();

function reveal(card) {
  if (!motion.matches || activeCards.has(card)) return;
  const shot = card.querySelector('.shot');
  const canvas = document.createElement('canvas');
  canvas.className = 'pixel-field';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const width = shot.clientWidth, height = shot.clientHeight;
  const scale = Math.min(devicePixelRatio, 2);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  ctx.scale(scale, scale);
  shot.prepend(canvas);
  const dots = [];
  const reach = Math.hypot(width, height) / 2 || 1;
  for (let y = 4; y < height; y += 8) {
    for (let x = 4; x < width; x += 8) {
      dots.push({x, y, delay: 430 * Math.hypot(x-width/2, y-height/2) / reach,
        size: 1 + Math.random()*2, phase: Math.random()*Math.PI*2,
        color: colors[Math.floor(Math.random()*colors.length)]});
    }
  }
  const started = performance.now();
  const state = {frame: 0, canvas};
  activeCards.set(card, state);
  function paint(now) {
    if (!card.isConnected || !motion.matches || document.hidden ||
        !(card.matches(':focus-within') || (finePointer.matches && card.matches(':hover')))) {
      activeCards.delete(card);
      canvas.classList.add('leaving');
      setTimeout(() => canvas.remove(), 200);
      return;
    }
    ctx.clearRect(0, 0, width, height);
    for (const dot of dots) {
      const reveal = Math.min(1, Math.max(0, (now-started-dot.delay)/135));
      if (!reveal) continue;
      const pulse = (1 + Math.sin(now/420 + dot.phase))/2;
      const size = dot.size * reveal * (0.65 + 0.35*pulse);
      ctx.fillStyle = dot.color;
      ctx.globalAlpha = 0.22 + 0.46*pulse;
      ctx.fillRect(dot.x-size/2, dot.y-size/2, size, size);
    }
    state.frame = requestAnimationFrame(paint);
  }
  state.frame = requestAnimationFrame(paint);
}
catalog.addEventListener('pointerover', e => {
  const card = e.target.closest('.card');
  if (card && finePointer.matches && e.pointerType !== 'touch') reveal(card);
});
catalog.addEventListener('focusin', e => {
  const card = e.target.closest('.card');
  if (card && e.target.matches(':focus-visible')) reveal(card);
});

const trail = document.createElement('div');
trail.className = 'cursor-grid';
trail.setAttribute('aria-hidden', 'true');
document.body.append(trail);
const cells = new Map();
let pending = 0, x = 0, y = 0;
function clearTrail() {
  cancelAnimationFrame(pending);
  pending = 0;
  cells.forEach(({animation}) => animation.cancel());
  cells.clear();
  trail.replaceChildren();
}
function lightCells() {
  pending = 0;
  for (let row = Math.floor((y-radius)/cellSize); row <= Math.floor((y+radius)/cellSize); row++) {
    for (let col = Math.floor((x-radius)/cellSize); col <= Math.floor((x+radius)/cellSize); col++) {
      const left = col*cellSize, top = row*cellSize;
      const strength = 1 - Math.hypot(left+cellSize/2-x, top+cellSize/2-y)/radius;
      if (strength <= 0) continue;
      const key = col+','+row;
      let tile = cells.get(key)?.tile;
      if (!tile) {
        tile = document.createElement('i');
        tile.style.cssText = 'left:'+left+'px;top:'+top+'px;width:'+cellSize+'px;height:'+cellSize+'px;outline-width:'+lineWidth+'px';
        trail.append(tile);
      } else cells.get(key).animation.cancel();
      const animation = tile.animate([{opacity:strength},{opacity:0}], {duration:540, easing:'ease-out', fill:'forwards'});
      cells.set(key, {tile, animation});
      animation.onfinish = () => {
        if (cells.get(key)?.animation !== animation) return;
        cells.delete(key);
        tile.remove();
      };
    }
  }
}
document.addEventListener('pointermove', e => {
  if (!motion.matches || !finePointer.matches || e.pointerType === 'touch' || e.target.closest('dialog')) return;
  x=e.clientX; y=e.clientY;
  if (!pending) pending=requestAnimationFrame(lightCells);
}, {passive:true});
document.documentElement.addEventListener('pointerleave',clearTrail);
window.addEventListener('blur',clearTrail);
motion.addEventListener('change',clearTrail);
finePointer.addEventListener('change',clearTrail);
