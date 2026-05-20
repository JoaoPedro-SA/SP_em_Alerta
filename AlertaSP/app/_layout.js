import { Slot } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

// Manter a splash screen visível enquanto carregamos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
     useEffect(() => {
          // Esconder a splash screen após o app estar pronto
          SplashScreen.hideAsync();
     }, []);

     return <Slot />;
}
