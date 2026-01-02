import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { 
  registerWithCredentials, 
  registerWithGoogle, 
  registerWithFacebook,
  checkEmailExists,
  type RegisterData, 
  type GoogleAuthData, 
  type FacebookAuthData, 
  useAuth 
} from '../api/auth';
import RegisterCustomerInfoModal from './RegisterCustomerInfoModal';
import LoginModal from './LoginModal';

/**
 * Componente de registo de novos utilizadores
 * Permite registo através de email/password, Google OAuth ou Facebook OAuth
 * Após preenchimento inicial, abre modal para informações adicionais do cliente
 * Valida existência de email antes de prosseguir com o registo
 * @returns Componente JSX do formulário de registo
 */
const Register: React.FC = () => {
  /**
   * Estado para o email do utilizador
   * Tipo: string
   * Inicial: string vazia
   */
  const [email, setEmail] = useState('');
  
  /**
   * Estado para a palavra-passe
   * Tipo: string
   * Inicial: string vazia
   */
  const [password, setPassword] = useState('');
  
  /**
   * Estado para confirmação da palavra-passe
   * Tipo: string
   * Inicial: string vazia
   */
  const [confirmPassword, setConfirmPassword] = useState('');
  
  /**
   * Estado para controlar visibilidade do modal de informações adicionais
   * Tipo: boolean
   * Inicial: false
   */
  const [showModal, setShowModal] = useState(false);
  
  /**
   * Estado para armazenar dados de autenticação do Google
   * Tipo: GoogleAuthData | null
   * Inicial: null
   */
  const [googleData, setGoogleData] = useState<GoogleAuthData | null>(null);
  
  /**
   * Estado para armazenar dados de autenticação do Facebook
   * Tipo: FacebookAuthData | null
   * Inicial: null
   */
  const [facebookData, setFacebookData] = useState<FacebookAuthData | null>(null);
  
  /**
   * Estado de carregamento durante processos assíncronos
   * Tipo: boolean
   * Inicial: false
   */
  const [loading, setLoading] = useState(false);
  
  /**
   * Estado para mensagens de erro
   * Tipo: string
   * Inicial: string vazia
   */
  const [error, setError] = useState('');
  
  /**
   * Estado para controlar visibilidade do modal de login
   * Tipo: boolean
   * Inicial: false
   */
  const [showLoginModal, setShowLoginModal] = useState(false);

  /**
   * Hook de navegação do React Router
   */
  const navigate = useNavigate();
  
  /**
   * Hook para ler parâmetros de URL (usado para detetar callback OAuth)
   */
  const [searchParams] = useSearchParams();
  
  /**
   * Hook de autenticação para realizar login após registo bem-sucedido
   */
  const { login } = useAuth();
  
  /**
   * Hook de tradução para internacionalização
   */
  const { t } = useTranslation();

  /**
   * Efeito para processar callback de autenticação OAuth (Google/Facebook)
   * Executa quando há parâmetros na URL indicando retorno de OAuth
   * Recupera dados do localStorage e abre modal para completar registo
   */
  useEffect(() => {
    const isGoogleAuth = searchParams.get('google');
    const isFacebookAuth = searchParams.get('facebook');

    if (isGoogleAuth) {
      const storedGoogleData = localStorage.getItem('googleAuthData');
      if (storedGoogleData) {
        const googleData = JSON.parse(storedGoogleData);
        setGoogleData(googleData);
        setShowModal(true);
        localStorage.removeItem('googleAuthData'); // Clean up
      }
    } else if (isFacebookAuth) {
      const storedFacebookData = localStorage.getItem('facebookAuthData');
      if (storedFacebookData) {
        const facebookData = JSON.parse(storedFacebookData);
        setFacebookData(facebookData);
        setShowModal(true);
        localStorage.removeItem('facebookAuthData'); // Clean up
      }
    }
  }, [searchParams]);

  /**
   * Processa o registo com email e palavra-passe
   * Valida confirmação de palavra-passe, comprimento mínimo e existência de email
   * Se validações passarem, abre modal para informações adicionais
   * @param e - Evento de submissão do formulário
   */
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError(`${t('passwords')} ${t('do')} ${t('not')} ${t('match')}`);
      return;
    }
    
    if (password.length < 6) {
      setError(`${t('password')} ${t('must')} ${t('be')} ${t('at')} ${t('least')} 6 ${t('characters')}`);
      return;
    }
    
    // Check if email already exists
    try {
      setLoading(true);
      setError('');
    
      const emailCheck = await checkEmailExists(email);
    
      if (emailCheck.exists) {
        setError(`${t('emailAlreadyRegistered')} ${t('pleaseUseAnotherEmailOrLogin')}`);
        setLoading(false);
        return;
      }

      // If email doesn't exist, proceed with registration
      setGoogleData(null);
      setFacebookData(null);
      setShowModal(true);

      } catch (err: any) {
      console.error('Error checking email:', err);
      setError(`${t('errorCheckingEmail')} ${t('tryAgain')}`);
      } finally {
      setLoading(false);
      }
  };

  /**
   * Inicia o processo de registo com Google OAuth
   * Redireciona para endpoint do backend que gere a autenticação Google
   */
  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      // Redirect to backend Google OAuth
      window.location.href = 'http://localhost:8000/api/v1/customersauth/google';
    } catch (err) {
      setError(`${t('failed')} ${t('to')} initiate ${t('google')} ${t('authentication')}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inicia o processo de registo com Facebook OAuth
   * Redireciona para endpoint do backend que gere a autenticação Facebook
   */
  const handleFacebookRegister = async () => {
    try {
      setLoading(true);
      // Redirect to backend Facebook OAuth
      window.location.href = 'http://localhost:8000/api/v1/customersauth/facebook';
    } catch (err) {
      setError(`${t('failed')} ${t('to')} initiate ${t('facebook')} ${t('authentication')}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Completa o registo após recolha de informações adicionais no modal
   * Determina o método de registo (Google, Facebook ou credenciais) e chama API apropriada
   * Após sucesso, realiza login automático e redireciona para dashboard
   * @param customerData - Dados adicionais do cliente (nome, telefone, morada, etc.)
   */
  const handleCompleteRegistration = async (customerData: Omit<RegisterData, 'email' | 'password'>) => {
    try {
      setLoading(true);
      
      let response;
      if (googleData) {
        // For Google registration, merge Google data with customer data
        // Remove name from customerData since we're using Google's name
        const { name, ...restCustomerData } = customerData;
        response = await registerWithGoogle({
          token: googleData.token,
          email: googleData.email,
          name: googleData.name, // Use Google's name
          ...restCustomerData // This will add phone, address, etc. without name
        });
      } else if (facebookData) {
        // For Facebook registration - use the auth.ts function
        const { name, ...restCustomerData } = customerData;
        response = await registerWithFacebook({
          token: facebookData.token,
          email: facebookData.email,
          name: facebookData.name,
          ...restCustomerData
        });
      } else {
        // Register with email/password
        response = await registerWithCredentials({
          email,
          password,
          ...customerData
        });
      }
      
      if (response.access_token) {
        login(response.access_token);
        setTimeout(() => {
          window.location.reload();
        }, 100);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || `${t('registration')} ${t('failed')}`);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div className="">
      <div className="">
        {/* Título do formulário de registo */}
        <div>
          <h2 className="text-center fw-bold">
            {t('createAccount')}
          </h2>
        </div>

        <Form onSubmit={handleEmailRegister}>
          {/* Alerta de erro (exibido apenas se houver erro) */}
          {error && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}
          
          {/* Campo de email */}
          <Form.Group className="mb-2">
            <Form.Label htmlFor='email'>{t('email')}</Form.Label>
            <Form.Control
              type="email"
              placeholder={`${t('enterEmail')}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>
          
          {/* Campo de palavra-passe */}
          <Form.Group className="mb-2">
            <Form.Label htmlFor="password">{t('password')}</Form.Label>
            <Form.Control
              type="password"
              placeholder={`${t('enterPassword')}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>

          {/* Campo de confirmação de palavra-passe */}
          <Form.Group className="mb-3">
            <Form.Label htmlFor="confirmPassword">{t('confirmPassword')}</Form.Label>
            <Form.Control
              type="password"
              placeholder={`${t('enterConfirmPassword')}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>

          {/* Botões de ação */}
          <div className="d-grid gap-1">
            {/* Botão de registo com email/password */}
            <Button 
              type="submit" 
              variant="dark" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {t('registering')}...
                </>
              ) : (
                `${t('register')} ${t('with')} ${t('email')}`
              )}
            </Button>

            {/* Separador */}
            <div className="text-center">
              <span className="text-muted">{t('or')}</span>
            </div>

            {/* Botão de registo com Google */}
            <Button
              type="button"
              variant="outline-dark"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="d-flex align-items-center justify-content-center mb-1"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                alt="Google logo"
                style={{ width: '20px', height: '20px', marginRight: '8px' }}
              />
              {t('register')} {t('with')} {t('google')}
            </Button>

            {/* Botão de registo com Facebook */}
            <Button
              type="button"
              variant="outline-primary"
              onClick={handleFacebookRegister}
              disabled={loading}
              className="d-flex align-items-center justify-content-center mb-1"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                alt="Facebook logo"
                style={{ width: '20px', height: '20px', marginRight: '8px' }}
              />
              {t('register')} {t('with')} {t('facebook')}
            </Button>

            {/* Botão para abrir modal de login */}
            <Button 
              type="button" 
              variant="dark" 
              disabled={loading}
              className="mb-2"
              onClick={() => setShowLoginModal(true)}
            >
              {t('signInToExistingAccount')}
            </Button>
          </div>
        </Form>
        
        {/* Modal para completar informações de registo */}
        {showModal && (
          <RegisterCustomerInfoModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleCompleteRegistration}
            googleData={googleData}
            facebookData={facebookData}
            email={email}
            loading={loading}
          />
        )}
        
        {/* Modal de login */}
        <LoginModal
          show={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </div>
    </div>
  );
};

export default Register;