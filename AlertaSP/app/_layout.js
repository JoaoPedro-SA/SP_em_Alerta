import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

// Manter a splash screen visível enquanto carregamos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
     useEffect(() => {
          // Esconder a splash screen após o app estar pronto
          SplashScreen.hideAsync();
     }, []);

     return (
          <Stack
               screenOptions={{
                    headerShown: false,
                    animationEnabled: true,
               }}
          >
               {/* Telas principais */}
               <Stack.Screen name="index" options={{ title: "Splash" }} />
               <Stack.Screen name="login" options={{ title: "Login" }} />
               <Stack.Screen name="register" options={{ title: "Registrar" }} />
               <Stack.Screen name="otp_verify" options={{ title: "Verificar OTP" }} />
               <Stack.Screen name="home" options={{ title: "Home" }} />
               <Stack.Screen name="map" options={{ title: "Mapa" }} />
          </Stack>
     );
}
