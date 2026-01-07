/**
 * Hook personalizado para obter informações do usuário atual.
 * Busca dados do usuário logado via API.
 */

import { useState, useEffect } from 'react';
// Importa hooks do React
import http from '../api/http';
// Cliente HTTP configurado
import type { CurrentUser } from '../interfaces/CurrentUser';
// Tipo para usuário atual

// Hook para obter usuário atual
export function useCurrentUser() {
  // Estado para dados do usuário
  const [user, setUser] = useState<CurrentUser | null>(null);
  // Estado de carregamento
  const [loading, setLoading] = useState<boolean>(true);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar usuário na montagem
  useEffect(() => {
    // Função assíncrona para buscar usuário
    const fetchUser = async () => {
      try {
        // Inicia carregamento
        setLoading(true);
        // Faz requisição GET
        const response = await http.get('/managementauth/me');
        // Define usuário
        setUser(response.data);
        // Limpa erro
        setError(null);
      } catch (err) {
        // Log erro
        console.error('Failed to load user info', err);
        // Define erro
        setError('Erro ao carregar informações do usuário');
        // Limpa usuário
        setUser(null);
      } finally {
        // Finaliza carregamento
        setLoading(false);
      }
    };

    // Obtém token do localStorage
    const token = localStorage.getItem('access_token');
    // Se há token, busca usuário
    if (token) {
      fetchUser();
    } else {
      // Sem token, finaliza carregamento
      setLoading(false);
    }
  }, []);

  // Retorna estado
  return { user, loading, error };
}