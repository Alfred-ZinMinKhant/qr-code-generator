const express = require("express");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/qrs", express.static(path.join(__dirname, "qrs")));

const qrHistory = [];

app.post("/api/generate", async (req, res) => {
  const { url, color = "#000000" } = req.body;

  if (!url) return res.status(400).json({ error: "URL is required" });

  const filename = `${uuidv4()}.png`;
  const filepath = path.join(__dirname, "qrs", filename);

  try {
    await QRCode.toFile(filepath, url, {
      color: {
        dark: color,
        light: "#FFFFFF",
      },
      margin: 2,
      width: 300,
    });

    const entry = { url, file: `/qrs/${filename}`, timestamp: Date.now() };
    qrHistory.push(entry);

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR" });
  }
});

app.get("/api/history", (req, res) => {
  res.json(qrHistory.slice(-20).reverse()); // latest 20
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Backend running at http://localhost:${PORT}`)
);
