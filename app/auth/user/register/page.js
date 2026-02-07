import AuthForm from "@/components/auth/AuthForm";

export const dynamic = 'force-dynamic';

export default function UserRegisterPage() {
  return <AuthForm role="USER" type="register" />;
}
