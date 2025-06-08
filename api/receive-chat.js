const axios = require("axios");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const payload = req.body;

    console.log("📩 Webhook received:", JSON.stringify(payload, null, 2));

    const text = payload?.message?.text;

    if (!text) {
      console.warn("⚠️ No visitor message found in webhook.");
      return res.status(400).json({ error: "No visitor message found" });
    }

    // Send message to GPT API
    const gptRes = await axios.post("https://chatgpt-tawk-server.vercel.app/api/gpt-reply", {
      message: text,
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    const reply = gptRes.data.reply;
    console.log("🤖 GPT Reply:", reply);

    // Respond to webhook
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Webhook handler error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
};
