import type { Metadata } from "next";
import policies from "@/data/policies.json";
import { PolicyPage } from "@/components/sections/PolicyPage";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "How to return an eligible Prime Tech purchase within 7 days, arrange an exchange or resolve a product fault.",
};

export default function Page() {
  return <PolicyPage policy={policies.returns} path="/returns" />;
}
