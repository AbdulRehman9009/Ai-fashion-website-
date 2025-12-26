import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User, Scissors, ShoppingBag, Truck } from "lucide-react";

export default function RegisterPage() {
  const roles = [
    {
      key: "user",
      title: "Customer",
      description: "Shop specifically curated styles and get AI recommendations.",
      icon: User,
      color: "bg-blue-100 text-blue-600",
      href: "/auth/user/register"
    },
    {
      key: "tailor",
      title: "Tailor",
      description: "Receive orders, manage stitching tasks, and grow your business.",
      icon: Scissors,
      color: "bg-orange-100 text-orange-600",
      href: "/auth/tailor/register"
    },
    {
      key: "shopkeeper",
      title: "Shopkeeper",
      description: "Manage your inventory, products, and sales efficiently.",
      icon: ShoppingBag,
      color: "bg-purple-100 text-purple-600",
      href: "/auth/shopkeeper/register"
    },
    {
      key: "delivery",
      title: "Delivery Partner",
      description: "Deliver happiness and earn with every successful delivery.",
      icon: Truck,
      color: "bg-green-100 text-green-600",
      href: "/auth/delivery/register"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Join StyleAI</h1>
        <p className="text-gray-500">Choose how you want to use the platform.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
        {roles.map((role) => (
          <Link key={role.key} href={role.href}>
            <Card className="h-full hover:shadow-lg transition-all cursor-pointer hover:border-blue-500 group">
              <CardContent className="flex items-center gap-6 p-6">
                <div className={`h-16 w-16 rounded-xl flex items-center justify-center ${role.color} transition-transform group-hover:scale-110`}>
                  <role.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition-colors">{role.title}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        Already have an account? <Link href="/auth/user/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link>
      </div>
    </div>
  );
}
