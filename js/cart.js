const CART_KEY = "sokohubCart";
let toastTimer;

function formatPrice(amount) {
  return "$" + amount.toFixed(2);
}

function showToast(message) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function getCartCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
  return getCart().reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    return product ? total + product.price * item.quantity : total;
  }, 0);
}
const FREE_DELIVERY_THRESHOLD = 50;
const DELIVERY_FEE = 4.99;

function getDeliveryFee(subtotal) {
  if (subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD) {
    return 0;
  }
  return DELIVERY_FEE;
}
function getCartItems() {
  return getCart()
    .map(entry => ({
      product: products.find(product => product.id === entry.productId),
      quantity: entry.quantity
    }))
    .filter(item => item.product);
}

function addToCart(productId, quantity = 1) {
  const product = products.find(p => p.id === productId);

  if (!product || product.stock === 0) {
    showToast("Sorry, this product is out of stock.");
    return false;
  }

  const cart = getCart();
  const existing = cart.find(item => item.productId === productId);
  const currentQty = existing ? existing.quantity : 0;

  if (currentQty + quantity > product.stock) {
    showToast("Only " + product.stock + " in stock.");
    return false;
  }

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId: productId, quantity: quantity });
  }

  saveCart(cart);
  showToast(product.name + " added to cart");
  return true;
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.productId !== productId);
  saveCart(cart);
}

function updateQuantity(productId, quantity) {
  const product = products.find(p => p.id === productId);
  const cart = getCart();
  const item = cart.find(entry => entry.productId === productId);

  if (!item || !product) return;

  if (quantity < 1) {
    removeFromCart(productId);
    return;
  }

  item.quantity = Math.min(quantity, product.stock);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function updateCartCount() {
  const count = getCartCount();

  document.querySelectorAll(".cart-count").forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  });
}

updateCartCount();
window.addEventListener("pageshow", updateCartCount);