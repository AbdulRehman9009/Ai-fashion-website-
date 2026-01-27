"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import Link from "next/link";
import { Loader2, KeyRound, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center mt-10"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <UserResetPasswordContent />
    </Suspense>
  );
}

function UserResetPasswordContent() {
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
        toast.info("DEMO MODE: Token received");
        // Simulate clicking the link
        // Simulate clicking the link
        setTimeout(() => {
          router.push(`/auth/user/reset-password?token=${data.debugToken}`);
        }, 1500);
      } else {
        setStep(3); // Email sent view
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

      toast.success("Password reset successfully! Please login.");
      router.push("/auth/user/login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === 3) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10 shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>We have sent a password reset link to {email}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/auth/user/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10 shadow-lg border-t-4 border-blue-600">
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <KeyRound className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>{step === 1 ? "Reset Password" : "Set New Password"}</CardTitle>
        <CardDescription>
          {step === 1
            ? "Enter your email to receive a reset link"
            : "Enter your new secure password"}
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
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
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
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Reset Password"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/auth/user/login" className="text-sm text-gray-500 hover:text-gray-900">
          Back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}
