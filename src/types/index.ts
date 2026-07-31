export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type MoodValue =
  | "happy"
  | "calm"
  | "inspired"
  | "grateful"
  | "anxious"
  | "stressed"
  | "angry"
  | "sad"
  | "tired"
  | "bored"
  | "meh";

export interface MoodData {
  value: MoodValue;
  label: string;
  emoji: string;
}

export interface Profile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  returnPreferences: ReturnPreferences;
  createdAt: string;
  updatedAt: string;
}

export type ReflectionType = "update" | "response" | "continuation";

export type ReturnNotificationFrequency =
  | "never"
  | "occasionally"
  | "weekly"
  | "only_in_app";

export interface ReturnPreferences {
  returnFeaturesEnabled: boolean;
  showReturnContentOnHome: boolean;
  showOnThisDay: boolean;
  insightsReturnContentEnabled: boolean;
  notificationFrequency: ReturnNotificationFrequency;
}

export const DEFAULT_RETURN_PREFERENCES: ReturnPreferences = {
  returnFeaturesEnabled: true,
  showReturnContentOnHome: true,
  showOnThisDay: true,
  insightsReturnContentEnabled: true,
  notificationFrequency: "only_in_app",
};

export interface Drawer {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  resurfacingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntryLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Entry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: MoodValue;
  images: string[];
  audioUrl?: string;
  location?: EntryLocation;
  occurredAt?: string;
  parentEntryId?: string;
  reflectionType?: ReflectionType;
  lastViewedAt?: string;
  revisitCount: number;
  savedForLater: boolean;
  resurfacingEnabled: boolean;
  lastResurfacedAt?: string;
  resurfaceCount: number;
  returnDismissedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntryWithRelations extends Entry {
  drawers: Drawer[];
  tags: Tag[];
  author?: Profile;
}

export type HomeReturnCandidateReason =
  | "saved_for_later"
  | "around_this_time"
  | "continuing_reflection"
  | "not_viewed_recently"
  | "collection";

export interface HomeReturnCandidate {
  entry: EntryWithRelations;
  reason: HomeReturnCandidateReason;
  contextLabel: string;
  contextDescription: string;
}

export type DrawerReturnCandidateReason =
  | "saved_for_later"
  | "continuing_reflection"
  | "least_recently_viewed"
  | "collection";

export interface DrawerReturnCandidate {
  entry: EntryWithRelations;
  reason: DrawerReturnCandidateReason;
  contextLabel: string;
  contextDescription: string;
}

export interface DrawerReturnOverview {
  entryCount: number;
  firstEntryAt?: string;
  latestEntryAt?: string;
  savedForLaterCount: number;
  connectedReflectionCount: number;
  revisitedCount: number;
}

export type DrawerEntryFilter =
  | "all"
  | "saved_for_later"
  | "connected_reflections"
  | "revisited"
  | "not_revisited";

export type DrawerEntrySort =
  | "newest"
  | "oldest"
  | "least_recently_viewed"
  | "most_recently_revisited";

export interface DrawerEntriesRequest {
  filter: DrawerEntryFilter;
  sort: DrawerEntrySort;
  tagId?: string | null;
}

export interface DrawerCommonTag {
  id: string;
  name: string;
  color?: string;
  entryCount: number;
}

export interface InsightsCollectionOverview {
  entryCount: number;
  drawerCount: number;
  firstEntryAt?: string;
  latestEntryAt?: string;
  savedForLaterCount: number;
  connectedReflectionCount: number;
  tagCount: number;
}

export interface ContinuingReflectionChain {
  rootEntryId: string;
  originalEntryAt: string;
  latestReflectionAt: string;
  entryCount: number;
  title: string;
  preview: string;
}

export interface ContinuingReflectionSummary {
  chainCount: number;
  connectedEntryCount: number;
  chains: ContinuingReflectionChain[];
}

export interface DrawerInsightSummary {
  drawerId: string;
  drawerName: string;
  drawerColor?: string;
  drawerIcon?: string;
  entryCount: number;
  firstEntryAt?: string;
  latestEntryAt?: string;
  savedForLaterCount: number;
  connectedReflectionCount: number;
  commonTags: string[];
}

export type InsightsTimeRange = "all" | "six_months" | "year";

export interface InsightThemeDrawer {
  id: string;
  name: string;
}

export interface InsightThemePeriod {
  label: string;
  entryCount: number;
}

export interface InsightTheme {
  tagId: string;
  name: string;
  color?: string;
  entryCount: number;
  drawerCount: number;
  firstEntryAt: string;
  latestEntryAt: string;
  connectedReflectionCount: number;
  drawers: InsightThemeDrawer[];
  periods: InsightThemePeriod[];
}

export interface InsightReflectionComparison {
  rootEntryId: string;
  originalEntryAt: string;
  originalPreview: string;
  latestEntryId: string;
  latestReflectionAt: string;
  latestPreview: string;
  latestReflectionType?: ReflectionType;
  entryCount: number;
}

export interface RecentlyReturnedEntry {
  entryId: string;
  title: string;
  preview: string;
  createdAt: string;
  lastViewedAt: string;
  drawerName?: string;
  hasConnectedReflection: boolean;
}

export interface SavedForLaterInsightsSummary {
  entryCount: number;
}

export interface DrawerWithRelations extends Drawer {
  entries: Entry[];
  entryCount: number;
  owner?: Profile;
}

export interface TagWithMetadata extends Tag {
  entryCount: number;
}

export interface EntryDraft {
  id?: string;
  title: string;
  content: string;
  mood?: MoodValue;
  selectedDrawerIds: string[];
  selectedTagIds: string[];
  imageUris?: string[];
  audioUri?: string;
  location?: EntryLocation;
}

export interface CreateEntryRequest {
  title: string;
  content: string;
  mood?: MoodValue;
  drawerIds?: string[];
  tagIds?: string[];
  imageUris?: string[];
  audioUri?: string;
  location?: EntryLocation;
  occurredAt?: string;
  parentEntryId?: string | null;
  reflectionType?: ReflectionType | null;
  savedForLater?: boolean;
  resurfacingEnabled?: boolean;
}

export interface CreateLinkedReflectionRequest {
  parentEntryId: string;
  reflectionType: ReflectionType;
  entryData: CreateEntryRequest;
}

export interface EntryViewRecord {
  lastViewedAt: string;
  revisitCount: number;
}

export interface UpdateEntryRequest {
  title?: string;
  content?: string;
  mood?: MoodValue;
  imageUris?: string[];
  audioUrl?: string | null;
  location?: EntryLocation | null;
  drawerIds?: string[];
  tagIds?: string[];
  occurredAt?: string | null;
  parentEntryId?: string | null;
  reflectionType?: ReflectionType | null;
  savedForLater?: boolean;
  resurfacingEnabled?: boolean;
}

export interface SearchEntriesRequest {
  query?: string;
  moodValues?: MoodValue[];
  drawerIds?: string[];
  tagIds?: string[];
  startDate?: string;
  endDate?: string;
  savedForLaterOnly?: boolean;
  sortOrder?: "desc" | "asc";
  limit?: number;
  offset?: number;
}

export interface CreateDrawerRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  resurfacingEnabled?: boolean;
}

export interface UpdateDrawerRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  resurfacingEnabled?: boolean;
}

export type UpdateReturnPreferencesRequest = Partial<ReturnPreferences>;

export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface UpdateTagRequest {
  name?: string;
  color?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
