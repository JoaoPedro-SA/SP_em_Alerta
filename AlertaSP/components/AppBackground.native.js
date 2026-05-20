import { View } from "react-native";

export default function AppBackground({ children, style }) {
  return <View style={[{ backgroundColor: "#0d0000" }, style]}>{children}</View>;
}
