import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/registerStyle";
import api from "./src/services/api";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(false);

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const isWeb = Platform.OS === "web";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function showAlert(title, message, buttons) {
    if (isWeb) {
      window.alert(`${title}\n\n${message}`);
      if (buttons && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  }

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      showAlert("Erro", "Preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Erro", "As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/register", {
        name,
        email,
        password,
      });

      if (response.status === 201) {
        showAlert(
          "Sucesso",
          "Conta criada! Verifique seu e-mail.",
          [
            {
              text: "OK",
              onPress: () => {
                router.push({
                  pathname: "/otp_verify",
                  params: { email: email }
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      if (!error.response) {
        showAlert(
          "Erro de Conexão",
          "Não conseguimos conectar ao servidor."
        );
      } else if (error.response?.status === 400) {
        showAlert("Erro", error.response?.data?.message || "Erro no cadastro.");
      } else {
        showAlert(
          "Erro",
          error.response?.data?.message || "Erro inesperado."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={["#0d0000", "#2b0000", "#5a3a00"]}
      style={styles.container}
    >
      <View
        style={{
          width: "100%",
          maxWidth: isDesktop ? 420 : "100%",
          alignSelf: "center",
          padding: 20,
          backgroundColor: "rgba(255,255,255,0.00)",
          borderRadius: isDesktop ? 10 : 0,
          borderWidth: isDesktop ? 1 : 0,
          borderColor: "rgba(255,255,255,0.0)",
          ...(isWeb && {
            backdropFilter: "blur(10px)",
          }),
        }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/login")}
        >
          <Ionicons name="arrow-back-circle" size={50} color="#fff" />
        </TouchableOpacity>

        <Text style={[
          styles.title,
          { fontSize: isDesktop ? 26 : 22 }
        ]}>
          Criar Conta
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#000000"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#000000"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#000000"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          placeholderTextColor="#000000"
          value={confirmPassword}
          secureTextEntry
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={[
            styles.button,
            { padding: isDesktop ? 15 : 12 },
            hover && isWeb ? { opacity: 0.8 } : null,
            loading && styles.buttonDisabled
          ]}
          onMouseEnter={isWeb ? () => setHover(true) : null}
          onMouseLeave={isWeb ? () => setHover(false) : null}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Cadastrando..." : "Bora Alertar!"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonLogin}
          onPress={() => router.push("/login")}
          disabled={loading}
        >
          <Text style={styles.btnText}>Já Alerta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}