import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  addDoc, collection, doc, getDoc, query, where, getDocs,
} from 'firebase/firestore';
import { db, auth, storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const opcoesDoencas = ['FIV', 'FeLV', 'PIF'];

export default function CadastroPetScreen({ navigation }) {
  const { tema } = useTheme();
  const estilos = useMemo(() => criarEstilos(tema), [tema]);
  const usuarioId = auth.currentUser?.uid;

  const [foto, setFoto] = useState(null);
  const [nome, setNome] = useState('');
  const [idadeValor, setIdadeValor] = useState('');
  const [idadeUnidade, setIdadeUnidade] = useState('anos');
  const [raca, setRaca] = useState('');
  const [sexo, setSexo] = useState('');
  const [pelagem, setPelagem] = useState('');
  const [descricao, setDescricao] = useState('');
  const [comportamento, setComportamento] = useState('');
  const [doencasSelecionadas, setDoencasSelecionadas] = useState([]);
  const [outraDoenca, setOutraDoenca] = useState('');
  const [erros, setErros] = useState({});

  const escolherFoto = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!resultado.canceled && resultado.assets[0]) {
      setFoto(resultado.assets[0].uri);
      setErros((e) => ({ ...e, foto: false }));
    }
  };

  const alternarDoenca = (doenca) => {
    setDoencasSelecionadas((atual) =>
      atual.includes(doenca)
        ? atual.filter((d) => d !== doenca)
        : [...atual, doenca]
    );
  };

  const cadastrarPet = async () => {
    const idadeFormatada = `${idadeValor.trim()} ${idadeUnidade}`;
    const novosErros = {};
    if (!nome.trim()) novosErros.nome = true;
    if (!raca.trim()) novosErros.raca = true;
    if (!pelagem.trim()) novosErros.pelagem = true;
    if (!idadeValor.trim()) novosErros.idade = true;
    if (!sexo.trim()) novosErros.sexo = true;
    if (!comportamento.trim()) novosErros.comportamento = true;
    if (!descricao.trim()) novosErros.descricao = true;
    if (!foto) novosErros.foto = true;

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const q = query(
        collection(db, 'pets'),
        where('nome_lower', '==', nome.trim().toLowerCase()),
        where('raca_lower', '==', raca.trim().toLowerCase()),
        where('idade', '==', idadeFormatada),
        where('abrigoId', '==', usuarioId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        Alert.alert('Pet já cadastrado', 'Você já cadastrou um pet com o mesmo nome, raça e idade.');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Não foi possível acessar sua localização.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const localizacao = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      const usuarioRef = doc(db, 'usuarios', usuarioId);
      const usuarioSnap = await getDoc(usuarioRef);
      const nomeAbrigo = usuarioSnap.exists() ? usuarioSnap.data().nome : 'Abrigo desconhecido';

      const blob = await fetch(foto).then((r) => r.blob());
      const nomeImagem = `${usuarioId}_${Date.now()}.jpg`;
      const imagemRef = ref(storage, `pets/${nomeImagem}`);
      await uploadBytes(imagemRef, blob);
      const urlImagem = await getDownloadURL(imagemRef);

      const dadosPet = {
        nome,
        nome_lower: nome.trim().toLowerCase(),
        raca,
        raca_lower: raca.trim().toLowerCase(),
        idade: idadeFormatada,
        sexo,
        pelagem,
        descricao,
        comportamento,
        foto: urlImagem,
        doencas: [...doencasSelecionadas, ...(outraDoenca ? [outraDoenca] : [])],
        criadoPor: usuarioId,
        nomeAbrigo,
        abrigoId: usuarioId,
        localizacao,
        adotado: false,
      };

      await addDoc(collection(db, 'pets'), dadosPet);
      Alert.alert('Sucesso', 'Pet cadastrado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.log('Erro ao salvar pet:', error);
      Alert.alert('Erro', 'Houve um problema ao cadastrar o pet.');
    }
  };

  return (
    <KeyboardAvoidingView
     style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
       >
         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
           <ScrollView contentContainerStyle={estilos.container}>
             <Text style={estilos.titulo}>Cadastrar Pet</Text>

      <TouchableOpacity onPress={escolherFoto} style={[estilos.fotoContainer, erros.foto && estilos.erroBorda]}>
        {foto ? (
          <Image source={{ uri: foto }} style={estilos.fotoPreview} />
        ) : (
          <View style={estilos.fotoPlaceholder}>
            <MaterialIcons name="photo-camera" size={40} color={tema.background} />
            <Text style={estilos.fotoTexto}>Selecionar foto</Text>
          </View>
        )}
      </TouchableOpacity>
      {erros.foto && <Text style={estilos.erroTexto}>Foto obrigatória</Text>}

      <TextInput
        placeholder="Nome"
        placeholderTextColor={tema.text}
        style={[estilos.input, erros.nome && estilos.erroBorda]}
        value={nome}
        onChangeText={(t) => {
          setNome(t);
          if (t.trim()) setErros((e) => ({ ...e, nome: false }));
        }}
      />
      {erros.nome && <Text style={estilos.erroTexto}>Campo obrigatório</Text>}

      <TextInput
        placeholder="Raça"
        placeholderTextColor={tema.text}
        style={[estilos.input, erros.raca && estilos.erroBorda]}
        value={raca}
        onChangeText={(t) => {
          setRaca(t);
          if (t.trim()) setErros((e) => ({ ...e, raca: false }));
        }}
      />
      {erros.raca && <Text style={estilos.erroTexto}>Campo obrigatório</Text>}

      <TextInput
        placeholder="Pelagem"
        placeholderTextColor={tema.text}
        style={[estilos.input, erros.pelagem && estilos.erroBorda]}
        value={pelagem}
        onChangeText={(t) => {
          setPelagem(t);
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
              sexo === opcao && estilos.botaoSelecionado,
            ]}
            onPress={() => {
              setSexo(opcao);
              setErros((e) => ({ ...e, sexo: false }));
            }}
          >
            <Text style={[
              estilos.textoOpcao,
              sexo === opcao && estilos.textoSelecionado,
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
          placeholderTextColor={tema.text}
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
            ]}>{unidade}</Text>
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
            <Text
              style={[
                estilos.textoOpcao,
                doencasSelecionadas.includes(item) && estilos.textoSelecionado,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Outra(s) doença(s)"
        placeholderTextColor={tema.text}
        style={estilos.input}
        value={outraDoenca}
        onChangeText={setOutraDoenca}
      />

      <TextInput
        placeholder="Comportamento"
        placeholderTextColor={tema.text}
        style={[estilos.input, erros.comportamento && estilos.erroBorda]}
        value={comportamento}
        onChangeText={(t) => {
          setComportamento(t);
          if (t.trim()) setErros((e) => ({ ...e, comportamento: false }));
        }}
      />
      {erros.comportamento && <Text style={estilos.erroTexto}>Campo obrigatório</Text>}

      <TextInput
        placeholder="Descrição"
        placeholderTextColor={tema.text}
        style={[
          estilos.input,
          { height: 100, textAlignVertical: 'top' },
          erros.descricao && estilos.erroBorda,
        ]}
        multiline
        value={descricao}
        onChangeText={(t) => {
          setDescricao(t);
          if (t.trim()) setErros((e) => ({ ...e, descricao: false }));
        }}
      />
      {erros.descricao && <Text style={estilos.erroTexto}>Campo obrigatório</Text>}

      <TouchableOpacity style={estilos.botaoCadastrar} onPress={cadastrarPet}>
        <Text style={estilos.textoBotao}>Cadastrar</Text>
        
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
      padding: 20,
    },
    titulo: {
      fontSize: 26,
      fontWeight: 'bold',
      marginVertical: 20,
      color: '#5F6DF5',
      textAlign: 'center',
    },
    fotoContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    fotoPreview: {
      width: '100%',
      height: 340,
      borderRadius: 20,
      marginBottom: 20,
      backgroundColor: '#E0E7FF',
    },
    fotoPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: 340,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: tema.border,
      backgroundColor: tema.primary,
    },
    fotoTexto: {
      marginTop: 8,
      color: tema.background,
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
      color: tema.text,
      fontWeight: '600',
      marginBottom: 8,
      marginTop: 10,
    },
    opcoes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 12,
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
      borderColor: tema.border,
      borderWidth: 1,
      borderRadius: 20,
      justifyContent: 'center',
    },
    botaoSelecionado: {
      backgroundColor: tema.secondary,
      borderColor: tema.secundary,
    },
    textoOpcao: {
      color: tema.texto,
    },
    textoSelecionado: {
      color: '#fff',
      fontWeight: 'bold',
    },
    botaoCadastrar: {
      backgroundColor: tema.secondary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    textoBotao: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    erroBorda: {
      borderColor: '#FF6B6B',
    },
    erroTexto: {
      color: '#FF6B6B',
      fontSize: 13,
      marginTop: -8,
      marginBottom: 10,
    },
  });
}
