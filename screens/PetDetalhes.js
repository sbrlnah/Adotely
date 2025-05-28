import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase/config';
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { useTheme } from '../contexts/ThemeContext';

export default function PetDetalhes() {
  const route = useRoute();
  const navigation = useNavigation();
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);

  const [pet, setPet] = useState(null);
  const [rejeitado, setRejeitado] = useState(false);
  const [statusAtual, setStatusAtual] = useState('');
  const usuarioId = auth.currentUser?.uid;

  const souCriador = pet?.abrigoId === usuarioId;

  useEffect(() => {
    const carregarPet = async () => {
      try {
        const ref = doc(db, 'pets', route.params.id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const dadosPet = { id: snap.id, ...snap.data() };
          setPet(dadosPet);
          verificarInteracao(dadosPet.id);
        } else {
          Alert.alert('Erro', 'Pet não encontrado.');
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os detalhes.');
      }
    };

    const verificarInteracao = async (petId) => {
      try {
        const interacaoRef = doc(db, 'interacoes', usuarioId, 'pets', petId);
        const snap = await getDoc(interacaoRef);
        if (snap.exists()) {
          const status = snap.data().status;
          setStatusAtual(status);
          if (status === 'rejeitado') setRejeitado(true);
        }
      } catch (err) {
        console.log('Erro ao verificar interações:', err);
      }
    };

    carregarPet();
  }, []);

  const curtirPet = async () => {
    try {
      await setDoc(doc(db, 'interacoes', usuarioId, 'pets', pet.id), {
        status: 'curtido',
      });
      Alert.alert('Pet curtido com sucesso!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível curtir o pet.');
    }
  };

  const descurtirPet = async () => {
    try {
      await setDoc(doc(db, 'interacoes', usuarioId, 'pets', pet.id), {
        status: 'rejeitado',
      });
      Alert.alert('Pet rejeitado!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível descurtir o pet.');
    }
  };

  const marcarComoAdotado = async () => {
    try {
      await updateDoc(doc(db, 'pets', pet.id), { adotado: true });
      Alert.alert('Sucesso', 'Pet marcado como adotado.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  };

  const excluirPet = async () => {
    Alert.alert('Excluir pet', 'Tem certeza que deseja excluir este pet?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'pets', pet.id));
            Alert.alert('Pet excluído com sucesso.');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir.');
          }
        },
      },
    ]);
  };

  if (!pet) {
    return (
      <View style={estilos.container}>
        <Text style={estilos.info}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Text style={estilos.nome}>{pet.nome}</Text>
      {pet.foto && <Image source={{ uri: pet.foto }} style={estilos.imagem} />}
      <Text style={estilos.info}>
        <Text style={estilos.infoTitulo}>Abrigo: </Text>{pet.nomeAbrigo}
      </Text>
      <Text style={estilos.info}>
        <Text style={estilos.infoTitulo}>Idade: </Text>{pet.idade}
      </Text>
      <Text style={estilos.info}>
        <Text style={estilos.infoTitulo}>Raça: </Text>{pet.raca}
      </Text>
      <Text style={estilos.info}>
        <Text style={estilos.infoTitulo}>Pelagem: </Text>{pet.pelagem}
      </Text>
      <Text style={estilos.info}>
        <Text style={estilos.infoTitulo}>Sexo: </Text>{pet.sexo}
      </Text>
      <Text style={estilos.info}>
        <Text style={estilos.infoTitulo}>Comportamento: </Text>{pet.comportamento}
      </Text>

      <Text style={estilos.subtitulo}>Descrição</Text>
      <Text style={[estilos.info, { marginBottom: 12 }]}>{pet.descricao}</Text>

      {pet.doencas?.length > 0 && (
        <>
          <Text style={estilos.subtitulo}>Doenças</Text>
          <View style={estilos.tagContainer}>
            {pet.doencas.map((d, i) => (
              <View key={i} style={estilos.tag}>
                <Text style={estilos.tagTexto}>{d}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {pet.localizacao?.cidade && (
        <Text style={estilos.info}>
          <Text style={estilos.infoTitulo}>Localização: </Text>{pet.localizacao.cidade}
        </Text>
      )}

      {/* abrigo responsável */}
      {souCriador && (
        <>
          <TouchableOpacity style={estilos.botao} onPress={() => navigation.navigate('EditarPet', { id: pet.id })}>
            <Text style={estilos.textoBotaoSecundario}>Editar Pet</Text>
          </TouchableOpacity>

          <TouchableOpacity style={estilos.botao} onPress={() => navigation.navigate('Interessados', { petId: pet.id })}>
            <Text style={estilos.textoBotaoSecundario}>Interessados</Text>
          </TouchableOpacity>

          {!pet.adotado && (
            <TouchableOpacity style={estilos.botaoAdotar} onPress={marcarComoAdotado}>
              <Text style={estilos.textoBotao}>Marcar como Adotado</Text>
            </TouchableOpacity>
          )}
        
          <TouchableOpacity style={estilos.botaoExcluir} onPress={excluirPet}>
            <Text style={estilos.textoApagar}>Excluir Pet</Text>
            </TouchableOpacity>
        </>
      )}

      {/* adotante */}
      {!souCriador && (
        <>
          {rejeitado && (
            <TouchableOpacity style={estilos.botaoAdotar} onPress={curtirPet}>
              <Text style={estilos.textoBotao}>Curtir novamente</Text>
            </TouchableOpacity>
          )}

          {statusAtual === 'curtido' && (
            <TouchableOpacity style={estilos.botao} onPress={descurtirPet}>
              <Text style={estilos.textoBotao1}>Descurtir</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    container: {
      backgroundColor: tema.background,
      padding: 20,
      paddingBottom: 40,
    },
    imagem: {
      width: '100%',
      height: 340,
      borderRadius: 20,
      marginBottom: 20,
      backgroundColor: '#E0E7FF',
      borderColor: tema.border,
      borderWidth: 2,
      borderRadius: 20,
    },
    nome: {
      fontSize: 26,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
      color: '#5F6DF5',
      textAlign: 'center',
    },
    subtitulo: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#5F6DF5',
      marginTop: 10,
      marginBottom: 6,
    },
    info: {
      fontSize: 16,
      color: tema.text,
      marginBottom: 6,
    },
    infoTitulo: {
      color: tema.text,
      fontWeight: '700',
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    tag: {
      backgroundColor: tema.primary,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 6,
      marginBottom: 6,
    },
    tagTexto: {
      color: tema.background,
      fontSize: 13,
      fontWeight: 'bold',
    },
    botao: {
      backgroundColor: tema.primary,
      padding: 14,
      borderRadius: 50,
      alignItems: 'center',
      marginBottom: 16,
    },
    botaoAdotar: {
      backgroundColor: '#5F6DF5',
      padding: 14,
      borderRadius: 50,
      alignItems: 'center',
      marginBottom: 16,
    },
    botaoExcluir: {
      alignItems: 'center',
      marginBottom: 16,
    },
    textoBotao: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    textoBotaoSecundario: {
      color: tema.texto,
      fontWeight: 'bold',
      fontSize: 16,
    },
    textoApagar: {
      color: tema.textComplimentary,
      textAlign: 'center',
      fontSize: 14,
      marginBottom: 40,
    },
  });
}
