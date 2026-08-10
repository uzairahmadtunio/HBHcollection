import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/site/AuthForm";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — HBH Collection" },
      {
        name: "description",
        content:
          "Create your HBH Collection account to shop premium Pakistani fashion, save a wishlist and track your orders.",
      },
      { property: "og:title", content: "Create Account — HBH Collection" },
      {
        property: "og:description",
        content: "Join HBH Collection — shop premium fashion and track your orders.",
      },
    ],
  }),
  component: () => <AuthForm initialMode="signup" />,
});
