import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
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

    async function handleRegister() {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Erro", "As senhas não coincidem.");
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
                Alert.alert(
                    "Sucesso",
                    "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
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
            console.log("Erro detalhado:", error.response?.data);


            if (error.response?.status === 400) {
                if (error.response?.data?.message === "Email já cadastrado") {
                    Alert.alert(
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
                    Alert.alert("Erro", error.response?.data?.message || "Erro no cadastro.");
                }
            } else {
                Alert.alert(
                    "Erro",
                    error.response?.data?.message || "Erro ao conectar com o servidor."
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