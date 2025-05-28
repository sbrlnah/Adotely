import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useTheme } from '../contexts/ThemeContext';

// Telas principais
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ConversationsScreen from '../screens/ConversationsScreen';

// Telas internas
import PetDetalhes from '../screens/PetDetalhes';
import ChatScreen from '../screens/ChatScreen';
import PerfilScreen from '../screens/PerfilScreen';
import EditarPerfil from '../screens/EditarPerfil';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="PetDetalhes" component={PetDetalhes} />
    </Stack.Navigator>
  );
}

function FavoritesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesMain" component={FavoritesScreen} />
      <Stack.Screen name="PetDetalhes" component={PetDetalhes} />
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatMain" component={ConversationsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

function PerfilStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Perfil" component={PerfilScreen} />
      <Stack.Screen name="EditarPerfil" component={EditarPerfil} />
      <Stack.Screen name= "Configuracoes" component={ConfiguracoesScreen} />
    </Stack.Navigator>
  );
}

export default function AdotanteTabNavigator() {
  const { tema } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: tema.botao,
        tabBarInactiveTintColor: tema.textoPlaceholder,
        tabBarStyle: {
          backgroundColor: tema.background,
          height: 70,
          paddingBottom: 10,
          borderTopColor: tema.border,
        },
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          if (route.name === 'Bichinhos') iconName = 'paw-outline';
          if (route.name === 'Chat') iconName = 'chatbubble-ellipses-outline';
          if (route.name === 'Perfil') iconName = 'person-outline';

          return (
            <View>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Bichinhos" component={FavoritesStack} />
      <Tab.Screen name="Chat" component={ChatStack} />
      <Tab.Screen name="Perfil" component={PerfilStack} 
      options={{ tabBarButton: () => null,
        tabBarStyle: { display: 'none' },
        tabBarItemStyle: { display: 'none' },
  }}
/>
      <Tab.Screen name="Configurações" component={ConfiguracoesScreen} 
      options={{ tabBarButton: () => null,
        tabBarStyle: { display: 'none' },
        tabBarItemStyle: { display: 'none' },
  }}
/>
    </Tab.Navigator>
  );
}
