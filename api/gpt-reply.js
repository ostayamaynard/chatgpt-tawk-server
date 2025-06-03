const axios = require("axios");

module.exports = async function handler(req, res) {
  // ✅ CORS headers (apply to all requests)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Handle preflight (CORS) request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // ✅ Validate request body
  let message;
  try {
    message = req.body.message;
    if (!message) throw new Error("Missing message");
  } catch {
    return res.status(400).json({ reply: "Invalid or missing message." });
  }

  try {
    // ✅ Make request to OpenRouter
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

    const reply = response.data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (err) {
    console.error("OpenRouter error:", err.response?.data || err.message);
    res.status(500).json({ reply: "Sorry, AI is currently unavailable." });
  }
};
