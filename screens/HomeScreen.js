import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { auth, db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import SwipeCardStack from '../components/SwipeCardStack';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);

  const [localizacao, setLocalizacao] = useState(null);
  const [carregandoLocal, setCarregandoLocal] = useState(true);
  const [nomeUsuario, setNomeUsuario] = useState('');

  useEffect(() => {
    const buscarLocalizacao = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Não foi possível acessar sua localização.');
          setLocalizacao('Localização não disponível');
          return;
        }

        const posicao = await Location.getCurrentPositionAsync({});
        const endereco = await Location.reverseGeocodeAsync({
          latitude: posicao.coords.latitude,
          longitude: posicao.coords.longitude,
        });

        if (endereco.length > 0) {
          const { city, region } = endereco[0];
          setLocalizacao(`${city} - ${region}`);
        } else {
          setLocalizacao('Localização não encontrada');
        }
      } catch (error) {
        console.log('Erro ao obter localização:', error);
        setLocalizacao('Erro na localização');
      } finally {
        setCarregandoLocal(false);
      }
    };

    const unsubscribe = onSnapshot(doc(db, 'usuarios', auth.currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const dados = docSnap.data();
        setNomeUsuario(dados.nome?.split(' ')[0] || 'Usuário');
      } else {
        setNomeUsuario('Usuário');
      }
    });

    buscarLocalizacao();

    return () => unsubscribe();
  }, []);

  return (
    <View style={estilos.container}>
      <View style={estilos.header}>
        <View style={estilos.headerTexto}>
          <Text style={estilos.saudacao}>Olá, </Text>
          <Text style={estilos.nome}>{nomeUsuario}</Text>
        </View>

        <View style={estilos.headerIcones}>
          <TouchableOpacity onPress={() => navigation.navigate('Configurações')}>
            <FontAwesome name="cog" size={34} color={tema.secondary} style={{ marginRight: 16 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
            <FontAwesome name="user-circle-o" size={34} color={tema.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={estilos.localizacao}>
        Filtrar por: {carregandoLocal ? 'Carregando...' : localizacao}
      </Text>

      <View style={estilos.swipeContainer}>
        <SwipeCardStack />
      </View>
    </View>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.background,
      paddingHorizontal: 16,
      paddingTop: 50,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    headerTexto: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    headerIcones: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    saudacao: {
      fontSize: 24,
      fontWeight: 'bold',
      color: tema.secondary,
    },
    nome: {
      fontSize: 24,
      fontWeight: 'bold',
      color: tema.secondary,
    },
    localizacao: {
      fontSize: 14,
      color: tema.text,
      marginBottom: 10,
    },
    swipeContainer: {
      flex: 1,
    },
  });
};
