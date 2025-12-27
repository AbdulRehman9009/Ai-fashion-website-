"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import Link from "next/link";
import { Loader2, Shirt, Scissors, Truck, Store, User, Shield, Eye, EyeOff, Check, X } from "lucide-react";
// import zxcvbn from "zxcvbn"; // Dynamic import better for client

export default function AuthForm({ role, type }) { // type: "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");

  const router = useRouter();

  const roleConfig = {
    USER: { label: "Customer", color: "bg-blue-600", text: "text-blue-600", icon: User },
    TAILOR: { label: "Tailor", color: "bg-purple-600", text: "text-purple-600", icon: Scissors },
    SHOPKEEPER: { label: "Shopkeeper", color: "bg-orange-600", text: "text-orange-600", icon: Store },
    DELIVERY: { label: "Delivery Partner", color: "bg-green-600", text: "text-green-600", icon: Truck },
    ADMIN: { label: "Administrator", color: "bg-red-900", text: "text-red-900", icon: Shield }
  };

  const config = roleConfig[role] || roleConfig["USER"];
  const Icon = config.icon;

  // Simple password strength checker to avoid heavy client bundle immediately
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback("");
      return;
    }
    let score = 0;
    if (password.length > 7) score += 1;
    if (password.match(/[A-Z]/)) score += 1;
    if (password.match(/[0-9]/)) score += 1;
    if (password.match(/[^A-Za-z0-9]/)) score += 1;

    setPasswordStrength(score);
    if (score < 2) setPasswordFeedback("Weak");
    else if (score < 4) setPasswordFeedback("Medium");
    else setPasswordFeedback("Strong");
  }, [password]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === "register") {
        if (passwordStrength < 2) throw new Error("Password is too weak.");

        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role, name }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");

        // Auto login after register
        const loginRes = await signIn("credentials", { email, password, redirect: false });
        if (!loginRes?.ok) throw new Error("Auto-login failed");

        toast.success("Account created successfully!");
        router.push(`/dashboard/${role.toLowerCase()}`);
      } else {
        const res = await signIn("credentials", { email, password, redirect: false });
        if (res?.error) throw new Error("Invalid credentials");

        toast.success("Welcome back!");
        router.push(`/dashboard/${role.toLowerCase()}`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-t-4 animate-in fade-in zoom-in duration-500" style={{ borderColor: config.color.replace('bg-', 'var(--') }}>
      <CardHeader className="space-y-1 text-center">
        <div className={`mx-auto h-16 w-16 rounded-full ${config.color} flex items-center justify-center text-white mb-4 shadow-xl ring-4 ring-white`}>
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">
          {type === "login" ? "Welcome Back" : "Join Us"}
        </CardTitle>
        <CardDescription className="text-base">
          {type === "login"
            ? <span>Sign in to your <span className={`font-semibold ${config.text}`}>{config.label}</span> account</span>
            : <span>Create your <span className={`font-semibold ${config.text}`}>{config.label}</span> account</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {type === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-gray-50/50"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-50/50"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {type === "login" && (
                <Link
                  href={`/auth/${role.toLowerCase()}/reset-password`}
                  className={`text-sm ${config.text} hover:underline font-medium`}
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative group">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10 bg-gray-50/50 group-hover:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {type === "register" && password && (
              <div className="space-y-1 pt-1">
                <div className="flex h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength <= 2 ? 'bg-red-500' :
                        passwordStrength === 3 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  />
                </div>
                <p className={`text-xs text-right font-medium ${passwordStrength <= 2 ? 'text-red-500' :
                    passwordStrength === 3 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                  {passwordFeedback}
                </p>
              </div>
            )}

          </div>
          <Button type="submit" className={`w-full ${config.color} hover:opacity-90 h-11 text-base shadow-lg`} disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (type === "login" ? "Sign In" : "Create Account")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center pb-8">
        <p className="text-sm text-gray-500">
          {type === "login" ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={type === "login" ? `/auth/${role.toLowerCase()}/register` : `/auth/${role.toLowerCase()}/login`}
            className={`font-semibold ${config.text} hover:underline`}
          >
            {type === "login" ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
