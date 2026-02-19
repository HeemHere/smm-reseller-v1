import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { email, amount } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("balance")
    .eq("email", email)
    .single();

  const newBalance = Number(user.balance) + Number(amount);

  await supabase
    .from("users")
    .update({ balance: newBalance })
    .eq("email", email);

  res.status(200).json({ success: true, newBalance });
}
