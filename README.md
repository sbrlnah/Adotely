# Adotely

**Adotely** é um aplicativo mobile desenvolvido com o objetivo de facilitar e modernizar o processo de adoção responsável de animais de estimação, conectando abrigos e adotantes de maneira rápida, segura e intuitiva.

---

## Funcionalidades

- Autenticação segura com Firebase Auth (Login, Cadastro, Trocar Senha)
- Sistema de swipe estilo Tinder para curtir ou rejeitar pets
- Filtros por idade, doenças (FIV, FeLV, PIF), cor/pelagem e localização
- Cadastro, edição e gerenciamento de pets para abrigos
- Tela de favoritos com categorias: curtidos, match, rejeitados
- Sistema de chat em tempo real com notificações via Firebase
- Visualização de perfil do abrigo e detalhes completos do pet
- Suporte a tema claro e escuro com detecção automática
- Tela de onboarding exibida apenas no primeiro acesso
- Aplicação modular com integração ao Firestore e Firebase Storage

---

## Tecnologias Utilizadas

- [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/)
- [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage, FCM)
- [React Navigation](https://reactnavigation.org/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Context API](https://reactjs.org/docs/context.html) para gerenciamento de temas
- [Framer Motion](https://www.framer.com/motion/) (versão web)
- [Tailwind CSS](https://tailwindcss.com/) (versão web com Expo Router)

---

## Instalação e Execução

1. Clone o repositório

Abra o terminal e execute:

git clone https://github.com/sbrlnah/adotely.git
cd adotely

2. Instale as dependências

Execute:

npm install

3. Inicie o aplicativo

Para rodar o app com Expo, use:

npx expo start

Você verá um QR Code no terminal ou navegador. Use o aplicativo Expo Go no seu celular para escanear o código e testar o app. Também é possível rodar em emuladores Android ou iOS, se estiver configurado.

---

## Estrutura de Pastas

```plaintext
adotely/
├── App.js
├── app.json
├── babel.config.js
├── google-services.json
├── metro.config.js
├── package-lock.json
├── package.json
├── .expo/
│   ├── devices.json
│   └── README.md
├── assets/
├── components/
│   ├── SwipeCard.js
│   └── SwipeCardStack.js
├── constants/
│   └── colors.js
├── contexts/
│   └── ThemeContext.js
├── firebase/
│   └── config.js
├── navigation/
│   ├── AbrigoTabNavigator.js
│   ├── AdotanteTabNavigator.js
│   └── TabNavigator.js
├── screens/
│   ├── CadastroPetScreen.js
│   ├── ChatScreen.js
│   ├── ConfiguracoesScreen.js
│   ├── ConversationsScreen.js
│   ├── EditarPerfil.js
│   ├── FavoritesScreen.js
│   ├── HomeScreen.js
│   ├── Interessados.js
│   ├── LoginScreen.js
│   ├── MeusPetsScreen.js
│   ├── Onboarding.js
│   ├── PerfilAdotante.js
│   ├── PerfilScreen.js
│   ├── PetDetalhes.js
│   ├── RegisterScreen.js
│   └── TrocarSenha.js
├── utils/
│   └── gerarChatID.js
└── node_modules/
