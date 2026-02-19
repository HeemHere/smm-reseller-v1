import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { email, service, link, quantity, cost } = req.body || {};

    if (!email || !service || !link || !quantity || !cost) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get user balance
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) return res.status(404).json({ error: "User not found" });

    // Check balance
    if (Number(user.balance) < Number(cost)) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct balance + update total spent
    const newBalance = Number(user.balance) - Number(cost);
    const newSpent = Number(user.total_spent) + Number(cost);

    await supabase
      .from("users")
      .update({
        balance: newBalance,
        total_spent: newSpent
      })
      .eq("email", email);

    // Save order in database
    await supabase.from("orders").insert([
      {
        email,
        service_id: service,
        link,
        quantity,
        cost,
        status: "pending"
      }
    ]);

    // Send order to panel API
    const API_KEY = process.env.API_KEY;
    const PANEL_URL = "https://lionfollow.com/api/v2";

    const params = new URLSearchParams();
    params.append("key", API_KEY);
    params.append("action", "add");
    params.append("service", service);
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

    res.status(200).json({
      success: true,
      panelResponse: data,
      newBalance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
