export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    // Make sure body exists
    const { link, quantity } = req.body || {};

    if (!link || !quantity) {
      return res.status(400).json({ error: "Missing 'link' or 'quantity'" });
    }

    const API_KEY = process.env.API_KEY;
    const PANEL_URL = "https://lionfollow.com/api/v2"; // your panel URL
    const SERVICE_ID = "123"; // replace with actual service ID

    const response = await fetch(PANEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: API_KEY,
        action: "add",
        service: SERVICE_ID,
        link,
        quantity
      })
    });

    // Try parsing panel response safely
    let data;
    try {
      data = await response.json();
    } catch (e) {
      return res.status(500).json({ error: "Invalid JSON response from panel" });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
}
