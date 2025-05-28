import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { auth, db, rtdb } from '../firebase/config';
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { ref as rtdbRef, get } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

export default function ConversationsScreen() {
  const navigation = useNavigation();
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);

  const [usuarios, setUsuarios] = useState([]);
  const [mensagens, setMensagens] = useState({});

  useEffect(() => {
    const carregarConversas = async () => {
      const uid = auth.currentUser.uid;
      const docUser = await getDoc(doc(db, 'usuarios', uid));

      if (!docUser.exists()) return;
      const tipo = docUser.data().tipo;

      const lista = [];

      if (tipo === 'abrigo') {
        const interacoesSnap = await getDocs(collection(db, 'interacoes', uid, 'usuarios'));
        for (const interacaoDoc of interacoesSnap.docs) {
          const { status, adotanteId } = interacaoDoc.data();
          if (status === 'match') {
            const userSnap = await getDoc(doc(db, 'usuarios', adotanteId));
            if (userSnap.exists()) {
              lista.push({ uid: adotanteId, ...userSnap.data() });
            }
          }
        }
      } else {
        const interacoesSnap = await getDocs(collection(db, 'interacoes', uid, 'pets'));
        for (const interacaoDoc of interacoesSnap.docs) {
          const { abrigoId } = interacaoDoc.data();
          if (abrigoId) {
            const abrigoSnap = await getDoc(doc(db, 'usuarios', abrigoId));
            if (abrigoSnap.exists()) {
              lista.push({ uid: abrigoId, ...abrigoSnap.data() });
            }
          }
        }
      }

      const unicos = Array.from(
        new Map(lista.map((u) => [u.uid, u])).values()
      );

      setUsuarios(unicos);
    };

    carregarConversas();
  }, []);

  useEffect(() => {
    const buscarUltimasMensagens = async () => {
      const novosDados = {};

      for (const usuario of usuarios) {
        const chatId = [auth.currentUser.uid, usuario.uid].sort().join('-');
        const mensagensRef = rtdbRef(rtdb, `chats/${chatId}`);

        try {
          const snap = await get(mensagensRef);
          if (snap.exists()) {
            const mensagensArray = Object.values(snap.val());
            const ultima = mensagensArray.sort((a, b) => b.timestamp - a.timestamp)[0];
            novosDados[usuario.uid] = ultima?.texto
              ? ultima.texto
              : ultima?.imagem
              ? '[imagem]'
              : '';
          } else {
            novosDados[usuario.uid] = 'Nenhuma mensagem ainda.';
          }
        } catch (e) {
          novosDados[usuario.uid] = 'Erro ao carregar.';
        }
      }

      setMensagens(novosDados);
    };

    if (usuarios.length > 0) {
      buscarUltimasMensagens();
    }
  }, [usuarios]);

  const abrirChat = (usuario) => {
    console.log('Abrindo chat com:', usuario.nome || usuario.email);
    navigation.navigate('Chat', { outroUsuario: usuario });
  };

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Conversas</Text>
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => abrirChat(item)} style={estilos.card}>
            <Text style={estilos.nome}>{item.nome || 'Usuário sem nome'}</Text>
            <Text style={estilos.ultimaMensagem}>
              {mensagens[item.uid] || 'Carregando...'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={estilos.mensagem}>Nenhuma conversa encontrada ainda.</Text>
        }
      />
    </View>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: tema.background,
    },
    titulo: {
      fontSize: 26,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 20,
      color: tema.secondary,
      textAlign: 'center',
    },
    card: {
      backgroundColor: tema.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: tema.border,
    },
    nome: {
      fontSize: 16,
      fontWeight: 'bold',
      color: tema.textSecondary,
      marginBottom: 4,
    },
    ultimaMensagem: {
      fontSize: 13,
      color: tema.text,
      fontStyle: 'italic',
    },
    mensagem: {
      color: tema.text,
      textAlign: 'center',
      marginTop: 20,
      fontSize: 15,
    },
  });
}
