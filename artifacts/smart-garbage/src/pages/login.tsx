import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Leaf } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || "Login failed");
        return;
      }

      login(data.user);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "cleaning_staff") {
        navigate("/staff");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8">
        <div className="flex justify-center">
          <div className="bg-green-600 text-white p-3 rounded-xl">
            <Leaf className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mt-5">
          Welcome Back
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Login to your EcoGuard account
        </p>

        <form onSubmit={handleLogin} className="space-y-5 mt-8">
          <div>
            <label className="block mb-2 font-medium">Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 py-3 text-white font-semibold hover:bg-green-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-6">
          Don't have an account?{" "}
          <Link href="/signup">
            <span className="cursor-pointer font-semibold text-green-600">
              Sign Up
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}