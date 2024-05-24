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

// Rota para verificar o estoque de um produto específico
app.get("/stock/:productId", (req, res) => {
  const productId = req.params.productId;

  db.get("SELECT quantity FROM stock WHERE product_id = ?", [productId], (err, row) => {
    if (err) {
      console.error("Erro ao obter o estoque:", err.message);
      return res.status(500).send("Erro ao obter o estoque.");
    }

    if (!row) {
      return res.status(404).send("Estoque não encontrado.");
    }

    res.json(row);
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

app.post("/sales", (req, res) => {
  const sales = req.body.items;

  const db = new sqlite3.Database("database/database.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error("Erro ao conectar ao banco de dados:", err.message);
      return res.status(500).send("Erro ao conectar ao banco de dados.");
    }
  });

  db.serialize(() => {
    const stmt = db.prepare(
      "INSERT INTO sales (product_id, quantityS, payment, total) VALUES (?, ?, ?, ?)"
    );

    const processSale = (index) => {
      if (index >= sales.length) {
        stmt.finalize((err) => {
          if (err) {
            console.error("Erro ao finalizar a declaração:", err.message);
            return res.status(500).send("Erro ao finalizar a declaração.");
          }
          db.close((err) => {
            if (err) {
              console.error("Erro ao fechar o banco de dados:", err.message);
              return res.status(500).send("Erro ao fechar o banco de dados.");
            }
            res.status(201).send("Venda registrada com sucesso.");
          });
        });
        return;
      }

      const sale = sales[index];
      const { productId, quantity, paymentMethod } = sale;

      db.get("SELECT sale_price FROM products WHERE id = ?", [productId], (err, row) => {
        if (err) {
          console.error("Erro ao obter o preço de venda:", err.message);
          return res.status(500).send("Erro ao obter o preço de venda.");
        }

        if (!row) {
          console.error("Produto não encontrado para ID:", productId);
          return res.status(500).send("Produto não encontrado.");
        }

        const total = row.sale_price * quantity;

        // Verificar o estoque
        db.get("SELECT quantity FROM stock WHERE product_id = ?", [productId], (err, stockRow) => {
          if (err) {
            console.error("Erro ao obter o estoque:", err.message);
            return res.status(500).send("Erro ao obter o estoque.");
          }

          if (!stockRow) {
            console.error("Estoque não encontrado para o produto:", productId);
            return res.status(500).send("Estoque não encontrado.");
          }

          if (stockRow.quantity < quantity) {
            console.error(`Estoque insuficiente para o produto: ${productId}`);
            return res.status(400).send(`Estoque insuficiente para o produto: ${productId}`);
          }

          stmt.run([productId, quantity, paymentMethod, total], (err) => {
            if (err) {
              console.error("Erro ao registrar a venda:", err.message);
              return res.status(500).send("Erro ao registrar a venda.");
            }

            db.run("UPDATE stock SET quantity = quantity - ? WHERE product_id = ?", [quantity, productId], (err) => {
              if (err) {
                console.error("Erro ao atualizar o estoque:", err.message);
                return res.status(500).send("Erro ao atualizar o estoque.");
              }

              processSale(index + 1);
            });
          });
        });
      });
    };

    processSale(0);
  });
});


// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

