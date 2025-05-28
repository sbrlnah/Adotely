import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage, db, auth } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function EditarPerfil() {
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);
  const navigation = useNavigation();

  const [dados, setDados] = useState({ nome: '', idade: '', cidade: '', biografia: '' });
  const [foto, setFoto] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const refUsuario = doc(db, 'usuarios', auth.currentUser.uid);
        const snap = await getDoc(refUsuario);
        if (snap.exists()) {
          const user = snap.data();
          setDados({
            nome: user.nome || '',
            idade: user.idade || '',
            cidade: user.cidade || '',
            biografia: user.biografia || '',
          });
          if (user.foto) setFoto(user.foto);
        }
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const salvar = async () => {
    let urlImagem = foto;

    if (foto && foto.startsWith('file')) {
      const blob = await fetch(foto).then((r) => r.blob());
      const nomeImagem = `${auth.currentUser.uid}_perfil.jpg`;
      const imagemRef = ref(storage, `usuarios/${nomeImagem}`);
      await uploadBytes(imagemRef, blob);
      urlImagem = await getDownloadURL(imagemRef);
    }

    try {
      await updateDoc(doc(db, 'usuarios', auth.currentUser.uid), {
        ...dados,
        foto: urlImagem,
      });
      Alert.alert('Sucesso', 'Perfil atualizado!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    }
  };

  const escolherImagem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setFoto(result.assets[0].uri);
    }
  };

  if (carregando) {
    return (
      <View style={estilos.container}>
        <ActivityIndicator size="large" color={tema.botao} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={estilos.container} keyboardShouldPersistTaps="handled">
          <Text style={estilos.titulo}>Editar Perfil</Text>

          <TouchableOpacity onPress={escolherImagem} style={estilos.fotoContainer}>
            {foto ? (
              <Image source={{ uri: foto }} style={estilos.fotoPreview} />
            ) : (
              <View style={estilos.fotoPreview}>
                <Text style={{ color: tema.text }}>Sem foto</Text>
              </View>
            )}
            <View style={estilos.fotoOverlay}>
              <MaterialIcons name="photo-camera" size={24} color={tema.background} />
            </View>
          </TouchableOpacity>

          <TextInput
            placeholder="Nome"
            value={dados.nome}
            onChangeText={(t) => setDados({ ...dados, nome: t })}
            style={estilos.input}
            placeholderTextColor={tema.text}
          />
          <TextInput
            placeholder="Idade"
            value={dados.idade}
            onChangeText={(t) => setDados({ ...dados, idade: t })}
            style={estilos.input}
            placeholderTextColor={tema.text}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Cidade"
            value={dados.cidade}
            onChangeText={(t) => setDados({ ...dados, cidade: t })}
            style={estilos.input}
            placeholderTextColor={tema.text}
          />
          <TextInput
            placeholder="Biografia (fale um pouco sobre você)"
            value={dados.biografia}
            onChangeText={(t) => setDados({ ...dados, biografia: t })}
            style={[estilos.input, { height: 100, textAlignVertical: 'top' }]}
            placeholderTextColor={tema.text}
            multiline
          />

          <TouchableOpacity onPress={salvar} style={estilos.botao}>
            <Text style={estilos.textoBotao}>Salvar alterações</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 24,
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
    fotoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      borderColor: tema.border,
      borderWidth: 2,
      borderRadius: 20,
    },
    fotoPreview: {
      width: '100%',
      height: 280,
      borderRadius: 20,
      backgroundColor: tema.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fotoOverlay: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      backgroundColor: tema.primaria,
      padding: 8,
      borderRadius: 20,
      marginBottom: -3,
    },
    input: {
      backgroundColor: tema.inputFundo,
      padding: 14,
      borderRadius: 12,
      marginBottom: 12,
      color: tema.text,
      borderColor: tema.border,
      borderWidth: 2,
      flex: 1,
    },
    botao: {
      backgroundColor: tema.secondary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 50,
      alignItems: 'center',
      marginTop: 10,
    },
    textoBotao: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
}
