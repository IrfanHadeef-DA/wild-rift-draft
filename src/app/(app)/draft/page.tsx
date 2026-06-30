import type { Metadata } from "next";
import { DraftBoard } from "@/components/draft/DraftBoard";

export const metadata: Metadata = { title: "Draft" };

export default function DraftPage() {
  return <DraftBoard />;
}
