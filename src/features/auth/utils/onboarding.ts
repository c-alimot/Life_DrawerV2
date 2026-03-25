import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "life-drawer:onboarding-complete";

export async function getOnboardingCompleted() {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === "true";
}

export async function setOnboardingCompleted() {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
}

export async function clearOnboardingCompleted() {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
}
