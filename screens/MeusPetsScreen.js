import React, { useEffect, useState, useMemo } from 'react';
import {
  View, FlatList, Text, TouchableOpacity, Image,
  StyleSheet, Modal, Alert
} from 'react-native';
import {
  collection, query, where, onSnapshot, updateDoc, deleteDoc, doc
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

export default function MeusPetsScreen() {
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);
  const navigation = useNavigation();

  const [meusPets, setMeusPets] = useState([]);
  const [menuVisivel, setMenuVisivel] = useState(false);
  const [petSelecionado, setPetSelecionado] = useState(null);
  const [filtro, setFiltro] = useState('Todos');

  useEffect(() => {
    const q = query(collection(db, 'pets'), where('abrigoId', '==', auth.currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Pets do abrigo:', dados);
      setMeusPets(dados);
    });

    return () => unsubscribe();
  }, []);

  const confirmarAdocao = async (petId) => {
    await updateDoc(doc(db, 'pets', petId), { adotado: true });
    Alert.alert('Parabéns!', 'Seu pet foi adotado!');
  };

  const excluirPet = async (id) => {
    Alert.alert('Confirmação', 'Deseja excluir este pet?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'pets', id));
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir.');
          }
        },
      },
    ]);
  };

  const abrirMenu = (pet) => {
    setPetSelecionado(pet);
    setMenuVisivel(true);
  };

  const renderItem = ({ item }) => {
    if (filtro === 'Adotado' && !item.adotado) return null;
    if (filtro === 'Não Adotado' && item.adotado) return null;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('PetDetalhes', { id: item.id })}
        style={estilos.card}
      >
        <Image source={{ uri: item.foto }} style={estilos.imagem} />
        <View style={estilos.info}>
          <Text style={estilos.nome}>
            {item.nome} {item.adotado && '🏡'}
          </Text>
          <Text style={estilos.raca}>{item.raca} • {item.idade}</Text>
          <TouchableOpacity onPress={() => abrirMenu(item)} style={estilos.menuBotao}>
            <Text style={estilos.menuTexto}>⋯</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Meus Pets</Text>

      <View style={estilos.filtros}>
        {['Todos', 'Adotado', 'Não Adotado'].map((opcao) => (
          <TouchableOpacity
            key={opcao}
            onPress={() => setFiltro(opcao)}
            style={[
              estilos.botaoFiltro,
              filtro === opcao && estilos.filtroAtivo,
            ]}
          >
            <Text
              style={[
                estilos.textoFiltro,
                filtro === opcao && estilos.textoFiltroAtivo,
              ]}
            >
              {opcao}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={meusPets}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={estilos.botaoFlutuante}
        onPress={() => navigation.navigate('CadastroPet')}
      >
        <FontAwesome name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={menuVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisivel(false)}
      >
        <TouchableOpacity
          style={estilos.modalFundo}
          activeOpacity={1}
          onPressOut={() => setMenuVisivel(false)}
        >
          <View style={estilos.menuContainer}>
            <TouchableOpacity
              style={estilos.menuItem}
              onPress={() => {
                navigation.navigate('EditarPet', { id: petSelecionado.id });
                setMenuVisivel(false);
              }}
            >
              <Text style={estilos.menuTextoItem}>Editar</Text>
            </TouchableOpacity>

            {!petSelecionado?.adotado && (
              <TouchableOpacity
                style={estilos.menuItem}
                onPress={() => {
                  confirmarAdocao(petSelecionado.id);
                  setMenuVisivel(false);
                }}
              >
                <Text style={[estilos.menuTextoItem, { color: '#5F6DF5', fontWeight: 'bold' }]}>
                  Marcar como adotado
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={estilos.menuItem}
              onPress={() => {
                excluirPet(petSelecionado.id);
                setMenuVisivel(false);
              }}
            >
              <Text style={[estilos.menuTextoItem, { color: '#D9534F' }]}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
      color: tema.texto,
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
    menuBotao: {
      position: 'absolute',
      right: 8,
      top: 4,
    },
    menuTexto: {
      fontSize: 20,
      color: tema.text,
    },
    botaoFlutuante: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      backgroundColor: '#5F6DF5',
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
    },
    modalFundo: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuContainer: {
      backgroundColor: tema.modal,
      padding: 16,
      borderRadius: 12,
      width: 220,
    },
    menuItem: {
      paddingVertical: 12,
    },
    menuTextoItem: {
      fontSize: 15,
      color: tema.text,
    },
  });
}
