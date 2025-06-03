const axios = require("axios");

module.exports = async function handler(req, res) {
  // Enable body parsing if needed (Vercel default is true)
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  let message;
  try {
    message = req.body.message;
    if (!message) throw new Error("Missing message");
  } catch {
    return res.status(400).json({ reply: "Invalid or missing message." });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://4evaglow.org",
          "X-Title": "4EvaGlow AI Chat Assistant",
        },
      }
    );
    console.log("Using API key:", process.env.OPENROUTER_API_KEY ? "✅ Set" : "❌ Not Set");

    const reply = response.data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (err) {
    console.error("OpenRouter error:", err.response?.data || err.message);
    res.status(500).json({ reply: "Sorry, AI is currently unavailable." });
  }
};
