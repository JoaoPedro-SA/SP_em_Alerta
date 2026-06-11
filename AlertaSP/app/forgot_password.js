import { useState } from "react";
import { ActivityIndicator, Alert, Platform, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import AppBackground from "../components/AppBackground";
import api from "../src/services/api";
import styles from "../styles/forgotPasswordStyle";

function showAlert(title, message) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

function getApiErrorMessage(error, fallback) {
  const data = error.response?.data;
  const details = data?.error || data?.details;

  if (data?.message && details) {
    return `${data.message}\n\nDetalhes: ${details}`;
  }

  return data?.message || error.message || fallback;
}

export default function ForgotPassword() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendCode() {
    if (!email) {
      showAlert("Erro", "Informe seu e-mail.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/forgot-password", { email });
      const successMessage = response.data?.message || "Codigo enviado para seu e-mail.";

      showAlert("Sucesso", successMessage);
      setStep("reset");
    } catch (error) {
      showAlert("Erro", getApiErrorMessage(error, "Erro ao enviar codigo."));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!otp || !newPassword || !confirmPassword) {
      showAlert("Erro", "Preencha codigo, nova senha e confirmacao.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Erro", "As senhas nao coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/reset-password", {
        email,
        otp,
        new_password: newPassword,
      });

      showAlert("Sucesso", response.data?.message || "Senha redefinida com sucesso.");
      router.replace("/login");
    } catch (error) {
      showAlert("Erro", getApiErrorMessage(error, "Erro ao redefinir senha."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppBackground style={styles.container}>
      <View style={[styles.box, { maxWidth: isDesktop ? 420 : "100%" }]}>
        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>
          {step === "email"
            ? "Informe seu e-mail para receber um codigo de redefinicao."
            : "Digite o codigo recebido e escolha uma nova senha."}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#000"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading && step === "email"}
        />

        {step === "reset" && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Codigo de 6 digitos"
              placeholderTextColor="#000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
              maxLength={6}
            />
            <TextInput
              style={styles.input}
              placeholder="Nova senha"
              placeholderTextColor="#000"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar nova senha"
              placeholderTextColor="#000"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={step === "email" ? handleSendCode : handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>{step === "email" ? "Enviar codigo" : "Redefinir senha"}</Text>
          )}
        </TouchableOpacity>

        {step === "reset" && (
          <TouchableOpacity onPress={handleSendCode} disabled={loading}>
            <Text style={styles.link}>Reenviar codigo</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.replace("/login")} disabled={loading}>
          <Text style={styles.link}>Voltar para login</Text>
        </TouchableOpacity>
      </View>
    </AppBackground>
  );
}
