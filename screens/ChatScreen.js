import React, { useEffect, useState, useMemo, useLayoutEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { ref as rtdbRef, onValue, set, push, remove } from 'firebase/database';
import { auth, db, rtdb } from '../firebase/config';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ChatScreen({ route, navigation }) {
  const { outroUsuario } = route.params;
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState([]);
  const [imagemUri, setImagemUri] = useState(null);
  const [podeConversar, setPodeConversar] = useState(false);
  const [digitando, setDigitando] = useState(false);
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);
  const flatListRef = useRef(null);
  const digitandoTimeoutRef = useRef(null);
  const debounceRef = useRef(null);

  const chatId = [auth.currentUser.uid, outroUsuario.uid].sort().join('-');

  useEffect(() => {
    const mensagensRef = rtdbRef(rtdb, `chats/${chatId}`);
    const unsubscribe = onValue(mensagensRef, (snapshot) => {
      const lista = [];
      snapshot.forEach((child) => {
        const item = child.val();
        item.id = child.key;
        lista.push(item);
      });
      setMensagens(lista.sort((a, b) => a.timestamp - b.timestamp));
    });
    return () => unsubscribe();
  }, []);

  // 🔓 Permitir sempre conversar, sem restrição de match
  useEffect(() => {
    setPodeConversar(true);
  }, []);

  useEffect(() => {
    const digitandoRef = rtdbRef(rtdb, `statusDigitando/${chatId}/${outroUsuario.uid}`);
    const unsubscribe = onValue(digitandoRef, (snap) => {
      setDigitando(snap.val() === true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const statusRef = rtdbRef(rtdb, `statusDigitando/${chatId}/${auth.currentUser.uid}`);

    if (mensagem.trim().length > 0) {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        set(statusRef, true);

        if (digitandoTimeoutRef.current) clearTimeout(digitandoTimeoutRef.current);
        digitandoTimeoutRef.current = setTimeout(() => remove(statusRef), 3000);
      }, 300);
    } else {
      remove(statusRef);
      if (digitandoTimeoutRef.current) clearTimeout(digitandoTimeoutRef.current);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [mensagem]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: outroUsuario.nome || 'Chat',
      headerStyle: { backgroundColor: '#5F6DF5' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, outroUsuario]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [mensagens]);

  const enviarMensagem = () => {
    const textoSeguro = mensagem?.toString().trim() || '';
    if (!textoSeguro && !imagemUri) return;

    const novaMensagem = {
      texto: textoSeguro,
      de: auth.currentUser.uid,
      para: outroUsuario.uid,
      timestamp: Date.now(),
      lido: false,
      imagem: imagemUri || null,
    };

    push(rtdbRef(rtdb, `chats/${chatId}`), novaMensagem);
    setMensagem('');
    setImagemUri(null);
  };

  const abrirImagem = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
    if (!res.canceled && res.assets[0]) {
      setImagemUri(res.assets[0].uri);
    }
  };

  const formatarHora = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView style={estilos.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FlatList
        ref={flatListRef}
        data={mensagens}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
        <View style={item.de === auth.currentUser.uid ? estilos.enviada : estilos.recebida}>
          {item.imagem && <Image source={{ uri: item.imagem }} style={estilos.imagemPreview} />}
          <Text
          style={[
            estilos.texto,
            {fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', 
              color: item.de === auth.currentUser.uid ? '#1C1B1F' : '#FFFCFA' } ]} >
              {item.texto ? item.texto.toString() : ''}
              </Text>
              <Text style={[ estilos.hora, { color: item.de === auth.currentUser.uid ? '#1C1B1F' : '#FFFCFA' } ]} >
              {formatarHora(item.timestamp)}
              </Text>
              </View>
        )}
        contentContainerStyle={{ paddingBottom: 10 }}
      />

      {digitando && (
        <Text style={{ color: tema.textSecondary, fontStyle: 'italic', marginBottom: 4 }}>
          {outroUsuario.nome || 'O usuário'} está digitando...
        </Text>
      )}

      {podeConversar ? (
        <>
          {imagemUri && (
            <View style={estilos.previewContainer}>
              <Image source={{ uri: imagemUri }} style={estilos.previewImagem} />
              <TouchableOpacity onPress={() => setImagemUri(null)} style={estilos.botaoRemoverImagem}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={estilos.inputContainer}>
            <TouchableOpacity onPress={abrirImagem} style={estilos.icon}>
              <MaterialIcons name="image" size={34} color={tema.secondary} />
            </TouchableOpacity>
            <TextInput
              style={estilos.input}
              value={mensagem}
              onChangeText={(text) => {
                const textoSeguro = text
                  .normalize('NFC')
                  .replace(/[^\x00-\x7F\u00A0-\uFFFF]/g, '');
                setMensagem(textoSeguro);
              }}
              placeholder="Digite uma mensagem"
              placeholderTextColor={tema.textComplimentary}
              multiline
            />
            <TouchableOpacity onPress={enviarMensagem} style={estilos.botao}>
              <MaterialIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={{ textAlign: 'center', color: tema.textSecondary, paddingVertical: 12 }}>
          O chat será habilitado após o match ser confirmado.
        </Text>
      )}
    </KeyboardAvoidingView>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.background,
      padding: 10,
      marginTop: 30,
    },
    enviada: {
      alignSelf: 'flex-end',
      backgroundColor: tema.primary,
      marginVertical: 4,
      padding: 12,
      borderRadius: 20,
      maxWidth: '80%',
    },
    recebida: {
      alignSelf: 'flex-start',
      backgroundColor: tema.secondary,
      marginVertical: 4,
      padding: 12,
      borderRadius: 20,
      maxWidth: '80%',
    },
    texto: {
      color: tema.text,
    },
    hora: {
      fontSize: 11,
      color: tema.text,
      textAlign: 'right',
      marginTop: 4,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: tema.border,
      paddingTop: 6,
      gap: 6,
    },
    input: {
      flex: 1,
      backgroundColor: tema.card,
      padding: 10,
      borderRadius: 25,
      color: tema.text,
      borderWidth: 1,
      borderColor: tema.border,
    },
    botao: {
      backgroundColor: tema.secondary,
      padding: 10,
      margin: 5,
      borderRadius: 25,
    },
    icon: {
      paddingLeft: 6,
    },
    imagemPreview: {
      width: 180,
      height: 180,
      borderRadius: 12,
      marginBottom: 6,
    },
    previewContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8,
      backgroundColor: tema.primary,
      padding: 8,
      borderRadius: 12,
      position: 'relative',
    },
    previewImagem: {
      width: 80,
      height: 80,
      borderRadius: 10,
      marginRight: 10,
    },
    botaoRemoverImagem: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: tema.secondary,
      borderRadius: 20,
      padding: 2,
    },
  });
}
