import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  Alert, ScrollView, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { auth, db, storage } from '../firebase/config';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const opcoesDoencas = ['FIV', 'FeLV', 'PIF'];

export default function EditarPet() {
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);
  const route = useRoute();
  const navigation = useNavigation();

  const [pet, setPet] = useState(null);
  const [novaFoto, setNovaFoto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erros, setErros] = useState({});
  const [idadeValor, setIdadeValor] = useState('');
  const [idadeUnidade, setIdadeUnidade] = useState('anos');
  const [doencasSelecionadas, setDoencasSelecionadas] = useState([]);
  const [outraDoenca, setOutraDoenca] = useState('');

  useEffect(() => {
    const carregarPet = async () => {
      try {
        const refPet = doc(db, 'pets', route.params.id);
        const snap = await getDoc(refPet);

        if (snap.exists()) {
          const dados = snap.data();
          if (dados.criadoPor !== auth.currentUser.uid) {
            Alert.alert('Acesso negado', 'Você não pode editar este pet.');
            navigation.navigate('MainTabs', { screen: 'Meus Pets' });
            return;
          }

          setPet(dados);
          const [valor, unidade] = dados.idade?.split(' ') || ['', 'anos'];
          setIdadeValor(valor);
          setIdadeUnidade(unidade);
          setDoencasSelecionadas(dados.doencas?.filter(d => opcoesDoencas.includes(d)) || []);
          setOutraDoenca(dados.doencas?.find(d => !opcoesDoencas.includes(d)) || '');
        } else {
          Alert.alert('Erro', 'Pet não encontrado.');
          navigation.goBack();
        }
      } catch (err) {
        Alert.alert('Erro', 'Falha ao carregar dados.');
        navigation.navigate('MainTabs', { screen: 'Meus Pets' });
      } finally {
        setCarregando(false);
      }
    };

    carregarPet();
  }, []);

  const alternarDoenca = (doenca) => {
    setDoencasSelecionadas((atual) =>
      atual.includes(doenca)
        ? atual.filter((d) => d !== doenca)
        : [...atual, doenca]
    );
  };

  const selecionarImagem = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!resultado.canceled && resultado.assets[0]) {
      setNovaFoto(resultado.assets[0].uri);
    }
  };

  const salvarEdicao = async () => {
    const novosErros = {};

    if (!pet.nome?.trim()) novosErros.nome = true;
    if (!pet.raca?.trim()) novosErros.raca = true;
    if (!idadeValor?.trim()) novosErros.idade = true;
    if (!pet.pelagem?.trim()) novosErros.pelagem = true;
    if (!pet.descricao?.trim()) novosErros.descricao = true;
    if (!pet.comportamento?.trim()) novosErros.comportamento = true;
    if (!pet.sexo?.trim()) novosErros.sexo = true;

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setErros({});

    try {
      let urlImagem = pet.foto;

      if (novaFoto) {
        const blob = await fetch(novaFoto).then((r) => r.blob());
        const nomeImagem = `${route.params.id}_${Date.now()}.jpg`;
        const imagemRef = ref(storage, `pets/${nomeImagem}`);
        await uploadBytes(imagemRef, blob);
        urlImagem = await getDownloadURL(imagemRef);
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Não foi possível acessar a localização.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const novaLocalizacao = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      const idadeFormatada = `${idadeValor.trim()} ${idadeUnidade}`;

      await updateDoc(doc(db, 'pets', route.params.id), {
        ...pet,
        idade: idadeFormatada,
        foto: urlImagem,
        localizacao: novaLocalizacao,
        doencas: [...doencasSelecionadas, ...(outraDoenca ? [outraDoenca] : [])],
      });

      Alert.alert('Sucesso', 'Pet atualizado com sucesso!');
      navigation.navigate('MainTabs', { screen: 'Meus Pets' });
    } catch (err) {
      console.log('Erro ao salvar:', err);
      Alert.alert('Erro ao salvar', 'Tente novamente.');
    }
  };

  if (carregando || !pet) {
    return (
      <View style={estilos.loading}>
        <ActivityIndicator size="large" color={tema.primaria} />
        <Text style={estilos.texto}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={estilos.container}>
      <Text style={estilos.titulo}>Editar Pet</Text>

      <TouchableOpacity onPress={selecionarImagem} style={estilos.fotoContainer}>
        <Image source={{ uri: novaFoto || pet.foto }} style={estilos.fotoPreview} />
        <View style={estilos.fotoOverlay}>
          <MaterialIcons name="photo-camera" size={24} color={tema.background} />
        </View>
      </TouchableOpacity>

      <TextInput
        placeholder="Nome"
        placeholderTextColor={tema.textComplimentary}
        style={[estilos.input, erros.nome && estilos.erroBorda]}
        value={pet.nome}
        onChangeText={(t) => {
          setPet({ ...pet, nome: t });
          if (t.trim()) setErros((e) => ({ ...e, nome: false }));
        }}
      />
      {erros.nome && <Text style={estilos.erroTexto}>Campo obrigatório</Text>}

      <TextInput
        placeholder="Raça"
        placeholderTextColor={tema.textComplimentary}
        style={[estilos.input, erros.raca && estilos.erroBorda]}
        value={pet.raca}
        onChangeText={(t) => {
          setPet({ ...pet, raca: t });
          if (t.trim()) setErros((e) => ({ ...e, raca: false }));
        }}
      />
      {erros.raca && <Text style={estilos.erroTexto}>Campo obrigatório</Text>}

      <TextInput
        placeholder="Pelagem"
        placeholderTextColor={tema.textComplimentary}
        style={[estilos.input, erros.pelagem && estilos.erroBorda]}
        value={pet.pelagem}
        onChangeText={(t) => {
          setPet({ ...pet, pelagem: t });
          if (t.trim()) setErros((e) => ({ ...e, pelagem: false }));
        }}
      />
      {erros.pelagem && <Text style={estilos.erroTexto}>Campo obrigatório</Text>}

      <Text style={estilos.subtitulo}>Sexo</Text>
      <View style={estilos.opcoes}>
        {['Macho', 'Fêmea'].map((opcao) => (
          <TouchableOpacity
            key={opcao}
            style={[
              estilos.botaoOpcao,
              pet.sexo === opcao && estilos.botaoSelecionado,
            ]}
            onPress={() => {
              setPet({ ...pet, sexo: opcao });
              setErros((e) => ({ ...e, sexo: false }));
            }}
          >
            <Text style={[
              estilos.textoOpcao,
              pet.sexo === opcao && estilos.textoSelecionado,
            ]}>{opcao}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {erros.sexo && <Text style={estilos.erroTexto}>Campo obrigatório</Text>}

      <Text style={estilos.subtitulo}>Idade</Text>
      <View style={estilos.idadeLinha}>
        <TextInput
          placeholder="Número"
          keyboardType="numeric"
          placeholderTextColor={tema.textComplimentary}
          style={[estilos.input, { flex: 1 }, erros.idade && estilos.erroBorda]}
          value={idadeValor}
          onChangeText={(t) => {
            setIdadeValor(t);
            if (t.trim()) setErros((e) => ({ ...e, idade: false }));
          }}
        />
        {['meses', 'anos'].map((unidade) => (
          <TouchableOpacity
            key={unidade}
            style={[
              estilos.botaoOpcao,
              idadeUnidade === unidade && estilos.botaoSelecionado,
            ]}
            onPress={() => setIdadeUnidade(unidade)}
          >
            <Text style={[
              estilos.textoOpcao,
              idadeUnidade === unidade && estilos.textoSelecionado,
            ]}>
              {unidade}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {erros.idade && <Text style={estilos.erroTexto}>Campo obrigatório</Text>}

      <Text style={estilos.subtitulo}>Doenças</Text>
      <View style={estilos.opcoes}>
        {opcoesDoencas.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              estilos.botaoOpcao,
              doencasSelecionadas.includes(item) && estilos.botaoSelecionado,
            ]}
            onPress={() => alternarDoenca(item)}
          >
            <Text style={[
              estilos.textoOpcao,
              doencasSelecionadas.includes(item) && estilos.textoSelecionado,
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Outra(s) doença(s)"
        placeholderTextColor={tema.textComplimentary}
        style={estilos.input}
        value={outraDoenca}
        onChangeText={setOutraDoenca}
      />

      <TextInput
        placeholder="Comportamento"
        placeholderTextColor={tema.textComplimentary}
        style={[estilos.input, erros.comportamento && estilos.erroBorda]}
        value={pet.comportamento}
        onChangeText={(t) => {
          setPet({ ...pet, comportamento: t });
          if (t.trim()) setErros((e) => ({ ...e, comportamento: false }));
        }}
      />
      {erros.comportamento && <Text style={estilos.erroTexto}>Campo obrigatório</Text>}

      <TextInput
        placeholder="Descrição"
        placeholderTextColor={tema.textComplimentary}
        style={[
          estilos.input,
          { height: 100, textAlignVertical: 'top' },
          erros.descricao && estilos.erroBorda,
        ]}
        multiline
        value={pet.descricao}
        onChangeText={(t) => {
          setPet({ ...pet, descricao: t });
          if (t.trim()) setErros((e) => ({ ...e, descricao: false }));
        }}
      />
      {erros.descricao && <Text style={estilos.erroTexto}>Campo obrigatório</Text>}

      <TouchableOpacity style={estilos.botaoSalvar} onPress={salvarEdicao}>
        <Text style={estilos.textoBotao}>Salvar Alterações</Text>
      </TouchableOpacity>
    </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function criarEstilos(tema) {
  return StyleSheet.create({
    container: { 
      backgroundColor: tema.background, 
      padding: 20 
    },
    loading: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: tema.background 
    },
    texto: {
      color: tema.text, 
      marginTop: 10 
    },
    titulo: {
      fontSize: 26, 
      fontWeight: 'bold', 
      marginVertical: 20, 
      color: '#5F6DF5', 
      textAlign: 'center' 
    },
    input: {
      backgroundColor: tema.card,
      padding: 14,
      borderRadius: 10,
      color: tema.text,
      borderWidth: 1,
      borderColor: tema.border,
      marginBottom: 12,
    },
    subtitulo: {
      fontWeight: '700',
      marginBottom: 8,
      color: tema.secondary,
    },
    opcoes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 16,
    },
    idadeLinha: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
      alignItems: 'center',
    },
    botaoOpcao: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      height: 40,
      backgroundColor: tema.primary,
      borderColor: '#C7D7FF',
      borderWidth: 1,
      borderRadius: 20,
      justifyContent: 'center',
    },
    botaoSelecionado: {
      backgroundColor: '#5F6DF5',
      borderColor: '#5F6DF5',
    },
    textoOpcao: { 
      color: 
      tema.texto 
    },
    textoSelecionado: { 
      color: '#fff', 
      fontWeight: 'bold' 
    },
    fotoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      borderColor: tema.border,
      borderWidth: 2,
      borderRadius: 20,
      maxHeight: 320,
      overflow: 'hidden',
    },
    fotoPreview: {
      width: '100%',
      height: undefined,
      aspectRatio: 1.5,
      maxHeight: 320,
      borderRadius: 20,
      backgroundColor: '#E0E7FF',
    },
    fotoOverlay: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      backgroundColor: tema.primaria,
      padding: 8,
      borderRadius: 20,
    },
    botaoSalvar: {
      backgroundColor: '#5F6DF5',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
    },
    textoBotao: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    erroBorda: { 
      borderColor: '#FF6B6B' 
    },
    erroTexto: { 
      color: '#FF6B6B', 
      marginBottom: 10, 
      marginTop: -8, 
      fontSize: 13 
    },
  });
}
