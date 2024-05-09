const productApp = {
  init: function () {
    this.loadSalesList();
  },

  loadSalesList: async function () {
    try {
      const response = await fetch("http://localhost:3000/sales");
      if (!response.ok) {
        throw new Error("Erro ao carregar a lista de produtos.");
      }
      const data = await response.json();
      const salesList = document.getElementById("sales-list");
      salesList.innerHTML = "";
      data.forEach((sales) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${sales.id}</td>
            <td>${sales.name}</td>
            <td>${sales.date}</td>
            <td>${sales.payment}</td>
            <td>${sales.quantityS}</td>
            <td>${sales.total}</td>
          `;
        salesList.appendChild(row);
      });
    } catch (error) {
      console.error("Erro:", error.message);
    }
  }
};

productApp.init();
