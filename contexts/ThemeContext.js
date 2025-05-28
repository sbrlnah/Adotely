import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cores } from '../constants/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [modoEscuro, setModoEscuro] = useState(false);

  useEffect(() => {
    const carregarTema = async () => {
      try {
        const valorSalvo = await AsyncStorage.getItem('modoEscuro');
        if (valorSalvo !== null) {
          setModoEscuro(valorSalvo === 'true');
        } else {
          const corSistema = Appearance.getColorScheme();
          setModoEscuro(corSistema === 'dark');
        }
      } catch (error) {
        console.log('Erro ao carregar tema:', error);
      }
    };

    carregarTema();
  }, []);

  const alternarTema = async () => {
    const novoTema = !modoEscuro;
    setModoEscuro(novoTema);
    await AsyncStorage.setItem('modoEscuro', novoTema.toString());
  };

  const temaAtual = modoEscuro ? 'escuro' : 'claro';
  const tema = cores[temaAtual];

  return (
    <ThemeContext.Provider
      value={{
        tema,          
        temaAtual,     
        modoEscuro,
        alternarTema,
        cores,         
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
