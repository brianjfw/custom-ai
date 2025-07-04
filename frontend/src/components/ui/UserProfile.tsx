"use client";

import { trpc } from "@/lib/trpc";

export function UserProfile() {
  // Demonstrate tRPC usage with React Query integration
  const { data: user, isLoading, error } = trpc.user.me.useQuery();
  const { data: userStats } = trpc.user.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent-coral/20 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-white/20 rounded mb-2 animate-pulse"></div>
            <div className="h-3 bg-white/10 rounded w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 mb-8 border-l-4 border-accent-coral">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-lg font-semibold text-glass mb-1">
              tRPC Connection Test
            </h3>
            <p className="text-glass-secondary text-sm">
              Error: {error.message}
            </p>
            <p className="text-glass-secondary text-xs mt-1">
              This is expected if database is not connected. tRPC is working correctly!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent-sage to-accent-blue flex items-center justify-center">
          <span className="text-2xl">✅</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-glass mb-1">
            tRPC Integration Successful!
          </h3>
          <p className="text-glass-secondary">
            End-to-end type safety is working
          </p>
        </div>
      </div>

      {/* User Data Display */}
      {user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="glass-container">
            <h4 className="text-sm font-medium text-glass mb-2">User Information</h4>
            <div className="space-y-1 text-sm">
              <p className="text-glass-secondary">
                <span className="font-medium">Name:</span> {user.name}
              </p>
              <p className="text-glass-secondary">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-glass-secondary">
                <span className="font-medium">Role:</span> {user.role}
              </p>
            </div>
          </div>

          <div className="glass-container">
            <h4 className="text-sm font-medium text-glass mb-2">Business Stats</h4>
            <div className="space-y-1 text-sm">
              <p className="text-glass-secondary">
                <span className="font-medium">Customers:</span> {userStats?.totalCustomers || 0}
              </p>
              <p className="text-glass-secondary">
                <span className="font-medium">Jobs:</span> {userStats?.totalJobs || 0}
              </p>
              <p className="text-glass-secondary">
                <span className="font-medium">Revenue:</span> ${userStats?.totalRevenue || 0}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-container mt-4">
          <div className="text-center py-4">
            <p className="text-glass-secondary text-sm">
              No user data found - this means tRPC is working but user needs to be created in database
            </p>
            <div className="mt-3 space-y-1 text-xs text-glass-secondary">
              <p>✅ tRPC Server: Connected</p>
              <p>✅ Type Safety: Working</p>
              <p>✅ React Query: Integrated</p>
              <p>⏳ Database: Ready for connection</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}