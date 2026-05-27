const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Reeloops backend is running");
});

app.post("/api/download", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      error: "No URL provided"
    });
  }

  res.json({
    success: true,
    message: "Backend connected successfully",
    url
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
