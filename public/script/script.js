const themeSwitch = document.getElementById("theme-switch");
const body = document.body;

themeSwitch.addEventListener("change", () => {
  body.classList.toggle("dark-mode");
});

// Função para abrir o modal de adicionar produto
function openModal() {
  const modal = document.getElementById("add-product-modal");
  modal.style.display = "block";
}

// Função para fechar o modal de adicionar produto
function closeModal() {
  const modal = document.getElementById("add-product-modal");
  modal.style.display = "none";
}

// Evento para abrir o modal ao clicar no botão "Adicionar Produto"
document.getElementById("add-product-btn").addEventListener("click", openModal);

// Evento para fechar o modal ao clicar no botão de fechar (X)
document.querySelector(".close").addEventListener("click", closeModal);

//Tela de Adcionar Produtos

document
  .getElementById("add-product-form")
  .addEventListener("submit", (event) => {
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
    fetch("http://localhost:3050/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ocorreu um erro ao adicionar o produto.");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Produto adicionado com sucesso:", data);
        closeModal(); // Fecha o modal após adicionar o produto
      })
      .catch((error) => {
        console.error("Erro:", error.message);
      });
  });
//Tela de adcionar produtos

// Função para carregar a lista de produtos
async function loadProductList() {
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
        <td>${product.name  }</td>
        <td>${product.cost_price}</td>
        <td>${product.sale_price}</td>
        <td><button class="edit-button" id="edit-product-modall" data-product-id="${product.id}">Editar</button></td>
      `;
      productList.appendChild(row);
    });
  } catch (error) {
    console.error("Erro:", error.message);
  }
}
// Carregar a lista de produtos quando a página carregar
window.addEventListener("load", loadProductList);

