const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Configuration CORS globale
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.get("/audio", async (req, res) => {
  try {
    const { url } = req.query;
    console.log("🎵 Audio request received for URL:", url);

    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "*/*",
      },
    });

    // Headers CORS spécifiques pour l'audio
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Range"
    );
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Range"
    );
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

    // Headers audio
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Accept-Ranges", "bytes");

    response.data.pipe(res);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Failed to fetch audio" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
