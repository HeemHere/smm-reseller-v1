import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { email, amount, note } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ error: "Missing email or amount" });
  }

  // Insert deposit request
  const { error } = await supabase.from("deposits").insert([
    {
      email,
      amount,
      note,
      status: "pending"
    }
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ success: true });
}
