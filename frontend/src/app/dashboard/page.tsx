import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DualPaneLayout } from "@/components/layout/DualPaneLayout";
import ChatInterface from "@/components/ai/ChatInterface";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DualPaneLayout>
      <div className="h-full flex flex-col">
        {/* Welcome Header */}
        <div className="glass-section mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent-coral to-accent-blue flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-glass">
                Business Dashboard
              </h1>
              <p className="text-glass-secondary text-sm">
                Comprehensive business intelligence and financial analytics
              </p>
            </div>
          </div>
        </div>
        
        {/* Financial Dashboard */}
        <div className="flex-1 overflow-auto">
          <FinancialDashboard />
        </div>
      </div>
    </DualPaneLayout>
  );
}