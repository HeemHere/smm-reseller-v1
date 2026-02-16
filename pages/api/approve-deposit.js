import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { deposit_id } = req.body;

  if (!deposit_id) {
    return res.status(400).json({ error: "Missing deposit ID" });
  }

  // 1️⃣ Get deposit request
  const { data: deposit, error } = await supabase
    .from("deposits")
    .select("*")
    .eq("id", deposit_id)
    .single();

  if (error || !deposit) {
    return res.status(404).json({ error: "Deposit not found" });
  }

  if (deposit.status === "approved") {
    return res.status(400).json({ error: "Already approved" });
  }

  // 2️⃣ Get user balance
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", deposit.email)
    .single();

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // 3️⃣ Add funds
  const newBalance = parseFloat(user.balance) + parseFloat(deposit.amount);

  await supabase
    .from("users")
    .update({ balance: newBalance })
    .eq("email", deposit.email);

  // 4️⃣ Mark deposit approved
  await supabase
    .from("deposits")
    .update({ status: "approved" })
    .eq("id", deposit_id);

  res.status(200).json({
    success: true,
    newBalance
  });
}
