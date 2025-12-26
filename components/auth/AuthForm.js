"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import Link from "next/link";

export default function AuthForm({ role, type }) { // type: "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const roleLabels = {
    USER: "Customer",
    TAILOR: "Tailor",
    SHOPKEEPER: "Shopkeeper",
    DELIVERY: "Delivery Partner",
    ADMIN: "Administrator"
  };

  const displayRole = roleLabels[role] || role;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === "register") {
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
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          {type === "login" ? "Sign In" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-center">
          {type === "login" 
            ? `Welcome back, ${displayRole}.` 
            : `Join as a ${displayRole} today.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {type === "login" && (
                <Link 
                  href={`/auth/${role.toLowerCase()}/reset-password`}
                  className="text-sm text-gray-500 hover:text-gray-900 hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : (type === "login" ? "Sign In" : "Create Account")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          {type === "login" ? "Don't have an account? " : "Already have an account? "}
          <Link 
            href={type === "login" ? `/auth/${role.toLowerCase()}/register` : `/auth/${role.toLowerCase()}/login`}
            className="font-medium text-gray-900 hover:underline"
          >
            {type === "login" ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
