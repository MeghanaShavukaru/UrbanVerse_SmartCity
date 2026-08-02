"use client";

// ============================================================
// app/(auth)/login/page.tsx
// Login screen with email/password Firebase authentication
// ============================================================

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, MapPin, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Interactive City Maps",
    description: "Visualize and interact with predefined city zones on a live map",
  },
  {
    icon: Zap,
    title: "AI-Powered Analysis",
    description: "Describe your proposal in plain English and let AI structure it",
  },
  {
    icon: BarChart3,
    title: "Impact Simulation",
    description: "Run deterministic simulations and view animated metric changes",
  },
];

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success("Account created! Welcome to UrbanVerse AI");
      } else {
        await signIn(email, password);
        toast.success("Welcome back!");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Authentication failed";
      const friendlyMsg = msg.includes("user-not-found")
        ? "No account found with this email"
        : msg.includes("wrong-password")
        ? "Incorrect password"
        : msg.includes("email-already-in-use")
        ? "Email already registered"
        : "Authentication failed. Please try again.";
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  // Demo login
  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await signIn("demo@urbanverse.ai", "demo123456");
    } catch {
      toast.info("Demo account not configured — please create an account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setLoading(true);
    try {
      await signIn("guest@urbanverse.local", "guest-access");
      toast.success("Welcome! You can type or use the microphone in the planning assistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(222 47% 11%), hsl(217 33% 17%))" }}>

        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(217 91% 60%), transparent)", transform: "translate(-30%, -30%)" }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(142 71% 45%), transparent)", transform: "translate(30%, 30%)" }} />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-16"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(142 71% 45%))" }}>
              🏙️
            </div>
            <span className="text-white font-bold text-xl tracking-tight">UrbanVerse AI</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Ask your city
              <br />
              <span style={{ background: "linear-gradient(90deg, hsl(217 91% 70%), hsl(142 71% 55%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                before you change it.
              </span>
            </h1>
            <p className="text-lg" style={{ color: "hsl(215 20% 65%)" }}>
              AI-powered urban decision intelligence for smarter, more sustainable cities.
            </p>
          </motion.div>
        </div>

        {/* Feature List */}
        <div className="relative z-10 space-y-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(217 91% 60% / 0.2)", border: "1px solid hsl(217 91% 60% / 0.3)" }}>
                <feature.icon className="w-5 h-5" style={{ color: "hsl(217 91% 70%)" }} />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{feature.title}</p>
                <p className="text-sm mt-0.5" style={{ color: "hsl(215 20% 55%)" }}>{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10">
          <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>
            Built for the Singapore-India Hackathon · Powered by Google Gemini AI
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8"
        style={{ background: "hsl(var(--background))" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🏙️</span>
            <span className="font-bold text-xl">UrbanVerse AI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p style={{ color: "hsl(var(--muted-foreground))" }} className="text-sm">
              {isSignUp
                ? "Start planning smarter cities today"
                : "Sign in to your planning dashboard"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="planner@city.gov"
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all outline-none"
                style={{
                  background: "hsl(var(--muted))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
                onFocus={(e) => (e.target.style.borderColor = "hsl(var(--primary))")}
                onBlur={(e) => (e.target.style.borderColor = "hsl(var(--border))")}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-lg text-sm transition-all outline-none"
                  style={{
                    background: "hsl(var(--muted))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "hsl(var(--primary))")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(var(--border))")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: loading
                  ? "hsl(var(--primary) / 0.7)"
                  : "linear-gradient(135deg, hsl(var(--primary)), hsl(221 83% 53%))",
                boxShadow: "0 4px 14px hsl(var(--primary) / 0.3)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </span>
              ) : isSignUp ? "Create Account" : "Sign In"}
            </motion.button>

            {/* Demo */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-medium text-sm transition-all"
              style={{
                background: "hsl(var(--muted))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            >
              Try Demo Account
            </button>

            <button
              type="button"
              onClick={handleGuestAccess}
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-medium text-sm transition-all"
              style={{
                background: "hsl(var(--primary) / 0.1)",
                border: "1px solid hsl(var(--primary) / 0.25)",
                color: "hsl(var(--primary))",
              }}
            >
              Continue as Guest — Voice Ready
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "hsl(var(--muted-foreground))" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-semibold transition-colors"
              style={{ color: "hsl(var(--primary))" }}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
