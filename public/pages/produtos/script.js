const productApp = {
  openEditModal: function (productId) {
    const product = getProductById(productId);
    if (product) {
      document.getElementById("edit-product-id").value = product.id;
      document.getElementById("edit-name").value = product.name;
      document.getElementById("edit-cost-price").value = product.cost_price;
      document.getElementById("edit-sale-price").value = product.sale_price;
      document.getElementById("edit-min-stock").value = product.min_stock;
      document.getElementById("edit-max-stock").value = product.max_stock;
      document.getElementById("edit-barcode").value = product.barcode;
      document.getElementById("edit-family").value = product.family;

      const editModal = document.getElementById("edit-product-modal");
      editModal.style.display = "block";
    }
  },

  init: function () {
    // Carregar a lista de produtos quando a página carregar
    this.loadProductList();

    // Adicionar evento ao botão "Adicionar Produto"
    document
      .getElementById("add-product-btn")
      .addEventListener("click", this.openModal.bind(this));

    // Adicionar evento ao botão de fechar do modal
    document.querySelector(".close").addEventListener("click", this.closeModal.bind(this));

    // Adicionar evento de envio do formulário de adicionar produto
    document
      .getElementById("add-product-form")
      .addEventListener("submit", this.InsertNewProduct.bind(this));

    // Adicionar evento de clique aos botões de edição
    document.querySelectorAll(".edit-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        const productId = event.target.dataset.productId;
        this.openEditModal(productId);
      });
    });

    // Adicionar evento de envio do formulário de edição de produto
    document
      .getElementById("edit-product-form")
      .addEventListener("submit", this.editProduct.bind(this));
  },

  openModal: function () {
    const modal = document.getElementById("add-product-modal");
    modal.style.display = "block";
  },

  closeModal: function () {
    const modal = document.getElementById("add-product-modal");
    modal.style.display = "none";
  },

  InsertNewProduct: async function (event) {
    event.preventDefault();
    const formData = {
      name: document.getElementById("name").value,
      cost_price: document.getElementById("cost-price").value,
      sale_price: document.getElementById("sale-price").value,
      min_stock: document.getElementById("min-stock").value,
      max_stock: document.getElementById("max-stock").value,
      barcode: document.getElementById("barcode").value,
      family: document.getElementById("family").value,
    };

    try {
      const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Ocorreu um erro ao adicionar o produto.");
      }
      const data = await response.json();
      console.log("Produto adicionado com sucesso:", data);
      this.closeModal(); // Fecha o modal após adicionar o produto
      this.loadProductList(); // Recarrega a lista de produtos
    } catch (error) {
      console.error("Erro:", error.message);
    }
  },

  loadProductList: async function () {
    try {
      const response = await fetch("http://localhost:3000/products");
      if (!response.ok) {
        throw new Error("Erro ao carregar a lista de produtos.");
      }
      const data = await response.json();
      const productList = document.getElementById("product-list");
      productList.innerHTML = "";
      data.forEach((product) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${product.id}</td>
          <td>${product.name}</td>
          <td>${product.cost_price}</td>
          <td>${product.sale_price}</td>
          <td>${product.quantity}</td>
          <td>${product.barcode}</td>
          <td>${product.family}</td>
          <td><button class="edit-button" data-product-id="${product.id}">Editar</button></td>
        `;
        productList.appendChild(row);
      });
    } catch (error) {
      console.error("Erro:", error.message);
    }
  },

  editProduct: async function (event) {
    event.preventDefault();
    const formData = {
      id: document.getElementById("edit-product-id").value,
      name: document.getElementById("edit-name").value,
      cost_price: document.getElementById("edit-cost-price").value,
      sale_price: document.getElementById("edit-sale-price").value,
      min_stock: document.getElementById("edit-min-stock").value,
      max_stock: document.getElementById("edit-max-stock").value,
      barcode: document.getElementById("edit-barcode").value,
      family: document.getElementById("edit-family").value,
    };

    try {
      const response = await fetch(`http://localhost:3000/products/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Ocorreu um erro ao editar o produto.");
      }
      console.log("Produto editado com sucesso:", formData);
      this.closeModal("edit-product-modal"); // Fecha o modal de edição após salvar as alterações
      this.loadProductList(); // Recarrega a lista de produtos
    } catch (error) {
      console.error("Erro:", error.message);
    }
  },
};

productApp.init();
