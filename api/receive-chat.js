const axios = require("axios");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { message } = req.body;

    const text = message?.text;
    if (!text) return res.status(400).json({ error: "Missing visitor message text" });

    // Forward to GPT endpoint
    const gptResponse = await axios.post("https://chatgpt-tawk-server.vercel.app/api/gpt-reply", {
      message: text,
    });

    const reply = gptResponse.data.reply;
    console.log("🤖 GPT says:", reply);

    // Respond back to Tawk webhook
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Error in receive-chat:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
};
