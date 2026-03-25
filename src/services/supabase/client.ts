import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import type { Database } from "./types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env.local file.'
  );
}

const webStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return Promise.resolve(null);
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return Promise.resolve();
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return Promise.resolve();
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const storage = Platform.OS === "web" ? webStorage : AsyncStorage;

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage,
      persistSession: true,
      autoRefreshToken: Platform.OS !== "web",
      detectSessionInUrl: Platform.OS === "web",
    },
  }
);
