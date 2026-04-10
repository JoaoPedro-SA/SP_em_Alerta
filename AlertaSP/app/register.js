import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/registerStyle";
import api from "./src/services/api";

export default function Register() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    function showAlert(title, message, buttons) {
        if (Platform.OS === "web") {
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
            console.log("Enviando dados para registro:", { name, email, password: "***" });

            const response = await api.post("/register", {
                name,
                email,
                password,
            });

            console.log("Resposta do servidor:", response.status, response.data);

            if (response.status === 201) {
                setLoading(false);
                showAlert(
                    "Sucesso",
                    "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                console.log("Redirecionando para OTP com email:", email);
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
            console.error("❌ ERRO NO CADASTRO:");
            console.error("Error object:", error);
            console.error("Error message:", error.message);
            console.error("Error response:", error.response);
            console.error("Error response status:", error.response?.status);
            console.error("Error response data:", error.response?.data);

            // Verifica se é erro de conexão
            if (!error.response) {
                showAlert(
                    "Erro de Conexão",
                    "Não conseguimos conectar ao servidor. Verifique sua internet e tente novamente."
                );
            } else if (error.response?.status === 400) {
                if (error.response?.data?.message === "Email já cadastrado") {
                    showAlert(
                        "Email já cadastrado",
                        "Este email já possui cadastro. Deseja fazer login?",
                        [
                            {
                                text: "Cancelar",
                                style: "cancel"
                            },
                            {
                                text: "Ir para Login",
                                onPress: () => router.replace("/login")
                            }
                        ]
                    );
                } else {
                    showAlert("Erro", error.response?.data?.message || "Erro no cadastro.");
                }
            } else if (error.response?.status === 500) {
                showAlert(
                    "Erro no servidor",
                    error.response?.data?.message || "Erro ao processar o cadastro no servidor."
                );
            } else {
                showAlert(
                    "Erro",
                    error.response?.data?.message || error.message || "Erro desconhecido ao conectar com o servidor."
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
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back-circle" size={28} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.title}>Criar Conta</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={name}
                placeholderTextColor="#000000"
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                placeholderTextColor="#000000"
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={password}
                placeholderTextColor="#000000"
                secureTextEntry
                onChangeText={setPassword}
            />

            <TextInput
                style={styles.input}
                placeholder="Confirmar Senha"
                value={confirmPassword}
                placeholderTextColor="#000000"
                secureTextEntry
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Cadastrando..." : "Bora Alertar!"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.buttonLogin}
                onPress={() => router.replace("/login")}
                disabled={loading}
            >
                <Text style={styles.btnText}>Já Alerta? Entrar</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
};