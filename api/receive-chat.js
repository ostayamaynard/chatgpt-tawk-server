const axios = require("axios");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const payload = req.body;

    console.log("📥 Raw Tawk Webhook Payload:", JSON.stringify(payload, null, 2));

    const transcript = payload?.data?.messages;
    if (!transcript || transcript.length === 0) {
      return res.status(400).json({ error: "No messages found in webhook payload" });
    }

    // Find latest visitor message
    const lastVisitorMessage = transcript.reverse().find(msg => msg.senderType === "visitor");

    if (!lastVisitorMessage) {
      return res.status(400).json({ error: "No visitor message found" });
    }

    const text = lastVisitorMessage.message;
    console.log("💬 Visitor message:", text);

    // Send to GPT
    const gptResponse = await axios.post("https://chatgpt-tawk-server.vercel.app/api/gpt-reply", {
      message: text,
    });

    const reply = gptResponse.data.reply;
    console.log("🤖 GPT says:", reply);

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Error in receive-chat:", err.response?.data || err.message);
    return res.status(500).json({ error: "Internal error" });
  }
};
