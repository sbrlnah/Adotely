import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { registerRootComponent } from 'expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { auth, db } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import TrocarSenha from './screens/TrocarSenha';
import OnboardingScreen from './screens/Onboarding';
import AdotanteTabNavigator from './navigation/AdotanteTabNavigator';
import AbrigoTabNavigator from './navigation/AbrigoTabNavigator';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { tema, cores } = useTheme();
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(null);
  const [mostrarOnboarding, setMostrarOnboarding] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const temaCores = cores?.[tema] || {
    fundo: '#fff',
    botao: '#5F6DF5',
  };

  useEffect(() => {
    const verificarOnboarding = async () => {
      const visto = await AsyncStorage.getItem('@onboardingVisto');
      setMostrarOnboarding(visto !== 'true');
    };

    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      setUsuarioLogado(usuario);

      if (usuario) {
        try {
          const docRef = doc(db, 'usuarios', usuario.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const tipo = docSnap.data().tipo;
            setTipoUsuario(tipo);
          }
        } catch (e) {
          console.error('Erro ao obter tipo de usuário:', e);
        }
      }

      setCarregando(false);
    });

    verificarOnboarding();
    return unsubscribe;
  }, []);

  if (carregando || mostrarOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: temaCores.fundo }}>
        <ActivityIndicator size="large" color={temaCores.botao} />
      </View>
    );
  }

 return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {mostrarOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !usuarioLogado ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="TrocarSenha" component={TrocarSenha} />
          </>
        ) : tipoUsuario === 'abrigo' ? (
          <Stack.Screen name="MainTabs" component={AbrigoTabNavigator} />
        ) : (
          <Stack.Screen name="MainTabs" component={AdotanteTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};


const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </GestureHandlerRootView>
);

registerRootComponent(App);