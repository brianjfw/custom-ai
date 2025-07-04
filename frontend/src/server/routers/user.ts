import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { users, businessProfiles } from '@/db/schema';

export const userRouter = createTRPCRouter({
  /**
   * Get current user profile (public for flexibility)
   */
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return null;
    }

    const user = await ctx.db
      .select()
      .from(users)
      .where(eq(users.clerkId, ctx.userId))
      .limit(1);

    return user[0] || null;
  }),

  /**
   * Get user with business profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db
      .select({
        user: users,
        businessProfile: businessProfiles,
      })
      .from(users)
      .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
      .where(eq(users.clerkId, ctx.userId))
      .limit(1);

    return user[0] || null;
  }),

  /**
   * Create or update user profile
   */
  upsertUser: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1).max(256),
        avatarUrl: z.string().url().optional(),
        businessName: z.string().max(256).optional(),
        businessType: z.string().max(100).optional(),
        businessSize: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db
        .select()
        .from(users)
        .where(eq(users.clerkId, ctx.userId))
        .limit(1);

      if (existingUser.length > 0) {
        // Update existing user
        const [updatedUser] = await ctx.db
          .update(users)
          .set({
            email: input.email,
            name: input.name,
            avatarUrl: input.avatarUrl,
            businessName: input.businessName,
            businessType: input.businessType,
            businessSize: input.businessSize,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, ctx.userId))
          .returning();

        return updatedUser;
      } else {
        // Create new user
        const [newUser] = await ctx.db
          .insert(users)
          .values({
            clerkId: ctx.userId,
            email: input.email,
            name: input.name,
            avatarUrl: input.avatarUrl,
            businessName: input.businessName,
            businessType: input.businessType,
            businessSize: input.businessSize,
          })
          .returning();

        return newUser;
      }
    }),

  /**
   * Update business profile
   */
  updateBusinessProfile: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(1).max(256),
        businessType: z.string().min(1).max(100),
        industry: z.string().min(1).max(100).optional(),
        businessSize: z.string().max(50).optional(),
        description: z.string().optional(),
        website: z.string().max(256).optional(),
        phone: z.string().max(50).optional(),
        address: z.object({
          street: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
          country: z.string().optional(),
        }).optional(),
        businessHours: z.object({
          monday: z.object({ open: z.string(), close: z.string() }).optional(),
          tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
          wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
          thursday: z.object({ open: z.string(), close: z.string() }).optional(),
          friday: z.object({ open: z.string(), close: z.string() }).optional(),
          saturday: z.object({ open: z.string(), close: z.string() }).optional(),
          sunday: z.object({ open: z.string(), close: z.string() }).optional(),
        }).optional(),
        logo: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First ensure user exists
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.clerkId, ctx.userId))
        .limit(1);

      if (!user[0]) {
        throw new Error('User not found');
      }

      // Check if business profile exists
      const existingProfile = await ctx.db
        .select()
        .from(businessProfiles)
        .where(eq(businessProfiles.userId, user[0].id))
        .limit(1);

      if (existingProfile.length > 0) {
        // Update existing profile
        const [updatedProfile] = await ctx.db
          .update(businessProfiles)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(businessProfiles.userId, user[0].id))
          .returning();

        return updatedProfile;
      } else {
        // Create new profile
        const [newProfile] = await ctx.db
          .insert(businessProfiles)
          .values({
            userId: user[0].id,
            ...input,
          })
          .returning();

        return newProfile;
      }
    }),

  /**
   * Get user stats (for dashboard)
   */
  getStats: protectedProcedure.query(async () => {
    // This is a placeholder - in a real app, you'd aggregate from various tables
    return {
      totalCustomers: 0,
      totalJobs: 0,
      totalRevenue: 0,
      pendingJobs: 0,
      completedJobs: 0,
      monthlyGrowth: 0,
    };
  }),

  /**
   * Deactivate user account (sets role to inactive)
   */
  deactivateAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const [deactivatedUser] = await ctx.db
      .update(users)
      .set({
        role: 'inactive',
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, ctx.userId))
      .returning();

    return deactivatedUser;
  }),
});