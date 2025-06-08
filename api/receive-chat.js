const axios = require("axios");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const payload = req.body;

  try {
    const transcript = payload?.data?.messages;
    if (!transcript || !Array.isArray(transcript)) {
      return res.status(400).json({ error: "No messages found in webhook payload" });
    }

    const visitorMsg = [...transcript].reverse().find(msg => msg.senderType === "visitor");

    if (!visitorMsg || !visitorMsg.text) {
      return res.status(400).json({ error: "No valid visitor message" });
    }

    const gptResponse = await axios.post("https://chatgpt-tawk-server.vercel.app/api/gpt-reply", {
      message: visitorMsg.text,
    });

    const reply = gptResponse.data.reply || "Sorry, AI is unavailable.";

    // Send response to Tawk via REST API
    await axios.post("https://api.tawk.to/chat/webhook/send-message", {
      chatId: payload.chatId,
      text: reply,
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAWK_API_KEY}`, // secure this in Vercel
      }
    });

    return res.status(200).json({ status: "Reply sent to Tawk", reply });
  } catch (err) {
    console.error("❌ Error in receive-chat:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};
