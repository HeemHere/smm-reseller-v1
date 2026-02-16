export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { link, quantity } = req.body;

  // API KEY stored in environment variable
  const API_KEY = process.env.API_KEY;

  // Replace with your SMM panel API URL
  const PANEL_URL = "https://lionfollow.com/api/v2";

  const response = await fetch(PANEL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: API_KEY,
      action: "add",
      service: "123", // your service ID
      link,
      quantity
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}
