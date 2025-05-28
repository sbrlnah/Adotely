import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { cores } from '../constants/colors';

export default function LoginScreen() {
  const { tema } = useTheme();
  const temaCores = cores[tema] || cores['claro'];
  const estilos = useMemo(() => criarEstilos(temaCores), [temaCores]);
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setCarregando(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, senha);
      console.log('Login OK:', cred.user);
    } catch (error) {
      console.log('Erro ao logar:', error);
      Alert.alert('Erro ao entrar', error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={estilos.container} keyboardShouldPersistTaps="handled">
          <Image
            source={require('../assets/logo.png')}
            style={estilos.logo}
            resizeMode="contain"
          />

          <Text style={estilos.titulo}>Entrar</Text>

          <TextInput
            style={estilos.input}
            placeholder="Email"
            placeholderTextColor={tema.textoPlaceholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <View style={estilos.inputComIcone}>
            <TextInput
              style={estilos.inputSenha}
              placeholder="Senha"
              placeholderTextColor={tema.textoPlaceholder}
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
              <MaterialIcons
                name={mostrarSenha ? 'visibility-off' : 'visibility'}
                size={24}
                color={tema.texto}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('TrocarSenha')}>
            <Text style={estilos.link}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.botao}
            onPress={handleLogin}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color={tema.botaoTexto || '#fff'} />
            ) : (
              <Text style={estilos.textoBotao}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={estilos.link}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: tema.background,
      padding: 24,
      justifyContent: 'center',
    },
    logo: {
      width: 360,
      height: 360,
      alignSelf: 'center',
      marginBottom: 16,
    },
    titulo: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#5F6DF5',
      marginBottom: 24,
      textAlign: 'center',
    },
    input: {
      backgroundColor: tema.inputFundo || '#F4F6FF',
      padding: 14,
      borderRadius: 12,
      marginBottom: 12,
      color: tema.texto,
      borderWidth: 2,
      borderColor: '#C7D7FF',
    },
    inputComIcone: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: tema.inputFundo || '#F4F6FF',
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#C7D7FF',
      marginBottom: 12,
    },
    inputSenha: {
      flex: 1,
      color: tema.texto,
      paddingVertical: 14,
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
    link: {
      color: '#5F6DF5',
      textAlign: 'center',
      fontSize: 15,
    },
  });
}
