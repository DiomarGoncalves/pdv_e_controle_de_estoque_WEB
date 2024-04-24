const ThemeSwitcher = {
  init: function () {
    // Evento para alternar o tema
    const themeSwitch = document.getElementById("theme-switch");
    const body = document.body;
    themeSwitch.addEventListener("change", () => {
      body.classList.toggle("dark-mode");
    });
  },
};
ThemeSwitcher.init();

const productApp = {
  init: function () {
    // Carregar a lista de produtos quando a página carregar
    this.loadProductList();
    this.InsertNewProduct();
    // Evento para abrir o modal ao clicar no botão "Adicionar Produto"
    document
      .getElementById("add-product-btn")
      .addEventListener("click", this.openModal);

    // Evento para fechar o modal ao clicar no botão de fechar (X)
    document.querySelector(".close").addEventListener("click", this.closeModal);
  },

  openModal: function () {
    const modal = document.getElementById("add-product-modal");
    modal.style.display = "block";
  },

  closeModal: function () {
    const modal = document.getElementById("add-product-modal");
    modal.style.display = "none";
  },

  InsertNewProduct: async function () {
    // Função para adicionar um produto
    async function addProduct(event) {
      event.preventDefault(); // Impede o envio padrão do formulário
      const formData = {
        name: document.getElementById("name").value,
        cost_price: document.getElementById("cost-price").value,
        sale_price: document.getElementById("sale-price").value,
        min_stock: document.getElementById("min-stock").value,
        max_stock: document.getElementById("max-stock").value,
        barcode: document.getElementById("barcode").value,
        family: document.getElementById("family").value,
      };
      // Continuar com o envio do formulário para o servidor
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
        closeModal(); // Fecha o modal após adicionar o produto
        loadProductStock(); // Recarrega a lista de produtos na tela de estoque
      } catch (error) {
        console.error("Erro:", error.message);
      }
    }

    // Evento para submeter o formulário de adicionar produto na tela de produtos
    document
      .getElementById("add-product-form")
      .addEventListener("submit", addProduct);
  },
  loadProductList: async function () {
    try {
      const response = await fetch("http://localhost:3000/products");
      if (!response.ok) {
        throw new Error("Erro ao carregar a lista de produtos.");
      }
      const data = await response.json();
      const productList = document.getElementById("product-list");
      productList.innerHTML = ""; // Limpar a lista antes de adicionar os novos produtos
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
productApp.init();
