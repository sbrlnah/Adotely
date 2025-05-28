import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase/config';
import { useTheme } from '../contexts/ThemeContext';

export default function TrocarSenha() {
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);

  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const enviarEmailRecuperacao = async () => {
    if (!email) {
      Alert.alert('Erro', 'Informe seu e-mail.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', 'Enviamos um link de recuperação para seu e-mail.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o e-mail de recuperação.');
    }
  };

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Redefinir Senha</Text>

      <TextInput
        placeholder="Digite seu e-mail"
        placeholderTextColor={tema.textoPlaceholder}
        style={estilos.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={estilos.botao} onPress={enviarEmailRecuperacao}>
        <Text style={estilos.textoBotao}>Enviar link</Text>
      </TouchableOpacity>
    </View>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: tema.fundo,
    },
    titulo: {
      fontSize: 26,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 20,
      color: '#5F6DF5',
      textAlign: 'center',
    },
    input: {
      backgroundColor: tema.inputFundo,
      padding: 12,
      borderRadius: 6,
      marginBottom: 20,
      color: tema.textoPrimario,
      borderColor: '#C7D7FF',
      borderWidth: 2,
    },
    botao: {
      backgroundColor: '#5F6DF5',
      padding: 14,
      borderRadius: 50,
      alignItems: 'center',
      marginVertical: 16,
    },
    textoBotao: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
}
