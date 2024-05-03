const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 3000;

// Use o middleware cors
app.use(cors());

// Configurar o body-parser para lidar com dados JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar o banco de dados SQLite
const db = new sqlite3.Database("database/database.db", (err) => {
  if (err) {
    console.error("Erro ao abrir o banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite.");
  }
});

// Definir rota para adicionar um novo produto
app.post("/products", (req, res) => {
  console.log("Dados recebidos no servidor:", req.body); // Adiciona este log para verificar os dados recebidos

  const {
    name,
    cost_price,
    sale_price,
    min_stock,
    max_stock,
    barcode,
    family,
  } = req.body;

  db.run(
    "INSERT INTO products (name, cost_price, sale_price, min_stock, max_stock, barcode, family) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, cost_price, sale_price, min_stock, max_stock, barcode, family],
    function (err) {
      if (err) {
        console.error("Erro ao adicionar o produto:", err.message);
        return res.status(500).send("Erro ao adicionar o produto."); // Retornar um erro 500
      }
      console.log("Produto adicionado com sucesso. ID:", this.lastID);
      return res.status(201).send("Produto adicionado com sucesso."); // Retornar um sucesso 201
    }
  );
});

// Definir rota para recuperar todos os produtos
app.get("/products", (req, res) => {
  const sql = "SELECT * FROM products";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Erro ao recuperar os produtos:", err.message);
      res.status(500).send("Erro ao recuperar os produtos.");
    } else {
      res.json(rows);
    }
  });
});

// Definir rota para atualizar o estoque do produto
app.put("/stock/:id", (req, res) => {
  const productId = req.params.id;
  const { quantity } = req.body;

  db.run(
    "UPDATE stock SET quantity = ? WHERE product_id = ?",
    [quantity, productId],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar o estoque do produto:", err.message);
        return res.status(500).send("Erro ao atualizar o estoque do produto.");
      }
      console.log("Estoque do produto atualizado com sucesso.");
      return res.status(200).send("Estoque do produto atualizado com sucesso.");
    }
  );
});

// Definir rota para recuperar o estoque dos produtos
app.get("/stock", (req, res) => {
  const sql = "SELECT * FROM stock";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Erro ao recuperar o estoque dos produtos:", err.message);
      res.status(500).send("Erro ao recuperar o estoque dos produtos.");
    } else {
      res.json(rows);
    }
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
