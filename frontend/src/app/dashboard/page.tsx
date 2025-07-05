import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DualPaneLayout } from "@/components/layout/DualPaneLayout";
import ChatInterface from "@/components/ai/ChatInterface";

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
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-glass">
                AI Business Assistant
              </h1>
              <p className="text-glass-secondary text-sm">
                Your intelligent partner for business growth and optimization
              </p>
            </div>
          </div>
        </div>
        
        {/* Chat Interface */}
        <div className="flex-1">
          <ChatInterface />
        </div>
      </div>
    </DualPaneLayout>
  );
}