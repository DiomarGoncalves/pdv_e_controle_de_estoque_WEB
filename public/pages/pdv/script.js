const pdvApp = {
  init: function () {
    this.loadProductList();

    document
      .getElementById("sales-form")
      .addEventListener("submit", this.handleAddProduct.bind(this));
    document
      .getElementById("finish-sale-btn")
      .addEventListener("click", this.finishSale.bind(this));

    this.saleItems = [];
  },

  loadProductList: async function () {
    try {
      const response = await fetch("http://localhost:3000/products");
      if (!response.ok) {
        throw new Error("Erro ao carregar os produtos.");
      }
      const products = await response.json();
      const productSelect = document.getElementById("product");
      productSelect.innerHTML =
        '<option value="" disabled selected>Selecione um produto</option>';
      products.forEach((product) => {
        const option = document.createElement("option");
        option.value = product.id;
        option.textContent = product.name;
        productSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar produtos:", error.message);
    }
  },

  handleAddProduct: function (event) {
    event.preventDefault();
    const productSelect = document.getElementById("product");
    const quantityInput = document.getElementById("quantity");
    const paymentMethodSelect = document.getElementById("payment-method");

    const productId = productSelect.value;
    const productName = productSelect.options[productSelect.selectedIndex].text;
    const quantity = quantityInput.value;
    const paymentMethod = paymentMethodSelect.value;

    if (!productId || !quantity || !paymentMethod) {
      alert("Preencha todos os campos.");
      return;
    }

    const saleItem = {
      productId,
      productName,
      quantity: parseInt(quantity, 10),
      paymentMethod,
    };

    this.saleItems.push(saleItem);
    this.updateSaleSummary();
  },

  updateSaleSummary: function () {
    const saleList = document.getElementById("sale-list");
    const totalValueElement = document.getElementById("total-value");
    saleList.innerHTML = "";

    let total = 0;
    this.saleItems.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${item.quantity} x ${item.productName} - ${item.paymentMethod}`;
      saleList.appendChild(listItem);

      total += item.quantity * item.productPrice;
    });

    totalValueElement.textContent = `Total: R$ ${total.toFixed(2)}`;
  },

  finishSale: async function () {
    try {
      const response = await fetch("http://localhost:3000/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: this.saleItems }),
      });
      if (!response.ok) {
        throw new Error("Erro ao finalizar a venda.");
      }

      alert("Venda finalizada com sucesso.");
      this.saleItems = [];
      this.updateSaleSummary();
    } catch (error) {
      console.error("Erro ao finalizar a venda:", error.message);
    }
  },
};

pdvApp.init();
