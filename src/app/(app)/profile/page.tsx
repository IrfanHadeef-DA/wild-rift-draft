import type { Metadata } from "next";
import { HeroPoolPage } from "@/components/profile/HeroPoolPage";

export const metadata: Metadata = { title: "Hero pool" };

export default function ProfilePage() {
  return <HeroPoolPage />;
}
