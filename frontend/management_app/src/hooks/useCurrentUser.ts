import { useState, useEffect } from 'react';
import http from '../api/http';
import type { CurrentUser } from '../interfaces/CurrentUser';

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await http.get('/managementauth/me');
        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load user info', err);
        setError('Erro ao carregar informações do usuário');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  return { user, loading, error };
}