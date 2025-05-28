import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// Telas principais
import MeusPetsScreen from '../screens/MeusPetsScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import PerfilScreen from '../screens/PerfilScreen';

// Telas internas
import EditarPerfil from '../screens/EditarPerfil';
import ChatScreen from '../screens/ChatScreen';
import CadastroPetScreen from '../screens/CadastroPetScreen';
import EditarPet from '../screens/EditarPet';
import PetDetalhes from '../screens/PetDetalhes';
import InteressadosScreen from '../screens/InteressadosScreen';
import PerfilAdotante from '../screens/PerfilAdotante';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MeusPetsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MeusPets" component={MeusPetsScreen} />
      <Stack.Screen name="EditarPet" component={EditarPet} />
      <Stack.Screen name="PetDetalhes" component={PetDetalhes} />
      <Stack.Screen name="CadastroPet" component={CadastroPetScreen} />
      <Stack.Screen name="Interessados" component={InteressadosScreen} />
      <Stack.Screen name="PerfilAdotante" component={PerfilAdotante} />
    </Stack.Navigator>
  );
}

function ConversasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConversationsMain" component={ConversationsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

function PerfilStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PerfilMain" component={PerfilScreen} />
      <Stack.Screen name="EditarPerfil" component={EditarPerfil} />
    </Stack.Navigator>
  );
}

export default function AbrigoTabNavigator() {
  const { tema } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Meus Pets"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarInactiveTintColor: tema.textoPlaceholder,
        tabBarStyle: {
          backgroundColor: tema.background,
          borderTopColor: tema.border,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Meus Pets':
              iconName = 'paw-outline';
              break;
            case 'Conversas':
              iconName = 'chatbox-ellipses-outline';
              break;
            case 'Perfil':
              iconName = 'person-outline';
              break;
            case 'Configurações':
              iconName = 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Meus Pets" component={MeusPetsStack} />
      <Tab.Screen name="Conversas" component={ConversasStack} />
      <Tab.Screen name="Perfil" component={PerfilStack} />
      <Tab.Screen name="Configurações" component={ConfiguracoesScreen} />
    </Tab.Navigator>
  );
}
