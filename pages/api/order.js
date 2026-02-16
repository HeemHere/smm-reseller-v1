import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { email, service, link, quantity, price } = req.body;

  if (!email || !service || !link || !quantity || !price) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // 1️⃣ Get user balance
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: "User not found" });
  }

  // 2️⃣ Check balance
  if (user.balance < price) {
    return res.status(400).json({
      error: "Not enough balance",
      balance: user.balance
    });
  }

  // 3️⃣ Deduct balance
  const newBalance = user.balance - price;

  await supabase
    .from("users")
    .update({ balance: newBalance })
    .eq("email", email);

  // 4️⃣ Send order to SMM Panel
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

  // 5️⃣ Return order + updated balance
  res.status(200).json({
    success: true,
    order: data,
    newBalance
  });
}
