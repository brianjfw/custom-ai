import { TRPCError } from '@trpc/server';
import { clerkClient } from '@clerk/nextjs/server';
import type { User } from '@clerk/nextjs/server';
import { protectedProcedure, publicProcedure, type Context } from '../trpc';

// Interface for tenant context
interface TenantContext {
  tenantId: string;
  tenantRole: 'owner' | 'admin' | 'member' | 'viewer';
  tenantPermissions: string[];
  organizationId?: string;
}

// Create tenant middleware
export const withTenant = protectedProcedure.use(async ({ ctx, next }) => {
  let user: User | null = null;
  try {
    const clerk = await clerkClient();
    user = await clerk.users.getUser(ctx.userId);
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to authenticate user',
    });
  }

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not found',
    });
  }

  // Extract tenant information
  const tenantId = user.publicMetadata?.tenantId as string || 
                  user.privateMetadata?.tenantId as string || 
                  ctx.userId; // Default to userId if no tenant specified

  const tenantRole = user.publicMetadata?.tenantRole as TenantContext['tenantRole'] || 'owner';
  const organizationId = user.publicMetadata?.organizationId as string;

  // Define permissions based on role
  const getPermissions = (role: TenantContext['tenantRole']): string[] => {
    switch (role) {
      case 'owner':
        return ['read', 'write', 'delete', 'admin', 'billing', 'users'];
      case 'admin':
        return ['read', 'write', 'delete', 'users'];
      case 'member':
        return ['read', 'write'];
      case 'viewer':
        return ['read'];
      default:
        return ['read'];
    }
  };

  const tenantContext: TenantContext = {
    tenantId,
    tenantRole,
    tenantPermissions: getPermissions(tenantRole),
    organizationId,
  };

  return next({
    ctx: {
      ...ctx,
      user,
      userId: ctx.userId,
      tenant: tenantContext,
    },
  });
});

// Permission checking middleware
export const requirePermission = (permission: string) => {
  return publicProcedure.use(async ({ ctx, next }) => {
    if (!('tenant' in ctx) || !ctx.tenant) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Tenant context required',
      });
    }

    if (!ctx.tenant.tenantPermissions.includes(permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Permission '${permission}' required`,
      });
    }

    return next();
  });
};

// Data isolation helper
export const withTenantFilter = (tenantId: string) => {
  return {
    // For filtering queries
    where: {
      tenantId: tenantId,
    },
    // For creating records
    data: {
      tenantId: tenantId,
    },
  };
};

// Multi-tenant procedures
export const tenantProcedure = withTenant;

export const tenantReadProcedure = withTenant.use(requirePermission('read'));

export const tenantWriteProcedure = withTenant.use(requirePermission('write'));

export const tenantDeleteProcedure = withTenant.use(requirePermission('delete'));

export const tenantAdminProcedure = withTenant.use(requirePermission('admin'));

// Organization-level procedures (for multi-business scenarios)
export const organizationProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!('tenant' in ctx) || !ctx.tenant?.organizationId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Organization context required',
    });
  }

  return next({
    ctx: {
      ...ctx,
      organizationId: ctx.tenant.organizationId,
    },
  });
});

// Utility functions for tenant operations
export const tenantUtils = {
  // Check if user can access tenant data
  canAccessTenant: (userTenantId: string, targetTenantId: string, userRole: string): boolean => {
    // User can access their own tenant data
    if (userTenantId === targetTenantId) return true;
    
    // Super admin can access any tenant
    if (userRole === 'super_admin') return true;
    
    return false;
  },

  // Get tenant-specific database filter
  getTenantFilter: (tenantId: string) => ({
    tenantId: tenantId,
  }),

  // Validate tenant permissions
  validateTenantPermission: (
    userPermissions: string[],
    requiredPermission: string
  ): boolean => {
    return userPermissions.includes(requiredPermission);
  },

  // Get tenant role hierarchy
  getRoleHierarchy: (): Record<string, number> => ({
    viewer: 1,
    member: 2,
    admin: 3,
    owner: 4,
  }),

  // Check if user role is higher than required
  hasRoleLevel: (userRole: string, requiredRole: string): boolean => {
    const hierarchy = tenantUtils.getRoleHierarchy();
    return hierarchy[userRole] >= hierarchy[requiredRole];
  },
};

// Export types for use in other files
export type { TenantContext };