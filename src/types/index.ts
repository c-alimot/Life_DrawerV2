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
