"use client";
import { useState, useEffect } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import Link from "next/link";
import { Loader2, Shirt, Scissors, Truck, Store, User, Shield, Eye, EyeOff, Check, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthForm({ role, type }) { // type: "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formError, setFormError] = useState("");

  const router = useRouter();

  const roleConfig = {
    USER: { label: "Customer", gradient: "from-blue-600 to-cyan-500", icon: User, color: "blue-600" },
    TAILOR: { label: "Tailor", gradient: "from-purple-600 to-indigo-600", icon: Scissors, color: "purple-600" },
    SHOPKEEPER: { label: "Shopkeeper", gradient: "from-orange-500 to-red-600", icon: Store, color: "orange-500" },
    DELIVERY: { label: "Delivery Partner", gradient: "from-green-500 to-emerald-600", icon: Truck, color: "green-500" },
    ADMIN: { label: "Administrator", gradient: "from-red-700 to-red-900", icon: Shield, color: "red-700" }
  };

  const config = roleConfig[role] || roleConfig["USER"];
  const Icon = config.icon;

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    let score = 0;
    if (password.length > 7) score += 1;
    if (password.match(/[A-Z]/)) score += 1;
    if (password.match(/[0-9]/)) score += 1;
    if (password.match(/[^A-Za-z0-9]/)) score += 1;
    setPasswordStrength(score);
  }, [password]);

  useEffect(() => {
    setFormError("");
  }, [email, password, name]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    try {
      if (type === "register") {
        // Strict password validation
        const passwordRules = [
          { regex: /.{8,}/, message: "Password must be at least 8 characters" },
          { regex: /[A-Z]/, message: "Password must contain at least one uppercase letter" },
          { regex: /[a-z]/, message: "Password must contain at least one lowercase letter" },
          { regex: /[0-9]/, message: "Password must contain at least one number" },
          { regex: /[^A-Za-z0-9]/, message: "Password must contain at least one special character" }
        ];

        for (const rule of passwordRules) {
          if (!rule.regex.test(password)) throw new Error(rule.message);
        }

        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role, name: name?.length >= 2 ? name : undefined }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.errors && Array.isArray(data.errors)) {
            throw new Error(data.errors.map(e => `${e.field}: ${e.message}`).join("; "));
          }
          throw new Error(data.message || "Registration failed");
        }

        toast.success("Account created successfully!");
        const loginRes = await signIn("credentials", { email, password, redirect: false });

        if (!loginRes?.ok) router.push(`/auth/${role.toLowerCase()}/login`);
        else {
          const session = await getSession();
          if (session?.user?.role !== role) {
            await signOut({ redirect: false });
            throw new Error(`This email belongs to a ${roleConfig[session?.user?.role]?.label || "different"} account. Please use the correct ${config.label} login.`);
          }
          router.push(`/dashboard/${role.toLowerCase()}`);
        }

      } else {
        const res = await signIn("credentials", { email, password, redirect: false });
        if (res?.error) throw new Error("Invalid credentials");

        const session = await getSession();
        if (session?.user?.role !== role) {
          await signOut({ redirect: false });
          throw new Error(`This email belongs to a ${roleConfig[session?.user?.role]?.label || "different"} account. Please use the correct ${config.label} login.`);
        }

        toast.success("Welcome back!");
        router.push(`/dashboard/${role.toLowerCase()}`);
      }
    } catch (err) {
      setFormError(err.message || "Something went wrong");
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSocialLogin = (provider) => {
    document.cookie = `style_genie_oauth_role=${role}; path=/; max-age=600; SameSite=Lax`;
    signIn(provider, { callbackUrl: `/dashboard/${role.toLowerCase()}` });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Decorative Header Background */}
        <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />

        <div className="p-8 pb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white mb-6 shadow-lg transform rotate-3`}
          >
            <Icon className="h-8 w-8" />
          </motion.div>

          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {type === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {type === "login"
              ? `Sign in to your ${config.label} account`
              : `Join as a ${config.label} to get started`}
          </p>
        </div>

        <div className="px-8 pb-8 space-y-6">
          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" onClick={() => handleSocialLogin('google')} className="h-11 hover:bg-gray-50 dark:hover:bg-gray-800">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button variant="outline" type="button" onClick={() => handleSocialLogin('github')} className="h-11 hover:bg-gray-50 dark:hover:bg-gray-800">
              <svg className="h-5 w-5 mr-2 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Social signup will create or enter the selected {config.label} role.
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or continue with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "register" && (
              <div className="space-y-1">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11 pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': `var(--${config.color.split('-')[1]}-500)` }}
                  />
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all"
                />
                <div className="absolute left-3 top-3.5 h-4 w-4 text-gray-400">@</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                {type === "login" && (
                  <Link href={`/auth/${role.toLowerCase()}/reset-password`} className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
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
                  className="h-11 pl-10 pr-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all"
                  minLength={8}
                />
                <Shield className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {type === "register" && password && (
              <div className="space-y-1">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength >= step
                        ? (passwordStrength < 3 ? "bg-red-500" : passwordStrength < 4 ? "bg-yellow-500" : "bg-green-500")
                        : "bg-gray-200 dark:bg-gray-700"
                        }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-right text-gray-400">
                  {passwordStrength < 3 ? "Weak" : passwordStrength < 4 ? "Medium" : "Strong"}
                </p>
              </div>
            )}

            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 flex items-start gap-2"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className={`w-full h-12 text-base font-medium shadow-md transition-all hover:shadow-lg bg-gradient-to-r ${config.gradient} hover:opacity-90`}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <span className="flex items-center gap-2">
                  {type === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="pt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            {type === "login" ? "Don't have an account? " : "Already have an account? "}
            <Link
              href={type === "login" ? `/auth/${role.toLowerCase()}/register` : `/auth/${role.toLowerCase()}/login`}
              className="font-semibold text-gray-900 dark:text-white hover:underline decoration-2 underline-offset-4"
            >
              {type === "login" ? "Sign up" : "Sign in"}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
// Helper icon for error state
function AlertCircle(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
  )
}
