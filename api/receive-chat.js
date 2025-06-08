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

    const message = payload.message?.text;
    const isVisitor = payload.message?.sender?.type === "visitor";

    if (!message || !isVisitor) {
      console.warn("⚠️ No valid visitor message found.");
      return res.status(400).json({ error: "No valid visitor message." });
    }

    // Call GPT reply API
    const gptRes = await axios.post("https://chatgpt-tawk-server.vercel.app/api/gpt-reply", {
      message,
    });

    const reply = gptRes.data.reply;
    console.log("🤖 GPT Reply:", reply);

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Error processing webhook:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
