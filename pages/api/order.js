export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { service, link, quantity } = req.body || {};

    if (!service || !link || !quantity) {
      return res.status(400).json({ error: "Missing service ID, link, or quantity" });
    }

    const API_KEY = process.env.API_KEY;
    const PANEL_URL = "https://lionfollow.com/api/v2";

    const params = new URLSearchParams();
    params.append("key", API_KEY);
    params.append("action", "add");
    params.append("service", service); // ✅ dynamic service ID from front-end
    params.append("link", link);
    params.append("quantity", quantity);

    const response = await fetch(PANEL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
}
