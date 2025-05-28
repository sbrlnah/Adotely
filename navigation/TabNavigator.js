import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useTheme } from '../contexts/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import MeusPetsScreen from '../screens/MeusPetsScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { tema } = useTheme();
  const [tipoUsuario, setTipoUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarTipoUsuario = async () => {
      if (!auth.currentUser) {
        setErro('Usuário não autenticado.');
        setCarregando(false);
        return;
      }

      try {
        const usuarioRef = doc(db, 'usuarios', auth.currentUser.uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
          const dados = usuarioSnap.data();
          setTipoUsuario(dados.tipo);
        } else {
          setErro('Tipo de usuário não encontrado.');
        }
      } catch (error) {
        setErro('Erro ao buscar tipo de usuário.');
        console.error(error);
      } finally {
        setCarregando(false);
      }
    };

    buscarTipoUsuario();
  }, []);

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: tema.fundo }}>
        <ActivityIndicator size="large" color={tema.botao} />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: tema.fundo }}>
        <Text style={{ color: tema.textoPrimario }}>{erro}</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName={tipoUsuario === 'abrigo' ? 'Meus Pets' : 'Home'}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: tema.botao,
        tabBarInactiveTintColor: tema.textoPlaceholder,
        tabBarStyle: {
          backgroundColor: tema.fundo,
          height: 70,
          paddingBottom: 10,
          borderTopColor: tema.borda,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (tipoUsuario === 'abrigo') {
            switch (route.name) {
              case 'Meus Pets':
                iconName = 'paw-outline';
                break;
              case 'Conversas':
                iconName = 'chatbox-ellipses-outline';
                break;
              case 'Configurações':
                iconName = 'settings-outline';
                break;
              case 'Perfil':
                iconName = 'person-outline';
                break;
              default:
                iconName = 'help-outline';
            }
          } else {
            switch (route.name) {
              case 'Home':
                iconName = 'home-outline';
                break;
              case 'Bichinhos':
                iconName = 'paw-outline';
                break;
              case 'Chat':
                iconName = 'chatbubble-ellipses-outline';
                break;
              default:
                iconName = 'help-outline';
            }
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {tipoUsuario === 'abrigo' ? (
        <>
          <Tab.Screen name="Meus Pets" component={MeusPetsScreen} />
          <Tab.Screen name="Conversas" component={ConversationsScreen} />
          <Tab.Screen name="Perfil" component={PerfilScreen} />
          <Tab.Screen name="Configurações" component={ConfiguracoesScreen} />
        </>
      ) : (
        <>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Bichinhos" component={FavoritesScreen} />
          <Tab.Screen name="Chat" component={ConversationsScreen} />
          <Tab.Screen name="Perfil" component={PerfilScreen} />
          <Tab.Screen name="Configurações" component={ConfiguracoesScreen} 
          options={{ tabBarStyle: { display: 'none' },
          tabBarItemStyle: { display: 'none' },
          tabBarButton: () => null }} />
          <Tab.Screen name="Perfil" component={PerfilScreen} 
          options={{ tabBarStyle: { display: 'none' },
          tabBarItemStyle: { display: 'none' },
          tabBarButton: () => null }} />
        </>
      )}
    </Tab.Navigator>
  );
}
