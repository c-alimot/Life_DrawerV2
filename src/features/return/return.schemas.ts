import { z } from "zod";

export const reflectionTypes = ["update", "response", "continuation"] as const;

export const reflectionTypeSchema = z.enum(reflectionTypes);

export const entryReturnFieldsSchema = z.object({
  parentEntryId: z.string().uuid().nullable().optional(),
  reflectionType: reflectionTypeSchema.nullable().optional(),
  savedForLater: z.boolean().optional(),
  resurfacingEnabled: z.boolean().optional(),
});

export const returnNotificationFrequencies = [
  "never",
  "occasionally",
  "weekly",
  "only_in_app",
] as const;

export const returnPreferencesSchema = z.object({
  returnFeaturesEnabled: z.boolean(),
  showReturnContentOnHome: z.boolean(),
  showOnThisDay: z.boolean(),
  insightsReturnContentEnabled: z.boolean(),
  notificationFrequency: z.enum(returnNotificationFrequencies),
});

export const updateReturnPreferencesSchema = returnPreferencesSchema.partial();
