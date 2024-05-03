const stockApp = {
  init: function () {
    this.loadProductList();
    this.loadProductNames();

    document
      .getElementById("stock-movement-btn")
      .addEventListener("click", this.openModal);
    document.querySelector(".close").addEventListener("click", this.closeModal);

    document
      .getElementById("stock-movement-form")
      .addEventListener("submit", this.handleStockMovement);
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
      const responseProducts = await fetch("http://localhost:3000/products");
      const responseStock = await fetch("http://localhost:3000/stock");

      if (!responseProducts.ok || !responseStock.ok) {
        throw new Error("Erro ao carregar os produtos ou o estoque.");
      }

      const dataProducts = await responseProducts.json();
      const dataStock = await responseStock.json();

      const productList = document.getElementById("product-stock");
      productList.innerHTML = "";

      dataProducts.forEach((product) => {
        const stockItem = dataStock.find(
          (item) => item.product_id === product.id
        );
        const stockQuantity = stockItem ? stockItem.quantity : 0;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${product.id}</td>
          <td>${product.name}</td>
          <td>${product.cost_price}</td>
          <td>${product.sale_price}</td>
          <td>${product.barcode}</td>
          <td class="editable" contenteditable="true" data-product-id="${product.id}">${stockQuantity}</td>
        `;
        productList.appendChild(row);
      });
    } catch (error) {
      console.error("Erro:", error.message);
    }
  },

  handleStockMovement: async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const productName = formData.get("product-id"); // Obtém o nome do produto do formulário
    const newQuantity = formData.get("new-quantity");
    // Encontra o ID do produto com base no nome selecionado
    const productId = await stockApp.findProductIdByName(productName); // Aqui usamos stockApp para referenciar a função
    if (!productId || !newQuantity) {
      console.error("ID do produto ou nova quantidade não estão definidos.");
      return;
    }
    // Envia a solicitação para atualizar o estoque do produto
    try {
      const response = await fetch(`http://localhost:3000/stock/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      });
      if (!response.ok) {
        throw new Error("Erro ao atualizar o estoque do produto.");
      }
      // Atualiza a lista de produtos após a atualização do estoque
      stockApp.loadProductList();
      stockApp.closeModal();
    } catch (error) {
      console.error("Erro:", error.message);
    }
  },
  loadProductNames: async function () {
    try {
      const response = await fetch("http://localhost:3000/products");
      if (!response.ok) {
        throw new Error("Erro ao carregar a lista de produtos.");
      }
      const data = await response.json();
      const datalist = document.getElementById("browsers");
      datalist.innerHTML = ""; // Limpa as opções existentes
      data.forEach((product) => {
        const option = document.createElement("option");
        option.value = product.name; // Define o valor da opção como o nome do produto
        datalist.appendChild(option);
      });
    } catch (error) {
      console.error("Erro:", error.message);
    }
  },
  findProductIdByName: async function (productName) {
    try {
      const response = await fetch("http://localhost:3000/products");
      if (!response.ok) {
        throw new Error("Erro ao carregar a lista de produtos.");
      }
      const data = await response.json();
      const product = data.find((product) => product.name === productName);
      return product ? product.id : null; // Retorna o ID do produto se encontrado
    } catch (error) {
      console.error("Erro:", error.message);
      return null;
    }
  },
};

stockApp.init();
