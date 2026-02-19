import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/loginStyle";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  function handleLogin() {
    if (email === 'admin@sp.com' && password === 'admin123'){
      router.navigate("/home");
    } else {
      alert("Credenciais inválidas. Tente novamente.");
    }
  }

  return (
    <LinearGradient 
      colors={["#0d0000", "#2b0000", "#5a3a00"]}    
    style={styles.container}>
      <Text style={styles.title}>SP em Alerta ⚠️</Text>

      <TextInput style={styles.input} 
      placeholder="E-mail" 
      placeholderTextColor="#000000" 
      value={email} 
      onChangeText={setEmail} 
      />

      <TextInput style={styles.input} 
      placeholder="Senha" 
      placeholderTextColor="#000000" 
      value={password}
      onChangeText={setPassword}
      secureTextEntry 
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.link}>Esqueci minha senha</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.navigate("/register")}>
        <Text style={styles.link}>Criar conta</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}


