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

    const transcript = payload?.data?.messages;
    if (!transcript || transcript.length === 0) {
      console.log("⚠️ No messages in webhook");
      return res.status(400).json({ error: "No messages in webhook payload" });
    }

    const lastVisitorMessage = transcript
      .reverse()
      .find((msg) => msg.senderType === "visitor");

    if (!lastVisitorMessage || !lastVisitorMessage.message) {
      console.log("⚠️ No visitor message found");
      return res.status(400).json({ error: "No valid visitor message" });
    }

    const messageText = lastVisitorMessage.message;
    console.log("💬 Visitor said:", messageText);

    // Call GPT endpoint
    const gptResponse = await axios.post(
      "https://chatgpt-tawk-server.vercel.app/api/gpt-reply",
      { message: messageText }
    );

    const reply = gptResponse.data.reply;
    console.log("🤖 GPT says:", reply);

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Server error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
