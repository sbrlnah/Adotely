import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import SwipeCard from './SwipeCard';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SwipeCardStack() {
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);

  const [pets, setPets] = useState([]);
  const [indice, setIndice] = useState(0);
  const translateX = useSharedValue(0);

  const usuarioId = auth.currentUser?.uid;

  useEffect(() => {
    if (!usuarioId) return;

    let petsAtuais = [];
    let interacoes = [];

    const atualizarLista = () => {
      const petsParaExibir = petsAtuais.filter(pet => {
        const foiCurtido = interacoes.find(i => i.id === pet.id);
        return !pet.adotado && !foiCurtido;
      });
      setPets(petsParaExibir);
      setIndice(0);
    };

    const unsubscribePets = onSnapshot(collection(db, 'pets'), snapshot => {
      petsAtuais = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      atualizarLista();
    });

    const unsubscribeInteracoes = onSnapshot(collection(db, 'interacoes', usuarioId, 'pets'), snapshot => {
      interacoes = snapshot.docs
        .filter(doc => ['curtido', 'match'].includes(doc.data().status))
        .map(doc => ({ id: doc.id }));
      atualizarLista();
    });

    return () => {
      unsubscribePets();
      unsubscribeInteracoes();
    };
  }, [usuarioId]);

  const proximoPet = () => {
    setIndice((prev) => prev + 1);
    translateX.value = 0;
  };

  const salvarInteracao = async (petId, status) => {
    if (!usuarioId) return;

    const petRef = doc(db, 'pets', petId);
    const petSnap = await getDoc(petRef);
    if (!petSnap.exists()) return;

    const pet = petSnap.data();
    const abrigoId = pet.abrigoId;

    const abrigoInteracaoRef = doc(db, 'interacoes', abrigoId, 'usuarios', usuarioId);
    const abrigoInteracaoSnap = await getDoc(abrigoInteracaoRef);
    const abrigoCurtiu = abrigoInteracaoSnap.exists() && abrigoInteracaoSnap.data().status === 'curtido';

    const novoStatus = abrigoCurtiu ? 'match' : status;

    const interacaoRef = doc(db, 'interacoes', usuarioId, 'pets', petId);
    await setDoc(interacaoRef, {
      status: novoStatus,
      abrigoId,
      adotanteId: usuarioId,
      timestamp: Date.now(),
    });

    if (abrigoCurtiu) {
      await setDoc(abrigoInteracaoRef, {
        status: 'match',
        abrigoId,
        adotanteId: usuarioId,
        timestamp: Date.now(),
      });
    }
  };

  const handleLike = async (id) => {
    await salvarInteracao(id, 'curtido');
    runOnJS(proximoPet)();
  };

  const handleDislike = async (id) => {
    await salvarInteracao(id, 'rejeitado');
    runOnJS(proximoPet)();
  };

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      if (event.translationX > 150) {
        runOnJS(handleLike)(pets[indice].id);
        translateX.value = withSpring(SCREEN_WIDTH);
      } else if (event.translationX < -150) {
        runOnJS(handleDislike)(pets[indice].id);
        translateX.value = withSpring(-SCREEN_WIDTH);
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  if (indice >= pets.length) {
    return (
      <View style={estilos.fimContainer}>
        <Text style={estilos.fimTexto}>🎉 Você viu todos os pets!</Text>
      </View>
    );
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[animatedStyle]}>
        <SwipeCard
          pet={pets[indice]}
          onLike={handleLike}
          onDislike={handleDislike}
        />
      </Animated.View>
    </PanGestureHandler>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    fimContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      marginTop: 50,
    },
    fimTexto: {
      fontSize: 16,
      color: tema.texto,
    },
  });
}
