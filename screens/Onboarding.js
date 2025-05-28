import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

const slides = [
  {
    key: '1',
    title: 'Adote com amor',
    text: 'Encontre animais que precisam de um lar',
    color: '#5F6DF5',
    image: require('../assets/onboarding1.png')
  },
  {
    key: '2',
    title: 'Conecte-se com abrigos',
    text: 'Converse com abrigos e saiba tudo sobre o pet',
    color: '#5F6DF5',
    image: require('../assets/onboarding2.png')
  },
  {
    key: '3',
    title: 'Finalize com segurança',
    text: 'Adote com tranquilidade e sem burocracia',
    color: '#33A5EC',
    image: require('../assets/onboarding3.png')
  }
];

export default function OnboardingScreen({ navigation }) {
  const { tema } = useTheme();
  const estilos = criarEstilos(tema);
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  useEffect(() => {
    const verificarSeJaViu = async () => {
      const visto = await AsyncStorage.getItem('@onboardingVisto');
      if (visto === 'true') {
        navigation.navigate('Login');
      }
    };
    verificarSeJaViu();
  }, []);

  const avancar = async () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      await AsyncStorage.setItem('@onboardingVisto', 'true');
      navigation.navigate('Login');
    }
  };

  return (
    <View style={estilos.container}>
      <Image source={slide.image} style={estilos.image} />
      <Text style={[estilos.title, { color: slide.color }]}>{slide.title}</Text>
      <Text style={[estilos.text, { color: slide.color }]}>{slide.text}</Text>
      <TouchableOpacity style={estilos.botao} onPress={avancar}>
        <Text style={estilos.botaoTexto}>
          {index === slides.length - 1 ? 'Começar' : 'Próximo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
      backgroundColor: tema.fundo,
    },
    image: {
      width: 250,
      height: 250,
      marginBottom: 30,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 50,
      fontWeight: 'bold',
      marginBottom: 10,
      color: tema.textoPrimario,
      textAlign: 'center',
    },
    text: {
      fontSize: 25,
      textAlign: 'center',
      color: tema.textoPrimario,
      marginBottom: 30,
    },
    botao: {
      backgroundColor: '#5F6DF5',
      padding: 12,
      paddingHorizontal: 40,
      borderRadius: 8,
    },
    botaoTexto: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
}
