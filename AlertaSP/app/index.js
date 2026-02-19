import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient"
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
      router.replace("/login")
    }, 3200)

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient 
    colors={["#0d0000", "#2b0000", "#5a3a00"]} 
    style={styles.container}>


      <Animated.Image
        source={require("../assets/images/logo(1).png")}
        style={[styles.logo, {transform: [{ scale}], opacity}, ]}
        resizeMode="contain"
      />

    </LinearGradient>
  );
}