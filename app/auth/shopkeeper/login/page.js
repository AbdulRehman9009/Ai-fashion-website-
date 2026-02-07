import AuthForm from "@/components/auth/AuthForm";

export const dynamic = 'force-dynamic';

export default function ShopkeeperLoginPage() {
  return (
    <AuthForm role="SHOPKEEPER" type="login" />
  );
}
