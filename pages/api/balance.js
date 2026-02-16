import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  const { email } = req.query;

  const { data, error } = await supabase
    .from("users")
    .select("balance")
    .eq("email", email)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ balance: data.balance });
}
