import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/site/AuthForm";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — HBH Collection" },
      {
        name: "description",
        content:
          "Sign in to your HBH Collection account to track orders, manage your wishlist and check out faster.",
      },
      { property: "og:title", content: "Login — HBH Collection" },
      { property: "og:description", content: "Sign in to your HBH Collection account." },
    ],
  }),
  component: () => <AuthForm initialMode="signin" />,
});
