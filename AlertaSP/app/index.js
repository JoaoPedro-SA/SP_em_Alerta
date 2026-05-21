import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useRouter } from "expo-router";
import AppBackground from "../components/AppBackground";
import styles from "../styles/splashStyle";

export default function Splash() {
  const router = useRouter();

  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/login");
    }, 3200);

    return () => clearTimeout(timer);
  }, [opacity, router, scale]);

  return (
    <AppBackground style={styles.container}>
      <Animated.Image
        source={require("../assets/images/logo(1).png")}
        style={[styles.logo, { transform: [{ scale }], opacity }]}
        resizeMode="contain"
      />
    </AppBackground>
  );
}
