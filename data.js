const key = 'voltforge.cart.v1';

function getProducts() {
  return hyperForgeProducts;
}

function readCart(products) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return new Map();
    return new Map(products.filter(({id}) => Number.isInteger(saved[id]) && saved[id] > 0 && saved[id] <= 999)
      .map(({id}) => [id, saved[id]]));
  } catch { return new Map(); }
}

function saveCart(cart) {
  try {
    localStorage.setItem(key, JSON.stringify(Object.fromEntries(cart)));
    return true;
  } catch { return false; }
}

