import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useTheme } from '../contexts/ThemeContext';

export default function PerfilAdotante() {
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);
  const route = useRoute();
  const navigation = useNavigation();

  const { userId } = route.params;
  const [adotante, setAdotante] = useState(null);

  useEffect(() => {
    const buscarAdotante = async () => {
      try {
        const snap = await getDoc(doc(db, 'usuarios', userId));
        if (snap.exists()) {
          setAdotante(snap.data());
        } else {
          Alert.alert('Erro', 'Usuário não encontrado.');
          navigation.goBack();
        }
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível carregar o perfil.');
        navigation.goBack();
      }
    };

    buscarAdotante();
  }, []);

  const aprovarMatch = async () => {
    try {
      await setDoc(doc(db, 'interacoes', userId, 'usuarios', auth.currentUser.uid), {
        status: 'match',
        abrigoId: auth.currentUser.uid,
        adotanteId: userId,
        timestamp: Date.now(),
      });

      await setDoc(doc(db, 'interacoes', auth.currentUser.uid, 'usuarios', userId), {
        status: 'match',
        abrigoId: auth.currentUser.uid,
        adotanteId: userId,
        timestamp: Date.now(),
      });

      Alert.alert('Match aprovado!', 'Abra o chat e converse com o Interessado!');
    } catch (err) {
      console.log(err);
      Alert.alert('Erro ao aprovar match');
    }
  };

  const rejeitarMatch = async () => {
    try {
      await deleteDoc(doc(db, 'interacoes', auth.currentUser.uid, 'usuarios', userId));
      await deleteDoc(doc(db, 'interacoes', userId, 'usuarios', auth.currentUser.uid));
      Alert.alert('Match rejeitado.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro ao rejeitar match');
    }
  };

  const iniciarChat = () => {
  if (!adotante) return;
  navigation.navigate('Conversas', {
    screen: 'Chat',
    params: {
      outroUsuario: {
        uid: userId,
        nome: adotante.nome || 'Adotante',
      },
    },
  });
};

  if (!adotante) {
    return (
      <View style={estilos.loading}>
        <Text style={estilos.texto}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      {adotante.foto ? (
        <Image source={{ uri: adotante.foto }} style={estilos.imagem} />
      ) : (
        <View style={estilos.fotoPlaceholder}>
          <Text style={{ color: '#999' }}>Sem foto</Text>
        </View>
      )}

      <Text style={estilos.nome}>{adotante.nome}</Text>
      <Text style={estilos.info}>{adotante.idade} • {adotante.cidade}</Text>

      <Text style={estilos.label}>Sobre</Text>
      <Text style={estilos.bio}>{adotante.biografia?.trim() || 'Sem biografia cadastrada.'}</Text>

      <View style={estilos.botoes}>
        <TouchableOpacity style={estilos.botaoAprovar} onPress={aprovarMatch}>
          <Text style={estilos.botaoTexto}>Aprovar Match</Text>
        </TouchableOpacity>

        <TouchableOpacity style={estilos.botaoChat} onPress={iniciarChat}>
          <Text style={estilos.textoBotaoSecundario}>Conversar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={estilos.botaoRejeitar} onPress={rejeitarMatch}>
          <Text style={estilos.textoApagar}>Rejeitar Match</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: tema.background,
      marginTop: 20,
      flexGrow: 1,
    },
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: tema.background,
    },
    imagem: {
      width: '100%',
      height: 380,
      borderRadius: 30,
      backgroundColor: '#E0E7FF',
      marginBottom: 12,
      borderColor: tema.border,
      borderWidth: 2,
    },
    fotoPlaceholder: {
      width: '100%',
      height: 380,
      borderRadius: 30,
      backgroundColor: '#E0E7FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      borderColor: tema.border,
      borderWidth: 2,
    },
    nome: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#5F6DF5',
    },
    info: {
      fontSize: 16,
      color: tema.text,
      marginBottom: 12,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: '#5F6DF5',
      marginTop: 10,
      marginBottom: 4,
    },
    bio: {
      fontSize: 14,
      color: tema.text,
      marginBottom: 16,
    },
    botoes: {
      gap: 12,
    },
    botaoAprovar: {
      backgroundColor: '#5F6DF5',
      padding: 14,
      borderRadius: 50,
      alignItems: 'center',
      marginBottom: 16,
    },
    botaoRejeitar: {
      alignItems: 'center',
      marginBottom: 16,
    },
    botaoChat: {
      backgroundColor: '#E0E7FF',
      padding: 14,
      borderRadius: 50,
      alignItems: 'center',
      marginBottom: 16,
    },
    botaoTexto: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    textoApagar: {
      color: '#9DA4B0',
      textAlign: 'center',
      fontSize: 14,
      marginBottom: 40,
    },
    textoBotaoSecundario: {
      color: tema.textoPrimario,
      fontWeight: 'bold',
      fontSize: 16,
    },
    texto: {
      color: tema.texto,
    },
  });
}
