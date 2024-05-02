const stockApp = {
  init: function () {

    this.loadProductList();

    document
      .getElementById("stock-movement-btn")
      .addEventListener("click", this.openModal);
    document.querySelector(".close").addEventListener("click", this.closeModal);
  },

  openModal: function () {
    const modal = document.getElementById("stock-movement-modal");
    modal.style.display = "block";
  },

  closeModal: function () {
    const modal = document.getElementById("stock-movement-modal");
    modal.style.display = "none";
  },
  loadProductList: async function () {
    try {
      const response = await fetch("http://localhost:3000/products");
      if (!response.ok) {
        throw new Error("Erro ao carregar a lista de produtos.");
      }
      const data = await response.json();
      const productList = document.getElementById("product-stock");
      productList.innerHTML = "";
      data.forEach((product) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${product.id}</td>
          <td>${product.name}</td>
          <td>${product.cost_price}</td>
          <td>${product.sale_price}</td>
          <td>${product.barcode}</td>
          <td><button class="edit-button" data-product-id="${product.id}">Editar</button></td>
        `;
        productList.appendChild(row);
      });
    } catch (error) {
      console.error("Erro:", error.message);
    }
  },
};
stockApp.init();