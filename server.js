const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const ffmpegPath = require("ffmpeg-static");
const youtubedl = require("youtube-dl-exec");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const ALLOWED = [
  /(^|\.)youtube\.com$/, /(^|\.)youtu\.be$/,
  /(^|\.)tiktok\.com$/,
  /(^|\.)instagram\.com$/,
  /(^|\.)facebook\.com$/, /(^|\.)fb\.watch$/,
  /(^|\.)x\.com$/, /(^|\.)twitter\.com$/,
  /(^|\.)reddit\.com$/,
  /(^|\.)pinterest\.com$/, /(^|\.)pin\.it$/,
];

function isAllowed(raw) {
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) return false;
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    return ALLOWED.some((re) => re.test(host));
  } catch {
    return false;
  }
}

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "reeloops-backend" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/download", async (req, res) => {
  const { url } = req.body || {};

  if (!url || typeof url !== "string" || !isAllowed(url)) {
    return res.status(400).json({ error: "Invalid or unsupported URL" });
  }

  const id = crypto.randomBytes(8).toString("hex");
  const outFile = path.join(os.tmpdir(), `${id}.mp4`);

  try {
    await youtubedl(url, {
      output: outFile,
      format: "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/best",
      mergeOutputFormat: "mp4",
      noPlaylist: true,
      noWarnings: true,
      ffmpegLocation: ffmpegPath,
      retries: 2,
      socketTimeout: 30
    });

    if (!fs.existsSync(outFile)) {
      throw new Error("Download failed");
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="reeloops-${id}.mp4"`);

    const stream = fs.createReadStream(outFile);
    stream.pipe(res);

    stream.on("close", () => fs.unlink(outFile, () => {}));
    stream.on("error", () => fs.unlink(outFile, () => {}));
  } catch (err) {
    fs.unlink(outFile, () => {});
    console.error("download error:", err?.stderr || err?.message || err);

    res.status(500).json({
      error: "Could not download this video. It may be private, region-locked, or unsupported."
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
