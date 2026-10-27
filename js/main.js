// ===== 1. NAVBAR: MOBILE MENU AND ACTIVE LINK =====

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

const pageMap = {
  "product-details.html": "products.html",
  "vendor-store.html": "vendors.html"
};

let currentPage = window.location.pathname.split("/").pop() || "index.html";

if (pageMap[currentPage]) {
  currentPage = pageMap[currentPage];
}

document.querySelectorAll(".nav-links a").forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});
// ===== 2. SHARED HELPERS =====

const categoryIcons = {
  "Electronics": "🎧",
  "Fashion": "👗",
  "Home & Living": "🏡",
  "Beauty & Care": "🧴",
  "Sports & Fitness": "🏋️"
};

function renderStars(rating) {
  const filled = Math.round(rating);
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

function getVendor(vendorId) {
  return vendors.find(vendor => vendor.id === vendorId);
}

function createProductCard(product) {
  const vendor = getVendor(product.vendorId);
  const outOfStock = product.stock === 0;

  let badge = "";
  if (outOfStock) {
    badge = `<span class="badge badge-out">Out of Stock</span>`;
  } else if (product.oldPrice) {
    const discount = Math.round((1 - product.price / product.oldPrice) * 100);
    badge = `<span class="badge badge-sale">-${discount}%</span>`;
  }

  const oldPrice = product.oldPrice
    ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>`
    : "";

  let stockText = `<span class="stock in-stock">In stock</span>`;
  if (outOfStock) {
    stockText = `<span class="stock out-stock">Out of stock</span>`;
  } else if (product.stock <= 10) {
    stockText = `<span class="stock low-stock">Only ${product.stock} left</span>`;
  }

  return `
    <article class="product-card">
      <a href="product-details.html?id=${product.id}" class="product-image">
        ${badge}
        <img src="${product.images[0]}" alt="${product.name}">
      </a>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3><a href="product-details.html?id=${product.id}">${product.name}</a></h3>
        <p class="product-vendor">by <a href="vendor-store.html?id=${vendor.id}">${vendor.name}</a></p>
        <p class="product-rating"><span class="stars">${renderStars(product.rating)}</span> ${product.rating} (${product.reviewCount})</p>
        <div class="product-price"><strong>${formatPrice(product.price)}</strong>${oldPrice}</div>
        ${stockText}
        <button class="btn btn-primary btn-sm" data-add-to-cart="${product.id}" ${outOfStock ? "disabled" : ""}>
          ${outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </article>
  `;
}

function createVendorCard(vendor) {
  const productCount = products.filter(product => product.vendorId === vendor.id).length;

  const categoryTags = vendor.categories
    .map(category => `<span class="tag">${category}</span>`)
    .join("");

  return `
    <article class="vendor-card">
      <img src="${vendor.logo}" alt="${vendor.name} logo" class="vendor-logo">
      <h3>${vendor.name}</h3>
      <p class="vendor-rating"><span class="stars">${renderStars(vendor.rating)}</span> ${vendor.rating} (${vendor.reviews} reviews)</p>
      <p class="vendor-desc">${vendor.description}</p>
      <div class="tag-list">${categoryTags}</div>
      <p class="vendor-count">${productCount} product${productCount === 1 ? "" : "s"} available</p>
      <a href="vendor-store.html?id=${vendor.id}" class="btn btn-outline btn-sm">Visit Store</a>
    </article>
  `;
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-add-to-cart]");

  if (button) {
    addToCart(Number(button.dataset.addToCart));
  }
});


// ===== 3. HOMEPAGE =====

const statVendors = document.getElementById("stat-vendors");
const statProducts = document.getElementById("stat-products");
const statCategories = document.getElementById("stat-categories");

if (statVendors && statProducts && statCategories) {
  statVendors.textContent = vendors.length;
  statProducts.textContent = products.length;
  statCategories.textContent = categories.length;
}

const categoryGrid = document.getElementById("category-grid");

if (categoryGrid) {
  categoryGrid.innerHTML = categories
    .map(category => {
      const count = products.filter(product => product.category === category).length;

      return `
        <a href="products.html?category=${encodeURIComponent(category)}" class="category-card">
          <span class="category-icon">${categoryIcons[category]}</span>
          <h3>${category}</h3>
          <p>${count} product${count === 1 ? "" : "s"}</p>
        </a>
      `;
    })
    .join("");
}

const featuredProducts = document.getElementById("featured-products");

if (featuredProducts) {
  featuredProducts.innerHTML = products
    .filter(product => product.featured)
    .slice(0, 4)
    .map(createProductCard)
    .join("");
}

const topVendors = document.getElementById("top-vendors");

if (topVendors) {
  topVendors.innerHTML = [...vendors]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
    .map(createVendorCard)
    .join("");
}

// ===== 4. VENDORS PAGE =====

const vendorList = document.getElementById("vendor-list");

if (vendorList) {
  const vendorSearch = document.getElementById("vendor-search");
  const vendorCount = document.getElementById("vendor-count");
  const noVendors = document.getElementById("no-vendors");

  function showVendors() {
    const searchText = vendorSearch.value.toLowerCase().trim();

    const filtered = vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(searchText)
    );

    vendorList.innerHTML = filtered.map(createVendorCard).join("");
    vendorCount.textContent = filtered.length + " vendor(s) found";
    noVendors.style.display = filtered.length === 0 ? "block" : "none";
  }

  vendorSearch.addEventListener("input", showVendors);

  showVendors();
}

// ===== 5. PRODUCTS PAGE =====

const productList = document.getElementById("product-list");

if (productList) {
  const productSearch = document.getElementById("product-search");
  const categoryFilter = document.getElementById("category-filter");
  const priceFilter = document.getElementById("price-filter");
  const sortSelect = document.getElementById("sort-select");
  const resetButton = document.getElementById("reset-filters");
  const productCount = document.getElementById("product-count");
  const noProducts = document.getElementById("no-products");

  const priceRanges = {
    all: [0, Infinity],
    under25: [0, 25],
    "25to50": [25, 50],
    "50to75": [50, 75],
    over75: [75, Infinity]
  };

  categoryFilter.innerHTML =
    `<option value="all">All Categories</option>` +
    categories.map(category => `<option value="${category}">${category}</option>`).join("");

  const urlParams = new URLSearchParams(window.location.search);
  const urlSearch = urlParams.get("search");
  const urlCategory = urlParams.get("category");

  if (urlSearch) {
    productSearch.value = urlSearch;
  }

  if (urlCategory && categories.includes(urlCategory)) {
    categoryFilter.value = urlCategory;
  }

  function showProducts() {
    const searchText = productSearch.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const [minPrice, maxPrice] = priceRanges[priceFilter.value];
    const sortBy = sortSelect.value;

    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchText);
      const matchesCategory = category === "all" || product.category === category;
      const matchesPrice = product.price >= minPrice && product.price < maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sortBy === "popularity") {
      filtered.sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    }

    productList.innerHTML = filtered.map(createProductCard).join("");
    productCount.textContent = filtered.length + " product(s) found";
    noProducts.style.display = filtered.length === 0 ? "block" : "none";
  }

  productSearch.addEventListener("input", showProducts);
  categoryFilter.addEventListener("change", showProducts);
  priceFilter.addEventListener("change", showProducts);
  sortSelect.addEventListener("change", showProducts);

  resetButton.addEventListener("click", () => {
    productSearch.value = "";
    categoryFilter.value = "all";
    priceFilter.value = "all";
    sortSelect.value = "popularity";
    showProducts();
  });

  showProducts();
}

// ===== 6. PRODUCT DETAILS PAGE =====

const productDetails = document.getElementById("product-details");

if (productDetails) {
  const detailParams = new URLSearchParams(window.location.search);
  const productId = Number(detailParams.get("id"));
  const product = products.find(item => item.id === productId);

  if (!product) {
    productDetails.innerHTML = `
      <p class="no-results">
        Product not found.
        <a href="products.html" class="view-all">Browse all products &rarr;</a>
      </p>
    `;
  } else {
    const vendor = getVendor(product.vendorId);
    const vendorProductCount = products.filter(item => item.vendorId === vendor.id).length;
    const outOfStock = product.stock === 0;

    document.title = product.name + " | SokoHub";

    const thumbnails = product.images
      .map((src, index) => `
        <button type="button" class="thumb ${index === 0 ? "active" : ""}" data-image="${src}" aria-label="Show image ${index + 1}">
          <img src="${src}" alt="${product.name}, view ${index + 1}">
        </button>
      `)
      .join("");

    const specsList = product.specs
      .map(spec => {
        const [label, value] = spec.split(": ");
        return `<li><span>${label}</span><strong>${value}</strong></li>`;
      })
      .join("");

    const reviewsHtml = sampleReviews
      .map(review => `
        <div class="review">
          <div class="review-head">
            <strong>${review.name}</strong>
            <span class="stars">${renderStars(review.rating)}</span>
          </div>
          <p>${review.comment}</p>
        </div>
      `)
      .join("");

    let priceHtml = `<span class="detail-price">${formatPrice(product.price)}</span>`;

    if (product.oldPrice) {
      const savings = product.oldPrice - product.price;
      const discount = Math.round((savings / product.oldPrice) * 100);

      priceHtml += `
        <span class="old-price">${formatPrice(product.oldPrice)}</span>
        <span class="save-tag">Save ${formatPrice(savings)} (${discount}%)</span>
      `;
    }

    let stockHtml = `<span class="stock in-stock">In stock (${product.stock} available)</span>`;

    if (outOfStock) {
      stockHtml = `<span class="stock out-stock">Out of stock</span>`;
    } else if (product.stock <= 10) {
      stockHtml = `<span class="stock low-stock">Only ${product.stock} left in stock</span>`;
    }

    const purchaseHtml = outOfStock
      ? `<div class="purchase">
           <button type="button" class="btn btn-primary" disabled>Out of Stock</button>
         </div>`
      : `<div class="purchase">
           <div class="qty-control">
             <button type="button" id="qty-minus" aria-label="Decrease quantity">&minus;</button>
             <input type="number" id="qty-input" value="1" min="1" max="${product.stock}" aria-label="Quantity">
             <button type="button" id="qty-plus" aria-label="Increase quantity">+</button>
           </div>
           <button type="button" class="btn btn-primary" id="add-to-cart-btn">Add to Cart</button>
         </div>`;

    productDetails.innerHTML = `
      <div class="detail-layout">

        <div class="gallery">
          <div class="main-image-wrap">
            <img id="main-image" src="${product.images[0]}" alt="${product.name}">
          </div>
          <div class="thumbs">${thumbnails}</div>
        </div>

        <div class="detail-info">
          <p class="product-category">${product.category}</p>
          <h1>${product.name}</h1>
          <p class="product-vendor">Sold by <a href="vendor-store.html?id=${vendor.id}">${vendor.name}</a></p>
          <p class="product-rating"><span class="stars">${renderStars(product.rating)}</span> ${product.rating} (${product.reviewCount} reviews)</p>
          <div class="detail-price-row">${priceHtml}</div>
          <p>${stockHtml}</p>
          <p class="detail-summary">${product.description}</p>
          ${purchaseHtml}
          <ul class="perks">
            <li>🚚 Free delivery on orders over $50</li>
            <li>📍 Ships from ${vendor.location}</li>
          </ul>
        </div>

      </div>

      <div class="detail-sections">

        <div class="detail-card">
          <h2>Specifications</h2>
          <ul class="specs-list">${specsList}</ul>
        </div>

        <div class="detail-card">
          <h2>About the Vendor</h2>
          <div class="vendor-mini">
            <img src="${vendor.logo}" alt="${vendor.name} logo" class="vendor-logo">
            <div>
              <h3>${vendor.name}</h3>
              <p class="vendor-rating"><span class="stars">${renderStars(vendor.rating)}</span> ${vendor.rating} (${vendor.reviews} reviews)</p>
            </div>
          </div>
          <p class="vendor-desc">${vendor.description}</p>
          <ul class="vendor-facts">
            <li><span>Location</span><strong>${vendor.location}</strong></li>
            <li><span>Member since</span><strong>${vendor.joined}</strong></li>
            <li><span>Products</span><strong>${vendorProductCount}</strong></li>
          </ul>
          <a href="vendor-store.html?id=${vendor.id}" class="btn btn-outline btn-sm">Visit Store</a>
        </div>

      </div>

      <div class="detail-card reviews-card">
        <h2>Customer Reviews</h2>
        <div class="reviews-summary">
          <span class="rating-big">${product.rating}</span>
          <div>
            <span class="stars">${renderStars(product.rating)}</span><br>
            <span class="vendor-desc">Based on ${product.reviewCount} reviews</span>
          </div>
        </div>
        <div class="review-grid">${reviewsHtml}</div>
      </div>
    `;

    // Image gallery: clicking a thumbnail changes the main picture
    const mainImage = document.getElementById("main-image");
    const thumbButtons = document.querySelectorAll(".thumb");

    thumbButtons.forEach(thumb => {
      thumb.addEventListener("click", () => {
        mainImage.src = thumb.dataset.image;
        thumbButtons.forEach(other => other.classList.remove("active"));
        thumb.classList.add("active");
      });
    });

    // Quantity selector and Add to Cart
    const qtyInput = document.getElementById("qty-input");

    if (qtyInput) {
      function fixQuantity() {
        let value = parseInt(qtyInput.value, 10);

        if (isNaN(value) || value < 1) {
          value = 1;
        }
        if (value > product.stock) {
          value = product.stock;
        }

        qtyInput.value = value;
        return value;
      }

      document.getElementById("qty-minus").addEventListener("click", () => {
        qtyInput.value = Number(qtyInput.value) - 1;
        fixQuantity();
      });

      document.getElementById("qty-plus").addEventListener("click", () => {
        qtyInput.value = Number(qtyInput.value) + 1;
        fixQuantity();
      });

      qtyInput.addEventListener("change", fixQuantity);

      document.getElementById("add-to-cart-btn").addEventListener("click", () => {
        addToCart(product.id, fixQuantity());
      });
    }

    // More products from the same vendor
    const moreFromVendor = products.filter(
      item => item.vendorId === vendor.id && item.id !== product.id
    );

    if (moreFromVendor.length > 0) {
      document.getElementById("related-title").textContent = "More from " + vendor.name;
      document.getElementById("related-products").innerHTML = moreFromVendor
        .map(createProductCard)
        .join("");
      document.getElementById("related-section").style.display = "block";
    }
  }
}
// ===== 7. VENDOR STORE PAGE =====

const vendorStore = document.getElementById("vendor-store");

if (vendorStore) {
  const storeParams = new URLSearchParams(window.location.search);
  const storeId = Number(storeParams.get("id"));
  const store = vendors.find(vendor => vendor.id === storeId);

  if (!store) {
    vendorStore.innerHTML = `
      <section class="section container">
        <p class="no-results">
          Vendor not found.
          <a href="vendors.html" class="view-all">Browse all vendors &rarr;</a>
        </p>
      </section>
    `;
  } else {
    const storeProducts = products.filter(product => product.vendorId === store.id);
    const productWord = storeProducts.length === 1 ? "product" : "products";
    const phoneLink = store.phone.replace(/ /g, "");

    document.title = store.name + " | SokoHub";

    const categoryTags = store.categories
      .map(category => `<span class="tag">${category}</span>`)
      .join("");

    const reviewsHtml = sampleReviews
      .map(review => `
        <div class="review">
          <div class="review-head">
            <strong>${review.name}</strong>
            <span class="stars">${renderStars(review.rating)}</span>
          </div>
          <p>${review.comment}</p>
        </div>
      `)
      .join("");

    vendorStore.innerHTML = `
      <section class="store-hero">
        <div class="container store-hero-inner">
          <img src="${store.logo}" alt="${store.name} logo" class="store-logo">
          <div>
            <h1>${store.name}</h1>
            <p class="store-rating"><span class="stars">${renderStars(store.rating)}</span> ${store.rating} (${store.reviews} reviews)</p>
            <p class="store-meta">📍 ${store.location} &bull; Member since ${store.joined} &bull; ${storeProducts.length} ${productWord}</p>
            <div class="tag-list store-tags">${categoryTags}</div>
            <p class="store-desc">${store.description}</p>
          </div>
        </div>
      </section>

      <section class="section container">
        <div class="section-head">
          <h2>Products from ${store.name}</h2>
          <span class="muted">${storeProducts.length} ${productWord} available</span>
        </div>
        <div class="product-grid">
          ${storeProducts.map(createProductCard).join("")}
        </div>
      </section>

      <section class="section container">
        <div class="store-info-grid">

          <div class="detail-card">
            <h2>Store Reviews</h2>
            <div class="reviews-summary">
              <span class="rating-big">${store.rating}</span>
              <div>
                <span class="stars">${renderStars(store.rating)}</span><br>
                <span class="vendor-desc">Based on ${store.reviews} reviews</span>
              </div>
            </div>
            <div class="review-grid">${reviewsHtml}</div>
          </div>

          <div class="detail-card">
            <h2>Contact Information</h2>
            <ul class="contact-list">
              <li>
                <span class="contact-icon">✉️</span>
                <div><small>Email</small><a href="mailto:${store.email}">${store.email}</a></div>
              </li>
              <li>
                <span class="contact-icon">📞</span>
                <div><small>Phone</small><a href="tel:${phoneLink}">${store.phone}</a></div>
              </li>
              <li>
                <span class="contact-icon">📍</span>
                <div><small>Location</small><span>${store.location}</span></div>
              </li>
            </ul>
            <a href="mailto:${store.email}" class="btn btn-primary btn-sm">Contact Vendor</a>
          </div>

        </div>
      </section>
    `;
  }
}
// ===== 8. CART PAGE =====

const cartContent = document.getElementById("cart-content");

if (cartContent) {
  function renderCart() {
    const items = getCart()
      .map(entry => ({
        product: products.find(product => product.id === entry.productId),
        quantity: entry.quantity
      }))
      .filter(item => item.product);

    if (items.length === 0) {
      cartContent.innerHTML = `
        <div class="empty-cart">
          <span class="empty-icon">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <a href="products.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      return;

        renderCart();
  window.addEventListener("pageshow", renderCart);
    }

    const itemCount = getCartCount();
    const subtotal = getCartTotal();
    const delivery = getDeliveryFee(subtotal);
    const total = subtotal + delivery;
    const vendorCount = new Set(items.map(item => item.product.vendorId)).size;

    const rows = items
      .map(({ product, quantity }) => {
        const vendor = getVendor(product.vendorId);

        return `
          <article class="cart-item">
            <a href="product-details.html?id=${product.id}" class="cart-thumb">
              <img src="${product.images[0]}" alt="${product.name}">
            </a>

            <div class="cart-info">
              <h3><a href="product-details.html?id=${product.id}">${product.name}</a></h3>
              <p class="product-vendor">Sold by <a href="vendor-store.html?id=${vendor.id}">${vendor.name}</a></p>
              <p class="cart-unit">${formatPrice(product.price)} each</p>
            </div>

            <div class="qty-control">
              <button type="button" data-cart-action="minus" data-id="${product.id}" aria-label="Decrease quantity">&minus;</button>
              <input type="number" class="cart-qty-input" data-id="${product.id}" value="${quantity}" min="1" max="${product.stock}" aria-label="Quantity">
              <button type="button" data-cart-action="plus" data-id="${product.id}" aria-label="Increase quantity">+</button>
            </div>

            <p class="cart-line-total">${formatPrice(product.price * quantity)}</p>

            <button type="button" class="remove-btn" data-cart-action="remove" data-id="${product.id}" aria-label="Remove ${product.name}">&times;</button>
          </article>
        `;
      })
      .join("");

    const deliveryNote = delivery === 0
      ? `<p class="delivery-note">🎉 You've got free delivery!</p>`
      : `<p class="delivery-note">Add ${formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more to get free delivery.</p>`;

    cartContent.innerHTML = `
      <div class="cart-layout">

        <div>
          <div class="cart-head">
            <h2>Your Items (${itemCount})</h2>
            <button type="button" class="clear-btn" data-cart-action="clear">Clear cart</button>
          </div>
          ${rows}
        </div>

        <aside class="summary-card">
          <h2>Order Summary</h2>
          <ul class="summary-lines">
            <li><span>Items (${itemCount})</span><strong>${formatPrice(subtotal)}</strong></li>
            <li><span>Vendors</span><strong>${vendorCount}</strong></li>
            <li><span>Delivery</span><strong>${delivery === 0 ? "Free" : formatPrice(delivery)}</strong></li>
          </ul>
          ${deliveryNote}
          <div class="summary-total">
            <span>Total</span>
            <strong>${formatPrice(total)}</strong>
          </div>
          <a href="checkout.html" class="btn btn-primary btn-block">Proceed to Checkout</a>
          <a href="products.html" class="btn btn-outline btn-block">Continue Shopping</a>
        </aside>

      </div>
    `;
  }

  cartContent.addEventListener("click", event => {
    const button = event.target.closest("[data-cart-action]");

    if (!button) return;

    const action = button.dataset.cartAction;
    const id = Number(button.dataset.id);
    const entry = getCart().find(item => item.productId === id);
    const product = products.find(item => item.id === id);

    if (action === "plus") {
      if (entry.quantity >= product.stock) {
        showToast("Only " + product.stock + " in stock.");
      } else {
        updateQuantity(id, entry.quantity + 1);
      }
    } else if (action === "minus") {
      updateQuantity(id, entry.quantity - 1);
    } else if (action === "remove") {
      removeFromCart(id);
    } else if (action === "clear") {
      if (confirm("Remove all items from your cart?")) {
        clearCart();
      }
    }

    renderCart();
  });

  cartContent.addEventListener("change", event => {
    if (event.target.classList.contains("cart-qty-input")) {
      const id = Number(event.target.dataset.id);
      const value = parseInt(event.target.value, 10);

      updateQuantity(id, isNaN(value) ? 1 : value);
      renderCart();
    }
  });

  renderCart();
}
// ===== 9. CHECKOUT PAGE =====

const checkoutForm = document.getElementById("checkout-form");

if (checkoutForm) {
  const checkoutLayout = document.getElementById("checkout-layout");
  const checkoutEmpty = document.getElementById("checkout-empty");
  const checkoutSummary = document.getElementById("checkout-summary");
  const orderConfirmation = document.getElementById("order-confirmation");

  const cartItems = getCartItems();

  function escapeHtml(text) {
    const box = document.createElement("div");
    box.textContent = text;
    return box.innerHTML;
  }

  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + "-error");

    error.textContent = message;
    field.classList.toggle("invalid", message !== "");
    return message === "";
  }

  function showConfirmation(order) {
    const firstName = escapeHtml(order.customer.name.split(" ")[0]);

    const itemRows = order.items
      .map(item => `
        <li>
          <div>${item.name} &times; ${item.quantity}<small>Sold by ${item.vendor}</small></div>
          <strong>${formatPrice(item.price * item.quantity)}</strong>
        </li>
      `)
      .join("");

    const notesHtml = order.address.notes
      ? `<br>Note: ${escapeHtml(order.address.notes)}`
      : "";

    orderConfirmation.innerHTML = `
      <div class="confirm-card">
        <div class="confirm-icon">&#10003;</div>
        <h2>Thank you, ${firstName}!</h2>
        <p class="muted">Your order has been placed successfully. Keep your order number for reference.</p>
        <span class="order-number">Order #${order.id}</span>

        <div class="confirm-details">
          <div>
            <h3>Delivery address</h3>
            <p>${escapeHtml(order.address.street)}<br>${escapeHtml(order.address.city)}${notesHtml}</p>
          </div>
          <div>
            <h3>Contact</h3>
            <p>${escapeHtml(order.customer.name)}<br>${escapeHtml(order.customer.email)}<br>${escapeHtml(order.customer.phone)}</p>
          </div>
          <div>
            <h3>Payment method</h3>
            <p>${order.payment}</p>
          </div>
          <div>
            <h3>Order date</h3>
            <p>${order.date}</p>
          </div>
        </div>

        <div class="confirm-items">
          <ul class="summary-items">${itemRows}</ul>
          <ul class="summary-lines">
            <li><span>Subtotal</span><strong>${formatPrice(order.subtotal)}</strong></li>
            <li><span>Delivery</span><strong>${order.delivery === 0 ? "Free" : formatPrice(order.delivery)}</strong></li>
          </ul>
          <div class="summary-total">
            <span>Total</span>
            <strong>${formatPrice(order.total)}</strong>
          </div>
        </div>

        <div class="confirm-actions">
          <a href="products.html" class="btn btn-primary">Continue Shopping</a>
          <a href="index.html" class="btn btn-outline">Back to Home</a>
        </div>
      </div>
    `;

    checkoutLayout.style.display = "none";
    orderConfirmation.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (cartItems.length === 0) {
    checkoutLayout.style.display = "none";
    checkoutEmpty.style.display = "block";
  } else {
    const subtotal = getCartTotal();
    const delivery = getDeliveryFee(subtotal);
    const total = subtotal + delivery;

    const summaryRows = cartItems
      .map(({ product, quantity }) => `
        <li>
          <div>${product.name} &times; ${quantity}<small>Sold by ${getVendor(product.vendorId).name}</small></div>
          <strong>${formatPrice(product.price * quantity)}</strong>
        </li>
      `)
      .join("");

    checkoutSummary.innerHTML = `
      <h2>Order Summary</h2>
      <ul class="summary-items">${summaryRows}</ul>
      <ul class="summary-lines">
        <li><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></li>
        <li><span>Delivery</span><strong>${delivery === 0 ? "Free" : formatPrice(delivery)}</strong></li>
      </ul>
      <div class="summary-total">
        <span>Total</span>
        <strong>${formatPrice(total)}</strong>
      </div>
      <a href="cart.html" class="btn btn-outline btn-block">Edit Cart</a>
    `;

    checkoutForm.addEventListener("submit", event => {
      event.preventDefault();

      const name = document.getElementById("co-name").value.trim();
      const email = document.getElementById("co-email").value.trim();
      const phone = document.getElementById("co-phone").value.trim();
      const street = document.getElementById("co-address").value.trim();
      const city = document.getElementById("co-city").value.trim();
      const notes = document.getElementById("co-notes").value.trim();
      const payment = checkoutForm.elements["payment"].value;
      const agreed = document.getElementById("co-terms").checked;
      const phoneDigits = phone.replace(/[\s-]/g, "");

      const nameOk = setFieldError(
        "co-name",
        name.length < 3 ? "Please enter your full name (at least 3 characters)." : ""
      );
      const emailOk = setFieldError(
        "co-email",
        /^\S+@\S+\.\S+$/.test(email) ? "" : "Please enter a valid email address."
      );
      const phoneOk = setFieldError(
        "co-phone",
        /^\+?[0-9]{9,15}$/.test(phoneDigits) ? "" : "Please enter a valid phone number (9 to 15 digits)."
      );
      const streetOk = setFieldError(
        "co-address",
        street.length < 5 ? "Please enter your street address." : ""
      );
      const cityOk = setFieldError(
        "co-city",
        city.length < 2 ? "Please enter your city or town." : ""
      );
      const termsOk = setFieldError(
        "co-terms",
        agreed ? "" : "Please confirm your order details before continuing."
      );

      if (!(nameOk && emailOk && phoneOk && streetOk && cityOk && termsOk)) {
        const firstError = document.querySelector(".invalid");

        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      const order = {
        id: "SH" + Date.now().toString().slice(-6),
        date: new Date().toLocaleDateString(),
        customer: { name: name, email: email, phone: phone },
        address: { street: street, city: city, notes: notes },
        payment: payment,
        items: cartItems.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          vendor: getVendor(product.vendorId).name,
          price: product.price,
          quantity: quantity
        })),
        subtotal: subtotal,
        delivery: delivery,
        total: total,
        status: "Confirmed"
      };

      let orders = [];

      try {
        orders = JSON.parse(localStorage.getItem("sokohubOrders")) || [];
      } catch (error) {
        orders = [];
      }

      orders.push(order);
      localStorage.setItem("sokohubOrders", JSON.stringify(orders));

      clearCart();
      showConfirmation(order);
    });
  }
}