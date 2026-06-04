import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Sign up · Lumera-Connect" }] }),
  component: () => <AuthShell mode="register" />,
});