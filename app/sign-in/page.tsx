import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign in — Vertex" };

export default function SignInPage() {
  return <AuthForm mode="sign-in" />;
}
