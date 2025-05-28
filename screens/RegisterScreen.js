import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase/config';
import { useTheme } from '../contexts/ThemeContext';
import { cores } from '../constants/colors';

export default function RegisterScreen() {
  const { tema } = useTheme();
  const temaCores = cores[tema] || cores['claro'];
  const estilos = useMemo(() => criarEstilos(temaCores), [temaCores]);

  const navigation = useNavigation();
  const [carregando, setCarregando] = useState(false);

  const [dados, setDados] = useState({
    nome: '',
    email: '',
    senha: '',
    idade: '',
    cidade: '',
    tipo: 'adotante',
  });

  const alternarTipo = () => {
    setDados({
      ...dados,
      tipo: dados.tipo === 'adotante' ? 'abrigo' : 'adotante',
    });
  };

  const cadastrar = async () => {
    const { nome, email, senha, idade, cidade, tipo } = dados;

    if (!nome || !email || !senha || !idade || !cidade) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    try {
      setCarregando(true);
      const userCred = await createUserWithEmailAndPassword(auth, email, senha);
      await setDoc(doc(db, 'usuarios', userCred.user.uid), {
        nome,
        email,
        idade,
        cidade,
        tipo,
      });

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      navigation.replace('MainTabs');
    } catch (error) {
      console.log('Erro ao cadastrar:', error);
      Alert.alert('Erro', error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={estilos.container} keyboardShouldPersistTaps="handled">
          <Text style={estilos.titulo}>Criar conta</Text>

          <TextInput
            placeholder="Nome"
            placeholderTextColor={temaCores.textoPlaceholder}
            style={estilos.input}
            value={dados.nome}
            onChangeText={(t) => setDados({ ...dados, nome: t })}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor={temaCores.textoPlaceholder}
            style={estilos.input}
            value={dados.email}
            onChangeText={(t) => setDados({ ...dados, email: t })}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Senha"
            placeholderTextColor={temaCores.textoPlaceholder}
            secureTextEntry
            style={estilos.input}
            value={dados.senha}
            onChangeText={(t) => setDados({ ...dados, senha: t })}
          />
          <TextInput
            placeholder="Idade"
            placeholderTextColor={temaCores.textoPlaceholder}
            style={estilos.input}
            value={dados.idade}
            onChangeText={(t) => setDados({ ...dados, idade: t })}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Cidade"
            placeholderTextColor={temaCores.textoPlaceholder}
            style={estilos.input}
            value={dados.cidade}
            onChangeText={(t) => setDados({ ...dados, cidade: t })}
          />

          <TouchableOpacity style={estilos.botaoTipo} onPress={alternarTipo}>
            <Text style={estilos.textoTipo}>
              Tipo de conta: {dados.tipo === 'adotante' ? 'Sou Adotante' : 'Sou Abrigo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={estilos.botao} onPress={cadastrar} disabled={carregando}>
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={estilos.textoBotao}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={estilos.link}>Já tem conta? Faça login</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const criarEstilos = (cores) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 24,
      justifyContent: 'center',
      backgroundColor: cores.fundo,
    },
    titulo: {
      fontSize: 26,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#5F6DF5',
      textAlign: 'center',
    },
    input: {
      backgroundColor: cores.inputFundo,
      padding: 14,
      borderRadius: 12,
      marginBottom: 12,
      color: cores.texto,
      borderWidth: 2,
      borderColor: '#C7D7FF',
    },
    botao: {
      backgroundColor: '#5F6DF5',
      padding: 14,
      borderRadius: 50,
      alignItems: 'center',
      marginTop: 10,
    },
    textoBotao: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    botaoTipo: {
      backgroundColor: '#E0E7FF',
      padding: 12,
      borderRadius: 20,
      marginBottom: 16,
      alignItems: 'center',
    },
    textoTipo: {
      color: '#5F6DF5',
      fontWeight: 'bold',
    },
    link: {
      color: '#5F6DF5',
      textAlign: 'center',
      fontSize: 15,
      marginTop: 10,
    },
  });
