import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Auth({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    console.log("SIGNUP DATA:", data);
    console.log("SIGNUP ERROR:", error);
    if (error) alert(error.message);
    if (data.user) setUser(data.user);
  };

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    if (data.user) setUser(data.user);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-80">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

      <input
        className="border p-2 rounded w-full mb-4"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 rounded w-full mb-4"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={signIn}
        className="bg-blue-500 text-white w-full p-2 rounded mb-2"
      >
        Sign In
      </button>

      <button
        onClick={signUp}
        className="bg-green-500 text-white w-full p-2 rounded"
      >
        Sign Up
      </button>
    </div>
  );
}