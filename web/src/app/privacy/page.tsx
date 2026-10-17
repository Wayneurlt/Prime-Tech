import type { Metadata } from "next";
import policies from "@/data/policies.json";
import { PolicyPage } from "@/components/sections/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What information Prime Tech Kenya handles, why we need it, and the choices available to you under Kenya’s Data Protection Act, 2019.",
};

export default function Page() {
  return <PolicyPage policy={policies.privacy} path="/privacy" />;
}
