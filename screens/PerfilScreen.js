import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

export default function PerfilScreen() {
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);

  const [dados, setDados] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const buscarUsuario = async () => {
      try {
        const ref = doc(db, 'usuarios', auth.currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setDados(snap.data());
      } catch (e) {
        console.error('Erro ao buscar dados do perfil:', e);
      }
    };

    buscarUsuario();
  }, []);

  if (!dados) {
    return (
      <View style={estilos.container}>
        <ActivityIndicator size="large" color={tema.botao} />
      </View>
    );
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.nome}>{dados.nome || 'Usuário sem nome'}</Text>

      {dados.foto ? (
        <Image source={{ uri: dados.foto }} style={estilos.foto} />
      ) : (
        <View style={estilos.fotoPlaceholder}>
          <Text style={{ color: tema.background }}>Sem foto</Text>
        </View>
      )}

      <View style={estilos.cardInfo}>
        <Text style={estilos.item}>
          <Text style={estilos.itemTitulo}>Email: </Text>
          {auth.currentUser.email}
        </Text>
        <Text style={estilos.item}>
          <Text style={estilos.itemTitulo}>Idade: </Text>
          {dados.idade || 'Não informada'}
        </Text>
        <Text style={estilos.item}>
          <Text style={estilos.itemTitulo}>Cidade: </Text>
          {dados.cidade || 'Não informada'}
        </Text>
        <Text style={estilos.item}>
          <Text style={estilos.itemTitulo}>Biografia: </Text>
          {dados.biografia?.trim() || 'Sem biografia cadastrada'}
        </Text>
      </View>

      <TouchableOpacity
        style={estilos.botao}
        onPress={() => navigation.navigate('EditarPerfil')}
      >
        <Text style={estilos.botaoTexto}>Editar Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      padding: 24,
      backgroundColor: tema.background,
    },
    foto: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      borderColor: tema.border,
      borderWidth: 2,
      borderRadius: 20,
    },
    fotoPlaceholder: {
      width: 340,
      height: 380,
      borderRadius: 30,
      backgroundColor: tema.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      borderColor: tema.border,
      borderWidth: 2,
      borderRadius: 20,
    },
    nome: {
      fontSize: 26,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 20,
      color: '#5F6DF5',
      textAlign: 'center',
    },
    cardInfo: {
      width: '100%',
      backgroundColor: tema.card,
      borderColor: tema.border,
      borderWidth: 2,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    item: {
      fontSize: 16,
      color: tema.text,
      marginBottom: 8,
    },
    itemTitulo: {
      color: '#5F6DF5',
      fontWeight: 'bold',
    },
    botao: {
      backgroundColor: '#5F6DF5',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 50,
    },
    botaoTexto: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
}
