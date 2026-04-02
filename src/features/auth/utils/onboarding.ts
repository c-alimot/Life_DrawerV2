import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const ONBOARDING_KEY = "life-drawer:onboarding-complete";
const webStorage = {
  async getItem(key: string) {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

const storage = Platform.OS === "web" ? webStorage : AsyncStorage;

export async function getOnboardingCompleted() {
  try {
    const value = await storage.getItem(ONBOARDING_KEY);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setOnboardingCompleted() {
  await storage.setItem(ONBOARDING_KEY, "true");
}

export async function clearOnboardingCompleted() {
  await storage.removeItem(ONBOARDING_KEY);
}
