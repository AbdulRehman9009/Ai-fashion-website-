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
import ReCAPTCHA from "react-google-recaptcha";
// import zxcvbn from "zxcvbn"; // Dynamic import better for client

export default function AuthForm({ role, type }) { // type: "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);

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
      if (!captchaToken) {
        throw new Error("Please complete the Captcha verification.");
      }

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

  const handleSocialLogin = (provider) => {
    signIn(provider, { callbackUrl: `/dashboard/${role.toLowerCase()}` });
  };

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
        {/* Social Login Section */}
        <div className="space-y-3 mb-6">
          <Button variant="outline" type="button" className="w-full h-11 flex items-center justify-center gap-2 hover:bg-gray-50 border-gray-300" onClick={() => handleSocialLogin('google')}>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>
          <Button variant="outline" type="button" className="w-full h-11 flex items-center justify-center gap-2 hover:bg-gray-50 border-gray-300" onClick={() => handleSocialLogin('github')}>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </Button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with email</span>
          </div>
        </div>

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
                minLength={8}
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

          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"} // Fallback for dev only if needed, ideally from env
              onChange={setCaptchaToken}
            />
          </div>

          <Button type="submit" className={`w-full ${config.color} hover:opacity-90 h-11 text-base shadow-lg transition-all`} disabled={loading}>
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
