import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  // Hash password securely
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into Supabase
  const { error } = await supabase.from("users").insert([
    {
      email,
      password: hashedPassword,
      balance: 0
    }
  ]);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ success: true });
}
