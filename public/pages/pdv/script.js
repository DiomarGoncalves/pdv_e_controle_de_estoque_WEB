document.addEventListener("DOMContentLoaded", () => {
  const salesForm = document.getElementById("sales-form");
  const productSelect = document.getElementById("product");
  const saleList = document.getElementById("sale-list");
  const totalValue = document.getElementById("total-value");
  const finishSaleBtn = document.getElementById("finish-sale-btn");

  let products = [];
  let sales = [];
  let total = 0;

  const loadProducts = async () => {
    try {
      const response = await fetch("http://localhost:3000/products");
      if (!response.ok) {
        throw new Error("Erro ao carregar produtos");
      }
      products = await response.json();

      products.forEach((product) => {
        const option = document.createElement("option");
        option.value = product.id;
        option.textContent = `${product.name} - R$${product.sale_price.toFixed(2)}`;
        productSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  const updateTotal = () => {
    total = sales.reduce((sum, sale) => sum + sale.total, 0);
    totalValue.textContent = `Total: R$${total.toFixed(2)}`;
  };

  const addSale = (sale) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${sale.quantity} x ${sale.productName} - R$${sale.total.toFixed(2)}`;
    saleList.appendChild(listItem);
    updateTotal();
  };

  salesForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const productId = parseInt(productSelect.value);
    const quantity = parseInt(document.getElementById("quantity").value);
    const paymentMethod = document.getElementById("payment-method").value;

    const product = products.find((p) => p.id === productId);
    if (!product) {
      alert("Produto inválido");
      return;
    }

    // Verificar o estoque antes de adicionar ao resumo da venda
    try {
      const response = await fetch(`http://localhost:3000/stock/${productId}`);
      if (!response.ok) {
        throw new Error("Erro ao verificar o estoque");
      }
      const stock = await response.json();
      if (stock.quantity < quantity) {
        alert("Estoque insuficiente para esse produto.");
        return;
      }
    } catch (error) {
      console.error("Erro ao verificar o estoque:", error);
      alert("Erro ao verificar o estoque.");
      return;
    }

    const total = product.sale_price * quantity;

    const sale = {
      productId,
      quantity,
      paymentMethod,
      total,
      productName: product.name,
    };

    sales.push(sale);
    addSale(sale);
    salesForm.reset();
  });

  finishSaleBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("http://localhost:3000/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: sales }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      alert("Venda finalizada com sucesso!");
      sales = [];
      saleList.innerHTML = "";
      updateTotal();
    } catch (error) {
      console.error("Erro ao finalizar a venda:", error);
      alert(error.message);
    }
  });

  loadProducts();
});
