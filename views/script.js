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

// Evento para fechar o modal ao clicar fora dele
window.addEventListener("click", (event) => {
  const modal = document.getElementById("add-product-modal");
  if (event.target == modal) {
    closeModal();
  }
});

// Envio do formulário para o servidor Node.js
document
  .getElementById("add-product-form")
  .addEventListener("submit", (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário
    const formData = new FormData(event.target); // Obtém os dados do formulário
    fetch("/add-product", {
      method: "POST",
      body: formData,
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






// Função para abrir o modal de movimentação de estoque
function openStockMovementModal() {
  const modal = document.getElementById("stock-movement-modal");
  modal.style.display = "block";
}

// Função para fechar o modal de movimentação de estoque
function closeStockMovementModal() {
  const modal = document.getElementById("stock-movement-modal");
  modal.style.display = "none";
}

// Evento para abrir o modal ao clicar no botão "Movimentação de Estoque"
document
  .getElementById("stock-movement-btn")
  .addEventListener("click", openStockMovementModal);

// Evento para fechar o modal ao clicar no botão de fechar (X)
document
  .querySelector("#stock-movement-modal .close")
  .addEventListener("click", closeStockMovementModal);

// Evento para fechar o modal ao clicar fora dele
window.addEventListener("click", (event) => {
  const modal = document.getElementById("stock-movement-modal");
  if (event.target == modal) {
    closeStockMovementModal();
  }
});

// Envio do formulário de movimentação de estoque para o servidor Node.js
document
  .getElementById("stock-movement-form")
  .addEventListener("submit", (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário
    const formData = new FormData(event.target); // Obtém os dados do formulário
    fetch("/stock-movement", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Ocorreu um erro ao registrar a movimentação de estoque."
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log("Movimentação de estoque registrada com sucesso:", data);
        closeStockMovementModal(); // Fecha o modal após registrar a movimentação
      })
      .catch((error) => {
        console.error("Erro:", error.message);
      });
  });
