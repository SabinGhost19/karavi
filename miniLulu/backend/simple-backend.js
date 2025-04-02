const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const products = [
  {
    id: 1,
    name: "Smartphone",
    price: 699,
    description: "Smartphone de ultimă generație",
  },
  {
    id: 2,
    name: "Laptop",
    price: 999,
    description: "Laptop performant pentru muncă și gaming",
  },
  {
    id: 3,
    name: "Căști wireless",
    price: 129,
    description: "Căști cu anulare activă a zgomotului",
  },
  {
    id: 4,
    name: "Cameră foto",
    price: 449,
    description: "Cameră foto pentru amatori",
  },
  {
    id: 5,
    name: "Tabletă",
    price: 349,
    description: "Tabletă ideală pentru consum media",
  },
];

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ message: "Produsul nu a fost găsit" });
  }

  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Backend API rulează pe portul ${PORT}`);
});
