const axios = require("axios");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const body = req.body;

    console.log("📥 Webhook Data Received:", JSON.stringify(body, null, 2));

    // Extract the latest message from transcript
    const lastMsg =
      body?.transcript?.[body.transcript.length - 1]?.message?.trim();

    if (!lastMsg) {
      return res.status(200).json({ status: "No message found" });
    }

    // Send it to your GPT handler
    const aiResponse = await axios.post(
      "https://chatgpt-tawk-server.vercel.app/api/gpt-reply",
      { message: lastMsg },
      { headers: { "Content-Type": "application/json" } }
    );

    const reply = aiResponse.data.reply;
    console.log("🤖 AI response:", reply);

    // You could forward this back to Tawk here if you wish

    res.status(200).json({ status: "OK", message: lastMsg, reply });
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    res.status(500).json({ error: "Failed to process webhook" });
  }
};
