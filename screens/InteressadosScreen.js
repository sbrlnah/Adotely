import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { auth, db } from '../firebase/config';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function InteressadosScreen({ route }) {
  const { petId } = route.params;
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);
  const navigation = useNavigation();

  const [usuariosInteressados, setUsuariosInteressados] = useState([]);

  useEffect(() => {
    const buscarUsuarios = async () => {
      const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));
      const interessados = [];

      for (const userDoc of usuariosSnapshot.docs) {
        const userId = userDoc.id;
        const interacaoRef = doc(db, 'interacoes', userId, 'pets', petId);
        const interacaoDoc = await getDoc(interacaoRef);

        if (interacaoDoc.exists()) {
          const dadosInteracao = interacaoDoc.data();

          if (dadosInteracao.status === 'curtido' || dadosInteracao.status === 'match') {
            const dadosUsuario = userDoc.data();
            interessados.push({
              userId,
              nome: dadosUsuario.nome || 'Adotante Anônimo',
              idade: dadosUsuario.idade || '',
              cidade: dadosUsuario.cidade || '',
              foto: dadosUsuario.foto || null,
              status: dadosInteracao.status,
            });
          }
        }
      }

      setUsuariosInteressados(interessados);
    };

    buscarUsuarios();
  }, [petId]);

  const aprovarMatch = async (userId) => {
    try {
      const interacaoRef = doc(db, 'interacoes', userId, 'pets', petId);
      await setDoc(interacaoRef, {
        status: 'match',
        abrigoId: auth.currentUser.uid,
        adotanteId: userId,
        timestamp: Date.now(),
      });

      const abrigoInteracaoRef = doc(db, 'interacoes', auth.currentUser.uid, 'usuarios', userId);
      await setDoc(abrigoInteracaoRef, {
        status: 'match',
        abrigoId: auth.currentUser.uid,
        adotanteId: userId,
        timestamp: Date.now(),
      });

      Alert.alert('Você deu Match!', 'Abra o chat e converse com o Interessado!');
      setUsuariosInteressados(prev =>
        prev.map(u =>
          u.userId === userId ? { ...u, status: 'match' } : u
        )
      );
    } catch (error) {
      console.error('Erro ao aprovar match:', error);
      Alert.alert('Erro', 'Não foi possível aprovar o match.');
    }
  };

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Interessados</Text>

      <FlatList
        data={usuariosInteressados}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={estilos.card}
            onPress={() => navigation.navigate('PerfilAdotante', { userId: item.userId })}
          >
            {item.foto ? (
              <Image source={{ uri: item.foto }} style={estilos.avatar} />
            ) : (
              <View style={estilos.fotoPlaceholder}>
                <Ionicons name="person-outline" size={60} color= {tema.textComplimentary} />
              </View>
            )}

            <View style={estilos.info}>
              <Text style={estilos.nome}>{item.nome}</Text>
              <Text style={estilos.idadeCidade}>
                {item.idade} {item.cidade ? `• ${item.cidade}` : ''}
                </Text>

              {item.status === 'curtido' ? (
                <TouchableOpacity
                  style={estilos.botao}
                  onPress={() => aprovarMatch(item.userId)}
                >
                  <Text style={estilos.textoBotao}>Aprovar Match</Text>
                </TouchableOpacity>
              ) : (
                <Text style={estilos.matchConfirmado}>Match aprovado!</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={estilos.mensagem}>Nenhum interessado até o momento.</Text>
        }
      />
    </View>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: tema.background,
    },
    titulo: {
      fontSize: 26,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 20,
      color: '#5F6DF5',
      textAlign: 'center',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginBottom: 12,
      backgroundColor: tema.card,
      borderRadius: 12,
      borderColor: tema.border,
      borderWidth: 1,
    },
    avatar: {
      width: 74,
      height: 74,
      borderRadius: 38,
      marginRight: 12,
    },
    fotoPlaceholder: {
      width: 74,
      height: 74,
      borderRadius: 38,
      backgroundColor: '#E0E7FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    info: {
      flex: 1,
    },
    nome: {
      fontSize: 16,
      fontWeight: 900,
      color: tema.primary,
    },
    idadeCidade: {
      fontSize: 14,
      color: tema.text,
      marginBottom: 1,
      marginTop: 3,
    },

    botao: {
      backgroundColor: '#5F6DF5',
      paddingVertical: 6,
      paddingHorizontal: 12,
      alignContent: 'center',
      borderRadius: 50,
      alignItems: 'center',
      marginTop: 6,
    },
    textoBotao: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 13,
    },
    matchConfirmado: {
      color: tema.secondary,
      fontWeight: 'bold',
      fontSize: 13,
    },
    mensagem: {
      color: tema.text,
      textAlign: 'center',
      marginTop: 20,
    },
  });
}
