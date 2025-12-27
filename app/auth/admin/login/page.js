"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield } from "lucide-react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                toast.error("Invalid admin credentials");
            } else {
                toast.success("Welcome back, Admin!");
                router.push("/dashboard/admin");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-xl border-t-4 border-red-900">
            <CardHeader className="text-center space-y-1">
                <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-900 mb-4">
                    <Shield className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-red-900">Admin Portal</CardTitle>
                <CardDescription>Secure access for system administrators only.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@styleai.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="focus:ring-red-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="focus:ring-red-500"
                        />
                    </div>
                    <Button className="w-full bg-red-900 hover:bg-red-800" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
