import type { Metadata } from "next";
import policies from "@/data/policies.json";
import { PolicyPage } from "@/components/sections/PolicyPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms for purchasing from Prime Tech Kenya, including payment, delivery, warranty and customer responsibilities.",
};

export default function Page() {
  return <PolicyPage policy={policies.terms} path="/terms" />;
}
