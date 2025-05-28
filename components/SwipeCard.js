import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function SwipeCard({ pet, onLike, onDislike }) {
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);

  return (
    <View style={estilos.card}>
      <ScrollView contentContainerStyle={estilos.scrollContent}>
        <View style={estilos.imagemContainer}>
          <Image source={{ uri: pet.foto }} style={estilos.imagem} />
        </View>

        <View style={estilos.info}>
          <Text style={estilos.nome}>{pet.nome} • {pet.idade}</Text>
          <Text style={estilos.subinfo}>{pet.raca} • {pet.pelagem}</Text>

          {pet.doencas?.length > 0 && (
            <View style={estilos.tagsContainer}>
              {pet.doencas.map((doenca, index) => (
                <Text key={index} style={estilos.tagDoenca}>
                  {doenca}
                </Text>
              ))}
            </View>
          )}

          <Text style={estilos.descricao}>{pet.descricao}</Text>
        </View>
      </ScrollView>

      <View style={estilos.acoes}>
        <TouchableOpacity style={estilos.botaoRejeitar} onPress={() => onDislike(pet.id)}>
          <FontAwesome name="times" size={28} color={tema.textComplimentary} />
        </TouchableOpacity>

        <TouchableOpacity style={estilos.botaoCurtir} onPress={() => onLike(pet.id)}>
          <FontAwesome name="heart" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    card: {
      backgroundColor: tema.card,
      borderColor: tema.border,
      borderWidth: 2,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 4,
      marginBottom: 20,
      minHeight: 720,
    },
    scrollContent: {
      paddingBottom: 16,
    },
    imagemContainer: {
      padding: 12,
    },
    imagem: {
      width: '100%',
      height: 360,
      borderRadius: 12,
      backgroundColor: tema.primary,
    },
    info: {
      paddingHorizontal: 16,
    },
    nome: {
      fontSize: 20,
      fontWeight: 'bold',
      color: tema.secondary,
    },
    subinfo: {
      fontSize: 14,
      color: tema.text,
      marginTop: 4,
      marginBottom: 8,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 8,
    },
    tagDoenca: {
      backgroundColor: tema.alerta,
      color: tema.textComplimentary,
      fontSize: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginRight: 6,
      marginBottom: 6,
    },
    descricao: {
      fontSize: 14,
      color: tema.text,
      marginBottom: 8,
    },
    acoes: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 12,
      paddingHorizontal: 30,
      backgroundColor: tema.card,
      },
    botaoCurtir: {
      backgroundColor: '#5F6DF5',
      borderRadius: 50,
      paddingVertical: 16,
      paddingHorizontal: 18,
      marginRight: -30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botaoRejeitar: {
      backgroundColor: tema.primary,
      borderRadius: 50,
      paddingVertical: 16,
      paddingHorizontal: 19,
      marginRight: 180,
      marginLeft: -30,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
