import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, Platform, useWindowDimensions } from "react-native";
import api from "./src/services/api";
import AppBackground from "../components/AppBackground";
import styles from "../styles/loginStyle";
import { useState } from "react";

const webHoverProps = (onEnter, onLeave) =>
  Platform.OS === "web"
    ? {
        onMouseEnter: onEnter,
        onMouseLeave: onLeave,
      }
    : {};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hover, setHover] = useState(false);


  const router = useRouter();

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isWeb = Platform.OS === 'web'
  async function handleLogin() {
    try {
      await api.post("/login", {
        email,
        password,
      });

      // se backend retornar sucesso
      router.replace("/home");

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Erro ao conectar com o servidor."
      );
    }
  }

  return (
    <AppBackground style={styles.container}>
      <View
        style={{
          width: "100%",
          maxWidth: isDesktop ? 400 : "100%",
          alignSelf: "center",
          padding: 20,
          backgroundColor: "rgba(255, 255, 255, 0.0)",
          borderRadius: isDesktop ? 10 : 0,
          borderWidth: isDesktop ? 1 : 0,
          borderColor: "rgba(255, 255, 255, 0.0)"
        }}
      >
        <Text
          style={[
            styles.title,
            { fontSize: isDesktop ? 28 : 22 }
          ]}
        >
          SP em Alerta ⚠️
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#000000"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#000000"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[
            styles.button,
            { padding: isDesktop ? 15 : 12 },
            hover && isWeb ? { opacity: 0.8 } : null
          ]}
          {...webHoverProps(() => setHover(true), () => setHover(false))}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/forgot_password")}>
          <Text style={styles.link}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.navigate("/register")}>
          <Text style={styles.link}>Criar conta</Text>
        </TouchableOpacity>
      </View>
    </AppBackground>
  );
}


