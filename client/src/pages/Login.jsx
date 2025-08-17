import React, { useState } from "react";
import { login, register } from "../services/api.js";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "register") {
        const d = await register({ username, email, password });
        localStorage.setItem("token", d.token);
        location.href = "/";
      } else {
        const d = await login({ email, password });
        localStorage.setItem("token", d.token);
        location.href = "/";
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100">
      {/* Logo */}
      <div className="mb-6">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
          <span className="text-2xl font-bold">CC</span>
          {/* Replace with your app logo or SVG */}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-xl font-semibold mb-6">
        {mode === "login" ? "Sign in to CoupleChat" : "Create your CoupleChat account"}
      </h1>

      {/* Form Card */}
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-md p-6 shadow-lg"
      >
        {mode === "register" && (
          <div className="mb-4">
            <label className="block text-sm mb-1">Username</label>
            <input
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-700 bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm mb-1">Email address</label>
          <input
            type="email"
            className="w-full px-3 py-2 text-sm rounded-md border border-gray-700 bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm mb-1">Password</label>
            {mode === "login" && (
              <a href="#" className="text-sm text-blue-500 hover:underline">
                Forgot password?
              </a>
            )}
          </div>
          <input
            type="password"
            className="w-full px-3 py-2 text-sm rounded-md border border-gray-700 bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium"
        >
          {mode === "register" ? "Create account" : "Sign in"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="px-2 text-gray-400 text-xs">or</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        {/* Google Button */}
        <button
          type="button"
          className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md text-sm"
        >
          <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-4 h-4 mr-2" />
          Continue with Google
        </button>
      </form>

      {/* Footer Links */}
      <div className="mt-4 text-sm text-gray-400">
        {mode === "register" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            New to CoupleChat?{" "}
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => setMode("register")}
            >
              Create an account
            </button>
          </>
        )}
      </div>

      {/* Footer bottom */}
      <footer className="mt-12 text-xs text-gray-500 flex gap-4">
        <a href="#" className="hover:underline">Terms</a>
        <a href="#" className="hover:underline">Privacy</a>
        <a href="#" className="hover:underline">Help</a>
      </footer>
    </div>
  );
}
