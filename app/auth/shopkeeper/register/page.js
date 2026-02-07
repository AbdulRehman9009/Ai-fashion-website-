import AuthForm from "@/components/auth/AuthForm";

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function ShopkeeperRegisterPage() {
  return (
    <AuthForm role="SHOPKEEPER" type="register" />
  );
}
