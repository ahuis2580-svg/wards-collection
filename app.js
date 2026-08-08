const bag = JSON.parse(localStorage.getItem("wardsBag") || "[]");

function updateBagCount() {
  const count = bag.length;
  document.querySelectorAll(".bag-count").forEach(el => {
    el.textContent = count;
  });
}

function saveBag() {
  localStorage.setItem("wardsBag", JSON.stringify(bag));
  updateBagCount();
}

function addToBag(product) {
  bag.push(product);
  saveBag();
  alert(product.name + " added to your bag");
}

async function loadProducts() {
  try {
    const response = await fetch("products.json");
    const products = await response.json();

    window.wardsProducts = products;

    renderProducts(products);
  } catch (error) {
    console.error("Could not load Wards Collection products:", error);
  }
}

function renderProducts(products) {
  const container =
    document.getElementById("products") ||
    document.getElementById("product-grid");

  if (!container) return;

  container.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${product.img}" alt="${product.name}">
      <div class="product-info">
        <p class="product-category">${product.cat || ""}</p>
        <h3>${product.name}</h3>
        <p>${product.desc || ""}</p>
        <button class="add-bag-btn">Add to Bag</button>
      </div>
    `;

    card.querySelector(".add-bag-btn").addEventListener("click", () => {
      addToBag(product);
    });

    container.appendChild(card);
  });
}

function searchProducts(searchText) {
  if (!window.wardsProducts) return;

  const term = searchText.toLowerCase().trim();

  const filtered = window.wardsProducts.filter(product => {
    return (
      product.name.toLowerCase().includes(term) ||
      (product.cat || "").toLowerCase().includes(term) ||
      (product.desc || "").toLowerCase().includes(term) ||
      (product.colors || []).some(color =>
        color.toLowerCase().includes(term)
      )
    );
  });

  renderProducts(filtered);
}

function filterCategory(category) {
  if (!window.wardsProducts) return;

  if (category === "All") {
    renderProducts(window.wardsProducts);
    return;
  }

  const filtered = window.wardsProducts.filter(
    product => product.cat === category
  );

  renderProducts(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  updateBagCount();

  const search =
    document.getElementById("search") ||
    document.querySelector('input[type="search"]');

  if (search) {
    search.addEventListener("input", event => {
      searchProducts(event.target.value);
    });
  }

  document.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      filterCategory(button.dataset.category);
    });
  });

  loadProducts();
});
