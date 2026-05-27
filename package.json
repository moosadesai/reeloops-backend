const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const youtubedl = require("youtube-dl-exec");
const ffmpegPath = require("ffmpeg-static");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    ffmpeg: ffmpegPath
  });
});

app.post("/api/download", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: "No URL provided"
      });
    }

    const id = crypto.randomBytes(6).toString("hex");
    const output = path.join(os.tmpdir(), `${id}.mp4`);

    console.log("Downloading:", url);

    await youtubedl(url, {
      output,
      format: "mp4",
      ffmpegLocation: ffmpegPath,
    });

    if (!fs.existsSync(output)) {
      return res.status(500).json({
        error: "File was not created"
      });
    }

    res.download(output, () => {
      fs.unlinkSync(output);
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message || "Download failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
