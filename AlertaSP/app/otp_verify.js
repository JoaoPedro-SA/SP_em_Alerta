import React, { useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, Platform, StyleSheet, ActivityIndicator, useWindowDimensions, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AppBackground from '../components/AppBackground';
import api from './src/services/api';

const webHoverProps = (onEnter, onLeave) =>
    Platform.OS === "web"
        ? {
            onMouseEnter: onEnter,
            onMouseLeave: onLeave,
        }
        : {};

export default function OtpVerify() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { email } = params;
    const [hover, setHover] = useState(false);

    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const isWeb = Platform.OS === "web";

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600);
    const [canResend, setCanResend] = useState(false);

    function showAlert(title, message, buttons) {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
            if (buttons && buttons[0]?.onPress) {
                buttons[0].onPress();
            }
        } else {
            Alert.alert(title, message, buttons);
        }
    }

    useEffect(() => {
        console.log('OTP verify screen loaded, email:', email);

        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft, email]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleVerify = async () => {
        if (!email) {
            showAlert("Erro", "E-mail não foi recebido corretamente. Volte ao login e tente novamente.");
            return;
        }

        if (otp.length !== 6) {
            showAlert("Erro", "O código deve ter 6 dígitos.");
            return;
        }

        setLoading(true);

        try {
            console.log('Enviando OTP para verificação:', { email, otp });
            const response = await api.post('/verify-otp', {
                email: email,
                otp: otp
            });

            console.log('Resposta verify-otp:', response.status, response.data);

            if (response.status === 200) {
                setLoading(false);
                showAlert(
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
            console.error('Erro na verificação:', error);
            console.error('Error response:', error.response);
            console.error('Error response data:', error.response?.data);

            let errorMessage = "Erro ao verificar código.";

            if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;
                if (error.response.status === 400 && errorMessage.includes("expirado")) {
                    setCanResend(true);
                }
            }

            showAlert("Erro", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend) return;

        if (!email) {
            showAlert("Erro", "E-mail não foi recebido corretamente. Volte ao login e tente novamente.");
            return;
        }

        setLoading(true);

        try {
            console.log('Reenviando OTP para:', email);
            const response = await api.post('/resend-otp', {
                email: email
            });

            console.log('Resposta resend-otp:', response.status, response.data);

            if (response.status === 200) {
                showAlert("Sucesso", "Novo código enviado para seu email!");
                setTimeLeft(600);
                setCanResend(false);
                setOtp('');
            }
        } catch (error) {
            console.error('Erro ao reenviar código:', error.response?.data || error);
            showAlert("Erro", error.response?.data?.message || "Erro ao reenviar código.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppBackground style={styles.container}>
            <View
                style={{
                    width: "100%",
                    maxWidth: isDesktop ? 420 : "100%",
                    alignSelf: "center",
                    alignContent: "center",
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
                <Text style={[
                    styles.title,
                    { fontSize: isDesktop ? 26 : 22 }
                ]}>
                    Verificação de E-mail
                </Text>

                <Text style={styles.subtitle}>Código enviado para:</Text>
                <Text style={styles.emailText}>{email}</Text>

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
                />

                <TouchableOpacity
                    style={[
                        styles.button,
                        hover && isWeb ? { opacity: 0.8 } : null,
                        loading && styles.buttonDisabled
                    ]}
                    {...webHoverProps(() => setHover(true), () => setHover(false))}
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
                >
                    <Text style={styles.linkText}>Voltar para Login</Text>
                </TouchableOpacity>
            </View>
        </AppBackground>
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
