import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { auth, db } from '../firebase/config';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const filtrosDisponiveis = ['Tudo', 'Curtido', 'Match', 'Rejeitado'];

export default function FavoritesScreen() {
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);
  const [filtro, setFiltro] = useState('Tudo');
  const [pets, setPets] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigation = useNavigation();
  const usuarioId = auth.currentUser?.uid;

  useEffect(() => {
    if (!usuarioId) return;

    setCarregando(true);
    const interacoesRef = collection(db, 'interacoes', usuarioId, 'pets');

    const unsubscribe = onSnapshot(interacoesRef, async (snapshot) => {
      const lista = [];

      for (const interacaoDoc of snapshot.docs) {
        const { status } = interacaoDoc.data();
        if (filtro === 'Tudo' || status.toLowerCase() === filtro.toLowerCase()) {
          const petRef = doc(db, 'pets', interacaoDoc.id);
          const petSnap = await getDoc(petRef);

          if (petSnap.exists()) {
            lista.push({ id: interacaoDoc.id, ...petSnap.data(), status });
          }
        }
      }

      setPets(lista);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, [filtro, usuarioId]);

  const atualizarStatus = async (petId, novoStatus) => {
    const interacaoRef = doc(db, 'interacoes', usuarioId, 'pets', petId);
    await setDoc(interacaoRef, { status: novoStatus });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PetDetalhes', { id: item.id })}
      style={estilos.card}
    >
      <Image source={{ uri: item.foto }} style={estilos.imagem} />
      <View style={estilos.info}>
        <Text style={estilos.nome}>
          {item.nome}
          {item.status === 'match'}
          {item.status === 'curtido'}
          {item.status === 'rejeitado'}
        </Text>
        <Text style={estilos.raca}>{item.raca} • {item.idade}</Text>
        <View style={estilos.botoes}>
          <TouchableOpacity onPress={() => atualizarStatus(item.id, 'rejeitado')}>
            <FontAwesome name="times-circle" size={20} color="#C7D7FF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => atualizarStatus(item.id, 'curtido')}>
            <FontAwesome name="heart" size={20} color="#5F6DF5" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Meus Bichinhos</Text>

      <View style={estilos.filtros}>
        {filtrosDisponiveis.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setFiltro(item)}
            style={[
              estilos.botaoFiltro,
              filtro === item && estilos.filtroAtivo,
            ]}
          >
            <Text
              style={[
                estilos.textoFiltro,
                filtro === item && estilos.textoFiltroAtivo,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color={tema.primaria} />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
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
      color: '#5F6DF5',
      textAlign: 'center',
    },
    filtros: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 12,
      gap: 8,
    },
    botaoFiltro: {
      backgroundColor: '#E0E7FF',
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderColor: '#C7D7FF',
      borderWidth: 1.5,
    },
    filtroAtivo: {
      backgroundColor: '#5F6DF5',
      borderColor: '#5F6DF5',
    },
    textoFiltro: {
      fontSize: 14,
      color: tema.background,
    },
    textoFiltroAtivo: {
      color: '#fff',
      fontWeight: 'bold',
    },
    card: {
      backgroundColor: tema.card,
      borderColor: tema.border,
      borderWidth: 2,
      borderRadius: 16,
      margin: 8,
      width: '44%',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    imagem: {
      width: '100%',
      height: 100,
      marginBottom: 4,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    info: {
      padding: 8,
    },
    nome: {
      fontSize: 16,
      fontWeight: 'bold',
      color: tema.text,
      marginBottom: 4,
    },
    raca: {
      fontSize: 13,
      color: tema.text,
    },
    botoes: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      marginTop: 8,
    },
  });
}
