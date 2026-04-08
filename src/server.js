const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.render("pages/home", {
    pageTitle: "Museu do Vinho Mario Pellegrin",
    activePage: "home",
  });
});

app.get("/acervo", (req, res) => {
  res.render("pages/acervo", {
    pageTitle: "Explorar o Acervo",
    activePage: "acervo",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
