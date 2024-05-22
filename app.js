const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Use o middleware cors
app.use(cors());

// Configurar o body-parser para lidar com dados JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar o diretório de arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

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
  console.log("Dados recebidos no servidor:", req.body);

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
        return res.status(500).send("Erro ao adicionar o produto.");
      }
      console.log("Produto adicionado com sucesso. ID:", this.lastID);

      // Após adicionar o produto com sucesso, adicionamos um registro de estoque correspondente
      const productId = this.lastID; // ID do último produto adicionado
      const initialQuantity = 0; // Quantidade inicial do estoque
      db.run(
        "INSERT INTO stock (product_id, quantity) VALUES (?, ?)",
        [productId, initialQuantity],
        function (err) {
          if (err) {
            console.error("Erro ao adicionar o estoque do produto:", err.message);
            return res.status(500).send("Erro ao adicionar o estoque do produto.");
          }
          console.log("Estoque do produto adicionado com sucesso.");
          return res.status(201).send("Produto adicionado com sucesso.");
        }
      );
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
    },
  );
});

// Definir rota para recuperar o estoque dos produtos
app.get("/stock", (req,res) => {
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

app.get("/sales", (req, res) => {
  const sql = "SELECT * FROM sales";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Erro ao recuperar as vendas dos produtos:", err.message);
      res.status(500).send("Erro ao recuperar as vendas dos produtos.");
    } else {
      res.json(rows);
    }
  });
});

// Adicionar rota para registrar uma venda
app.post("/sales", async (req, res) => {
  const sales = req.body.items;
  const db = new sqlite3.Database("database/database.db");

  db.serialize(() => {
    const stmt = db.prepare(
      "INSERT INTO sales (product_id, quantityS, payment, total) VALUES (?, ?, ?, ?)"
    );

    try {
      sales.forEach(async (sale) => {
        const { productId, quantity, paymentMethod } = sale;

        // Obtenha o preço de venda do produto
        db.get("SELECT sale_price FROM products WHERE id = ?", [productId], (err, row) => {
          if (err) {
            throw err;
          }

          const total = row.sale_price * quantity;

          // Insira a venda
          stmt.run([productId, quantity, paymentMethod, total], (err) => {
            if (err) {
              throw err;
            }

            // Atualize o estoque do produto
            db.run("UPDATE stock SET quantity = quantity - ? WHERE product_id = ?", [quantity, productId], (err) => {
              if (err) {
                throw err;
              }
            });
          });
        });
      });

      stmt.finalize();
      db.close();
      res.status(201).send("Venda registrada com sucesso.");
    } catch (error) {
      console.error("Erro ao registrar a venda:", error.message);
      res.status(500).send("Erro ao registrar a venda.");
    }
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

