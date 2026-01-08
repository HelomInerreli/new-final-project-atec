import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { setAuthToken, useAuth } from '../api/auth';
import AccountRelinkModal from './AccountRelinkModal';
import Home from '../pages/Home/Home';

/**
 * Componente para processar callbacks de autenticação OAuth
 * Gere login, registo e religamento de contas do Google/Facebook
 * Processa parâmetros da URL e redireciona conforme o tipo de operação
 * @returns Componente JSX com página inicial e modal de religamento
 */
const AuthCallback: React.FC = () => {
  /**
   * Parâmetros de pesquisa da URL
   * Contém informações sobre o tipo de autenticação e dados do utilizador
   */
  const [searchParams] = useSearchParams();

  /**
   * Hook de navegação para redirecionar entre páginas
   */
  const navigate = useNavigate();

  /**
   * Hook de autenticação com função de login
   */
  const { login } = useAuth();

  /**
   * Estado para controlar a visibilidade do modal de religamento de conta
   * Tipo: boolean
   * Inicia como false (modal fechado)
   */
  const [showRelinkModal, setShowRelinkModal] = useState(false);

  /**
   * Estado para indicar se o processo de religamento está em andamento
   * Tipo: boolean
   * Inicia como false
   */
  const [relinkLoading, setRelinkLoading] = useState(false);

  /**
   * Efeito para processar o callback de autenticação
   * Identifica o tipo de operação (login, registo, religamento) e executa a ação apropriada
   * Executa ao montar o componente ou quando os parâmetros mudam
   */
  useEffect(() => {
    const type = searchParams.get('type');
    const error = searchParams.get('error');
    const token = searchParams.get('token');

    console.log('=== AUTH CALLBACK DEBUG ===');
    console.log('Type:', type);
    console.log('Error:', error);
    console.log('Token:', token);
    console.log('All params:', Object.fromEntries(searchParams));

    if (error) {
      console.error('Auth error:', error);
      navigate('/register?error=Authentication failed');
      return;
    }

    if (type === 'login' && token) {
      console.log('Login flow');
      setAuthToken(token);
      //Login route after login with OAuth(Google/Facebook)
      navigate('/my-services');
    } else if (type === 'register') {
      console.log('Register flow');
      const provider = searchParams.get('provider') || 'google';
      const authData = {
        token: searchParams.get('token') || '',
        email: searchParams.get('email') || '',
        name: searchParams.get('name') || ''
      };
      
      localStorage.setItem(`${provider}AuthData`, JSON.stringify(authData));
      navigate(`/register?${provider}=true`);
    } else if (type === 'relink') {
      console.log('Relink flow - showing modal');
      setShowRelinkModal(true);
    } else {
      console.log('Unknown type or missing params');
    }
  }, [searchParams, navigate, login]);

  /**
   * Função para confirmar o religamento de uma conta OAuth a uma conta existente
   * Envia pedido ao servidor, guarda o token de autenticação e redireciona para o perfil
   * Recarrega a página após sucesso para atualizar o estado de autenticação
   */
  const handleConfirmRelink = async () => {
    try {
      setRelinkLoading(true);
      
      const provider = searchParams.get('provider');
      const providerId = searchParams.get(provider === 'google' ? 'google_id' : 'facebook_id');
      const existingUserId = searchParams.get('existing_user_id');
      
      const response = await fetch('http://localhost:8000/api/v1/customersauth/relink/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          user_id: existingUserId,
          provider_id: providerId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao religar conta');
      }

      const data = await response.json();
      
      // Login with the new token
      setAuthToken(data.access_token);
      
      // Close modal and redirect
      setShowRelinkModal(false);
      
      // Reload page after successful login
        setTimeout(() => {
          window.location.reload();
        }, 10);
      navigate('/profile?relinked=success');
      
    } catch (error: any) {
        throw error;
    } finally {
      setRelinkLoading(false);
    }
  };

  /**
   * Função para fechar o modal de religamento e voltar à página inicial
   * Cancela o processo de religamento
   */
  const handleCloseRelink = () => {
    setShowRelinkModal(false);
    navigate('/');
  };

  /**
   * Provedor OAuth (Google ou Facebook) extraído dos parâmetros da URL
   */
  const provider = searchParams.get('provider') as 'google' | 'facebook';

  /**
   * Dados do utilizador do provedor OAuth
   * Contém nome e email da conta Google/Facebook
   */
  const providerUserData = {
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || ''
  };

  /**
   * Dados do utilizador existente na base de dados
   * Contém nome e email da conta já registada
   */
  const existingUserData = {
    name: searchParams.get('existing_user_name') || '',
    email: searchParams.get('existing_user_email') || ''
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Home />

      {/* Relink Modal */}
      <AccountRelinkModal
        isOpen={showRelinkModal}
        onClose={handleCloseRelink}
        onConfirm={handleConfirmRelink}
        provider={provider}
        providerUserData={providerUserData}
        existingUserData={existingUserData}
        loading={relinkLoading}
      />
    </div>
  );
};

export default AuthCallback;