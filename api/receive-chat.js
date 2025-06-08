const axios = require("axios");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const payload = req.body;

  try {
    console.log("📩 Webhook Received:", JSON.stringify(payload, null, 2));

    const transcript = payload.messages || [];
    const latestMessage = [...transcript].reverse().find(
      (msg) => msg.sender?.type === "visitor" && msg.text
    );

    if (!latestMessage) {
      console.warn("❗ No visitor message found.");
      return res.status(400).json({ error: "No visitor message found." });
    }

    const visitorMessage = latestMessage.text;
    const gptRes = await axios.post(
      "https://chatgpt-tawk-server.vercel.app/api/gpt-reply",
      { message: visitorMessage }
    );

    const reply = gptRes.data.reply;
    console.log("🤖 GPT Reply:", reply);

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("🔥 Error in receive-chat:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
};
