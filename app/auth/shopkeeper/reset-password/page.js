"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import Link from "next/link";
import { Loader2, KeyRound, CheckCircle, Store } from "lucide-react";

export default function ShopkeeperResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>}>
      <ShopkeeperResetPasswordContent />
    </Suspense>
  );
}

function ShopkeeperResetPasswordContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Request, 2: Reset
  const [token, setToken] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token");

  useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
      setStep(2);
    }
  }, [urlToken]);

  async function handleRequest(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send link");

      toast.success(data.message);

      if (data.debugToken) {
        toast.info("DEMO: Token received. Auto-redirecting...");
        setTimeout(() => {
          router.push(`/auth/shopkeeper/reset-password?token=${data.debugToken}`);
        }, 1500);
      } else {
        setStep(3);
      }

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      toast.success("Password reset successfully!");
      router.push("/auth/shopkeeper/login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === 3) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10 shadow-lg text-center border-t-4 border-orange-600">
        <CardHeader>
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>We have sent a reset link to {email}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/auth/shopkeeper/login" className="text-orange-600 hover:underline">Back to Login</Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md shadow-2xl border-t-4 border-orange-600">
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Store className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle>{step === 1 ? "Shopkeeper Password Reset" : "Set New Password"}</CardTitle>
        <CardDescription>
          {step === 1
            ? "Enter your email to recover your business account"
            : "Create a new strong password"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="shop@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Send Reset Link"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pass">New Password</Label>
              <Input
                id="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Reset Password"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/auth/shopkeeper/login" className="text-sm text-gray-500 hover:text-gray-900">
          Back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}
