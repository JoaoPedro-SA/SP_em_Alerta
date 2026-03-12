import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from './src/services/api';

export default function OtpVerify() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { email } = params;
    
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); 
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleVerify = async () => {
        if (otp.length !== 6) {
            Alert.alert("Erro", "O código deve ter 6 dígitos.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/verify-otp', {
                email: email,
                otp: otp
            });

            if (response.status === 200) {
                Alert.alert(
                    "Sucesso", 
                    "Email verificado com sucesso!",
                    [
                        {
                            text: "OK",
                            onPress: () => router.replace("/login")
                        }
                    ]
                );
            }
        } catch (error) {
            console.log("Erro na verificação:", error.response?.data);
            
            let errorMessage = "Erro ao verificar código.";
            
            if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;
                
               
                if (error.response.status === 400 && errorMessage.includes("expirado")) {
                    setCanResend(true);
                }
            }
            
            Alert.alert("Erro", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend) return;
        
        setLoading(true);
        
        try {
            const response = await api.post('/resend-otp', {
                email: email
            });

            if (response.status === 200) {
                Alert.alert("Sucesso", "Novo código enviado para seu email!");
                setTimeLeft(600); 
                setCanResend(false);
                setOtp(''); 
            }
        } catch (error) {
            Alert.alert("Erro", error.response?.data?.message || "Erro ao reenviar código.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient 
            colors={["#0d0000", "#2b0000", "#5a3a00"]}
            style={styles.container}
        >
            <Text style={styles.title}>Verificação de E-mail</Text>
            <Text style={styles.subtitle}>Digite o código enviado para:</Text>
            <Text style={styles.emailText}>{email || 'seu@email.com'}</Text>
            
            <Text style={styles.timerText}>
                Tempo restante: {formatTime(timeLeft)}
            </Text>

            <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                editable={!loading}
            />

            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleVerify}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.buttonText}>Confirmar Código</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={handleResendCode}
                disabled={!canResend || loading}
            >
                <Text style={[
                    styles.resendText,
                    (!canResend || loading) && styles.resendDisabled
                ]}>
                    Reenviar código
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => router.replace("/login")}
                disabled={loading}
            >
                <Text style={styles.linkText}>Voltar para Login</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 5,
    },
    emailText: {
        fontSize: 16,
        color: '#ffd700',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    timerText: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 24,
        textAlign: 'center',
        letterSpacing: 5,
        marginBottom: 20,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#ffd700',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendText: {
        color: '#ffd700',
        fontSize: 16,
        marginBottom: 15,
        textDecorationLine: 'underline',
    },
    resendDisabled: {
        opacity: 0.3,
        textDecorationLine: 'none',
    },
    linkText: {
        color: '#fff',
        fontSize: 16,
    },
});