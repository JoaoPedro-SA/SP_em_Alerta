import { LinearGradient } from "expo-linear-gradient";

export default function AppBackground({ children, style }) {
  return (
    <LinearGradient colors={["#0d0000", "#2b0000", "#5a3a00"]} style={style}>
      {children}
    </LinearGradient>
  );
}
