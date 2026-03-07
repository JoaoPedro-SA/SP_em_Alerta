import React, { useState } from 'react'
import {View, Text, TextInput, TouchableOpacity, Alert} from 'react-native';

export default function OtpVerify({navigation}){
    const { email } = route.params || { email: 'exemplo@email.com' }; 
  const [otp, setOtp] = useState('');

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert("Erro", "O código deve ter 6 dígitos.");
      return;
    }

    try {
      const response = await fetch('http://SUA_IP_AQUI:5000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otp: otp }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sucesso", data.message);
        navigation.navigate('Login'); // Redireciona para o Login
      } else {
        Alert.alert("Erro", data.message);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificação de E-mail</Text>
      <Text style={styles.subtitle}>Digitie o código enviado para {email}</Text>

      <TextInput
        style={styles.input}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Confirmar Código</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

