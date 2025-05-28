# Adotely

**Adotely** é um aplicativo mobile desenvolvido com o objetivo de facilitar e modernizar o processo de adoção responsável de animais de estimação, conectando abrigos e adotantes de maneira rápida, segura e intuitiva.

## Funcionalidades

- Autenticação segura com Firebase Auth (Login, Cadastro, Trocar Senha)
- Sistema de swipe estilo Tinder para curtir ou rejeitar pets
- Filtros por idade, doenças (FIV, FeLV, PIF), cor/pelagem e localização
- Cadastro, edição e gerenciamento de pets para abrigos
- Tela de favoritos organizada por categorias: curtidos, match, rejeitados
- Sistema de chat em tempo real com notificação via Firebase
- Visualização de perfil do abrigo e detalhes completos do pet
- Suporte completo a tema claro e escuro com detecção automática
- Tela de onboarding exibida apenas no primeiro acesso
- Aplicação modular com integração ao Firestore e Firebase Storage

## Tecnologias Utilizadas

- [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/)
- [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage, FCM)
- [React Navigation](https://reactnavigation.org/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Context API](https://reactjs.org/docs/context.html) para temas
- [Framer Motion](https://www.framer.com/motion/) (na versão web)
- [Tailwind CSS](https://tailwindcss.com/) (versão web com Expo Router)

## Estrutura de Pastas
adotely/
├── App.js
├── app.json
├── babel.config.js
├── google-services.json
├── metro.config.js
├── package-lock.json
├── package.json
├── expo
├──── devices.json
├──── README.md
├── assets/
├── components/
├──── SwipeCard.js
├──── SwipeCardStack.js
├── constants/
├──── colors.js
├── contexts/
├──── ThemeContext.js
├── firebase/
├──── config.js
├── navigation/
├──── AbrigoTabNavigator.js
├──── AdotanteTabNavigator.js
├──── TabNavigator.js
├── screens/
├──── CadastroPetScreen.js
├──── ChatScreen.js
├──── ConfiguracoesScreen.js
├──── ConversationsScreen.js
├──── EditarPerfil.js
├──── FavoritesScreen.js
├──── HomeScreen.js
├──── Interessados.js
├──── LoginScreen.js
├──── MeusPetsScreen.js
├──── Onboarding.js
├──── PerfilAdotante.js
├──── PerfilScreen.js
├──── PetDetalhes.js
├──── RegisterScreen.js
├──── TrocarSenha.js
├── node_modules
├── utils/
└──── gerarChatID.js

## Instalação e Execução

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/adotely.git
cd adotely

2. **Instale as dependências:**

npm install

2. **Inicie o app:**

npx expo start

Use o Expo Go para rodar o app no seu celular, ou emuladores Android/iOS no computador
