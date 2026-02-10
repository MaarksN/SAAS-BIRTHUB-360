'use client';

import { useState } from "react";

// Hook customizado que sincroniza o estado React com o armazenamento do navegador
function useLocalStorage<T>(key: string, initialValue: T) {
  // 1. Inicialização Preguiçosa (Lazy Initialization):
  // A função dentro do useState só roda na primeira renderização, evitando
  // leituras desnecessárias e custosas no localStorage a cada render.
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // Se existir, converte de JSON string para Objeto JS.
      // Se não, usa o valor inicial fornecido.
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Erro crítico ao ler do localStorage:", error);
      return initialValue;
    }
  });

  // 2. Wrapper de Atualização:
  // Esta função substitui o setState padrão. Ela atualiza a memória (React)
  // E o disco (Navegador) simultaneamente.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Suporte para updates funcionais: setState(prev => prev + 1)
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
    }
  };

  return [storedValue, setValue] as const;
}

export default useLocalStorage;
