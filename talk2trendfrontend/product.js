// /public/js/product.js
document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("productGrid");

  try {
    const res = await fetch("https://talk2trend-5.onrender.com/api/products");
    const data = await res.json();

    if (!Array.isArray(data)) {
      grid.innerHTML = "<p>Error loading products.</p>";
      return;
    }

    grid.innerHTML = "";

    data.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <h3>${product.name}</h3>
        <p class="price">₹${product.price}</p>
        <p>${product.description || 'No description available'}</p>
      `;

      grid.appendChild(card);
    });

  } catch (error) {
    console.error("❌ Failed to fetch products:", error);
    grid.innerHTML = "<p>Failed to load products. Please try again later.</p>";
  }
});
