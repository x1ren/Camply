// app/sell/page.tsx (Server Component)
import SellForm from "@/components/SellForm";

// Make this page dynamic to avoid build-time auth issues
export const dynamic = "force-dynamic";

export default function SellPage() {
  return <SellForm />;
}
