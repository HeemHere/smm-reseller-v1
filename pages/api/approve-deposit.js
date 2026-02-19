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

  // Get deposit
  const { data: deposit } = await supabase
    .from("deposits")
    .select("*")
    .eq("id", deposit_id)
    .single();

  if (!deposit) {
    return res.status(404).json({ error: "Deposit not found" });
  }

  // Mark deposit approved
  await supabase
    .from("deposits")
    .update({ status: "approved" })
    .eq("id", deposit_id);

  // Update user balance + total deposited
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", deposit.email)
    .single();

  const newBalance = Number(user.balance) + Number(deposit.amount);
  const newDeposited = Number(user.total_deposited) + Number(deposit.amount);

  await supabase
    .from("users")
    .update({
      balance: newBalance,
      total_deposited: newDeposited
    })
    .eq("email", deposit.email);

  res.status(200).json({ success: true, newBalance });
}
