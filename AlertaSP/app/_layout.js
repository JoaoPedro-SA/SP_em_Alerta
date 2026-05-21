import { Slot } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { wakeUpApi } from "../src/services/api";

// Manter a splash screen visível enquanto carregamos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
     useEffect(() => {
          // Esconder a splash screen após o app estar pronto
          wakeUpApi();
          SplashScreen.hideAsync();
     }, []);

     return <Slot />;
}
