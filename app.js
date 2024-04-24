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

// Definir outras rotas conforme necessário...

// Rota para atualizar um produto existente
app.put("/products/{productId}", (req, res) => {
  const productId = req.params.id;
  const { name, cost_price, sale_price, /* Adicione mais atributos conforme necessário */ } = req.body;

  const sql = `UPDATE products SET name = ?, cost_price = ?, sale_price = ? WHERE id = ?`;
  const values = [name, cost_price, sale_price, productId];

  db.run(sql, values, function (err) {
    if (err) {
      console.error("Erro ao editar o produto:", err.message);
      return res.status(500).send("Erro ao editar o produto.");
    }
    console.log("Produto editado com sucesso. ID:", productId);
    return res.status(200).send("Produto editado com sucesso.");
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
