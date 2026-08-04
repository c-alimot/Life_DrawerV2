import { Redirect, useLocalSearchParams } from "expo-router";

export default function InsightsRedirect() {
  const params = useLocalSearchParams();

  return <Redirect href={{ pathname: "/return", params }} />;
}
