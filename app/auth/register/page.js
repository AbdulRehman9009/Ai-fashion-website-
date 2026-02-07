"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Scissors, ShoppingBag, Truck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const roles = [
    {
      key: "user",
      title: "Customer",
      description: "Discover curated styles & get AI recommendations.",
      icon: User,
      gradient: "from-blue-500 to-cyan-500",
      href: "/auth/user/register"
    },
    {
      key: "tailor",
      title: "Tailor",
      description: "Receive orders & manage stitching tasks.",
      icon: Scissors,
      gradient: "from-orange-500 to-red-500",
      href: "/auth/tailor/register"
    },
    {
      key: "shopkeeper",
      title: "Shopkeeper",
      description: "Manage inventory, products & sales.",
      icon: ShoppingBag,
      gradient: "from-purple-500 to-indigo-500",
      href: "/auth/shopkeeper/register"
    },
    {
      key: "delivery",
      title: "Delivery Partner",
      description: "Earn by delivering fashion happiness.",
      icon: Truck,
      gradient: "from-green-500 to-emerald-500",
      href: "/auth/delivery/register"
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white"
        >
          Join StyleAI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 dark:text-gray-400"
        >
          Choose your role to get started
        </motion.p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {roles.map((role, index) => (
          <Link key={role.key} href={role.href} className="block group h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="relative h-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${role.gradient}`} />

              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white bg-gradient-to-br ${role.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <role.icon className="w-6 h-6" />
                </div>

                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {role.title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-grow">
                  {role.description}
                </p>

                <div className="flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        Already have an account?{" "}
        <Link href="/auth/user/login" className="font-semibold text-primary hover:underline hover:text-primary-hover">
          Sign in
        </Link>
      </motion.div>
    </div>
  );
}
