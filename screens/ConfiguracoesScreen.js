import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase/config';
import { deleteDoc, doc } from 'firebase/firestore';
import { useTheme } from '../contexts/ThemeContext';

export default function ConfiguracoesScreen() {
  const navigation = useNavigation();
  const { tema, modoEscuro, alternarTema } = useTheme();
  const estilos = criarEstilos(tema);

  const logout = async () => {
    await auth.signOut();
  };

  const apagarConta = async () => {
    Alert.alert('Confirmação', 'Deseja mesmo apagar sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'usuarios', auth.currentUser.uid));
            await auth.currentUser.delete();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });

          } catch (e) {
            Alert.alert('Erro', 'Não foi possível apagar a conta.');
          }
        },
      },
    ]);
  };

  const irParaEditarPerfil = () => {
    navigation.navigate('Perfil', { screen: 'EditarPerfil' });
  };

  return (
    <ScrollView style={{ backgroundColor: tema.background }} contentContainerStyle={estilos.container}>
      <Text style={estilos.titulo}>Configurações</Text>

      <View style={estilos.item}>
        <Text style={estilos.textoItem}>Tema escuro</Text>
        <Switch
          value={modoEscuro}
          onValueChange={alternarTema}
          thumbColor={modoEscuro ? '#fff' : '#eee'}
          trackColor={{ true: '#5F6DF5', false: '#C7D7FF' }}
        />
      </View>

      <TouchableOpacity style={estilos.botaoEditar} onPress={irParaEditarPerfil}>
        <Text style={estilos.textoBotaoEditar}>Editar perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={estilos.botaoSair} onPress={logout}>
        <Text style={estilos.textoBotaoSair}>Sair da conta</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={apagarConta}>
        <Text style={estilos.textoApagar}>Apagar minha conta</Text>
      </TouchableOpacity>

      <View style={estilos.sobreContainer}>
        <Text style={estilos.sobreTitulo}>Sobre o Adotely</Text>
        <Text style={estilos.sobreTexto}>
          O Adotely é um aplicativo gratuito que conecta abrigos de animais a adotantes com base
          em localização e perfil. Idealizado com foco em acessibilidade e usabilidade, foi pensado
          para facilitar o processo de adoção responsável de cães e gatos.
        </Text>
        <Text style={estilos.versao}>Versão 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: tema.background,
    },
    titulo: {
      fontSize: 26,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 20,
      color: tema.secondary,
      textAlign: 'center',
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: tema.primary,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: tema.border,
    },
    textoItem: {
      fontSize: 16,
      color: tema.textoPrimario,
    },
    botaoEditar: {
      backgroundColor: tema.primary,
      padding: 14,
      borderRadius: 14,
      alignItems: 'center',
      marginBottom: 16,
    },
    textoBotaoEditar: {
      color: tema.textoPrimario,
      fontWeight: 'bold',
      fontSize: 15,
    },
    botaoSair: {
      backgroundColor: tema.secondary,
      padding: 14,
      borderRadius: 14,
      alignItems: 'center',
      marginBottom: 16,
    },
    textoBotaoSair: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 15,
    },
    textoApagar: {
      color: tema.textComplimentary,
      textAlign: 'center',
      fontSize: 14,
      marginBottom: 40,
    },
    sobreContainer: {
      borderTopWidth: 1,
      borderColor: tema.background,
      paddingTop: 20,
    },
    sobreTitulo: {
      fontSize: 18,
      fontWeight: 'bold',
      color: tema.secondary,
      marginBottom: 10,
    },
    sobreTexto: {
      fontSize: 14,
      color: tema.text,
      marginBottom: 10,
      lineHeight: 20,
    },
    versao: {
      fontSize: 12,
      color: tema.text,
      textAlign: 'right',
    },
  });
};
