import React, { useState, useEffect, useMemo } from "react";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../api/auth";
import { getCustomerDetails, createPassword, changePassword, unlinkGoogle, unlinkFacebook, updateCustomerProfile } from "../../api/auth";
import PasswordModal from '../../components/PasswordModal';
import EditCustomerInfoModal from '../../components/EditCustomerInfoModal';
import "../../styles/profile.css";
import "../../styles/RedButton.css";

/**
 * Interface para dados do perfil do utilizador
 * Contém informações pessoais, endereço e métodos de autenticação
 */
type UserProfile = {
  /** Nome completo do utilizador */
  name: string;
  /** Email do utilizador */
  email: string;
  /** Número de telefone */
  phone: string;
  /** Morada completa */
  address: string;
  /** Cidade */
  city: string;
  /** Código postal */
  postal_code: string;
  /** Data de nascimento */
  birthDate: string;
  /** País de residência */
  country: string;
  /** Indica se utilizador tem password definida */
  hasPassword: boolean;
  /** Indica se conta Google está ligada */
  hasGoogleAuth: boolean;
  /** Indica se conta Facebook está ligada */
  hasFacebookAuth: boolean;
};

const useAccountButtonVariant = (isConnected: boolean) => {
  return {
    variant: isConnected ? "outline-danger" : "outline-success" as const,
    style: {
      transition: 'all 0.2s ease',
    },
    className: isConnected ? 'connected-account-btn' : 'unconnected-account-btn'
  };
};

/**
 * Componente de página de perfil do utilizador
 * Exibe e permite edição de dados pessoais, endereço e métodos de autenticação
 * Permite criar/alterar password, vincular/desvincular contas Google e Facebook
 * Suporta callbacks OAuth para confirmação de vinculação de contas sociais
 * Requer autenticação - exibe alerta se utilizador não autenticado
 * @returns Componente JSX da página de perfil
 */
const Profile: React.FC = () => {
  /**
   * Hook de tradução para internacionalização
   */
  const { t } = useTranslation();
  
  /**
   * Hook de autenticação para obter ID do cliente e estado de login
   */
  const { loggedInCustomerId, isLoggedIn } = useAuth();
  
  /**
   * Estado para armazenar dados do perfil do utilizador
   * Tipo: UserProfile (inclui dados pessoais, endereço e métodos auth)
   * Inicial: objeto vazio com valores default
   */
  const [form, setForm] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    birthDate: "",
    country: "",
    hasPassword: false,
    hasGoogleAuth: false,
    hasFacebookAuth: false,
  });
  
  /**
   * Estado para controlar loading geral da página
   * Tipo: boolean
   * Inicial: true (exibe spinner durante carregamento inicial)
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * Estado para controlar qual serviço OAuth está em processo de linking
   * Tipo: string | null ('google', 'facebook' ou null)
   * Inicial: null (nenhum serviço em processo)
   */
  const [linkLoading, setLinkLoading] = useState<string | null>(null);
  
  /**
   * Estado para armazenar mensagens de erro
   * Tipo: string | null
   * Inicial: null (sem erros)
   */
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Estado para controlar visibilidade do modal de password
   * Tipo: boolean
   * Inicial: false (modal fechado)
   */
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  /**
   * Estado para controlar loading no modal de password
   * Tipo: boolean
   * Inicial: false (sem loading)
   */
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  /**
   * Estado para controlar visibilidade do modal de edição de perfil
   * Tipo: boolean
   * Inicial: false (modal fechado)
   */
  const [showEditModal, setShowEditModal] = useState(false);
  
  /**
   * Estado para controlar loading no modal de edição de perfil
   * Tipo: boolean
   * Inicial: false (sem loading)
   */
  const [editLoading, setEditLoading] = useState(false);

  /**
   * Configurações de estilo para botão de password (baseado em ter ou não password)
   */
  const passwordButton = useAccountButtonVariant(form.hasPassword);
  
  /**
   * Configurações de estilo para botão Google (baseado em estar ou não vinculado)
   */
  const googleButton = useAccountButtonVariant(form.hasGoogleAuth);
  
  /**
   * Configurações de estilo para botão Facebook (baseado em estar ou não vinculado)
   */
  const facebookButton = useAccountButtonVariant(form.hasFacebookAuth);

  /**
   * Calcula iniciais do nome do utilizador para avatar
   * Extrai primeira letra do primeiro nome e última letra do último nome
   * Recalcula apenas quando form.name muda (memoizado)
   */
  const initials = useMemo(() => {
    if (!form.name) return "?";
    const names = form.name.split(" ");
    const firstInitial = names[0]?.[0] || "";
    const lastInitial = names[names.length - 1]?.[0] || "";
    return (firstInitial + lastInitial).toUpperCase();
  }, [form.name]);

  /**
   * Efeito para carregar dados do cliente ao montar componente ou mudar autenticação
   * Executa loadCustomerData quando utilizador está autenticado
   * Executado quando isLoggedIn ou loggedInCustomerId mudam
   */
  useEffect(() => {
    if (isLoggedIn && loggedInCustomerId) {
      loadCustomerData();
    }
  }, [isLoggedIn, loggedInCustomerId]);

  /**
   * Efeito para processar callbacks OAuth de vinculação de contas
   * Detecta parâmetros URL (facebook_linked, google_linked) após redirect OAuth
   * Exibe mensagens de sucesso/erro e recarrega dados do cliente
   * Remove parâmetros da URL após processar
   * Executado apenas na montagem do componente
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const facebookLinked = urlParams.get('facebook_linked');
    const googleLinked = urlParams.get('google_linked');
    
    if (facebookLinked === 'success') {
      alert(t('profilePage.linkSuccess', { provider: 'Facebook' }));
      loadCustomerData();
      window.history.replaceState({}, '', '/profile');
    } else if (facebookLinked === 'error') {
      const reason = urlParams.get('reason');
      let errorMessage = t('profilePage.linkError', { provider: 'Facebook' });
      
      if (reason === 'already_linked') {
        errorMessage = t('profilePage.alreadyLinked', { provider: 'Facebook' });
      } else if (reason === 'auth_failed') {
        errorMessage = t('profilePage.authFailed');
      } else if (reason === 'no_session') {
        errorMessage = t('profilePage.sessionExpired');
      }
      
      alert(errorMessage);
      window.history.replaceState({}, '', '/profile');
    }
    
    if (googleLinked === 'success') {
      alert(t('profilePage.linkSuccess', { provider: 'Google' }));
      loadCustomerData();
      window.history.replaceState({}, '', '/profile');
    } else if (googleLinked === 'error') {
      alert(t('profilePage.linkError', { provider: 'Google' }));
      window.history.replaceState({}, '', '/profile');
    }
  }, [t]);

  /**
   * Carrega dados completos do cliente autenticado do backend
   * Obtém informações pessoais, endereço e métodos de autenticação configurados
   * Atualiza estado form com dados recebidos
   * Gere estados de loading e error durante operação
   * @throws Exibe erro no estado se falhar comunicação com backend
   */
  const loadCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading customer data for ID:', loggedInCustomerId);

      const customerData = await getCustomerDetails(loggedInCustomerId!);
      console.log('Customer data received:', customerData);
      
      console.log('Auth debug:', {
        password_hash: customerData.password_hash,
        google_id: customerData.google_id,
        facebook_id: customerData.facebook_id,
        hasPassword: !!customerData.password_hash,
        hasGoogleAuth: !!customerData.google_id,
        hasFacebookAuth: !!customerData.facebook_id
      });

      setForm({
        name: customerData.name || "",
        email: customerData.email || "",
        phone: customerData.phone || "",
        address: customerData.address || "",
        city: customerData.city || "",
        postal_code: customerData.postal_code || "",
        birthDate: customerData.birth_date || "",
        country: customerData.country || "Portugal",
        hasPassword: !!customerData.password_hash,
        hasGoogleAuth: !!customerData.google_id,
        hasFacebookAuth: !!customerData.facebook_id,
      });
    } catch (error) {
      console.error('Error loading customer data:', error);
      setError('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formata string de data para formato português (dd/mm/yyyy)
   * @param dateString - String de data no formato ISO ou similar
   * @returns String formatada no padrão pt-PT ou string vazia se input inválido
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT");
  };

  if (!isLoggedIn) {
    return (
      <div className="profile">
        <div className="card">
          <p>{t('profilePage.pleaseLogin')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile">
        <div className="card">
          <p>{t('profilePage.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  /**
   * Handler para abrir modal de criação/alteração de password
   * Exibe modal apropriado baseado em ter ou não password existente
   */
  const handlePasswordAction = () => {
    setShowPasswordModal(true);
  };

  /**
   * Handler para submissão de nova password ou alteração de password existente
   * Cria password se não existir, ou altera password existente após validar password atual
   * Exibe mensagens de sucesso/erro e recarrega dados em caso de sucesso
   * @param passwordData - Objeto contendo currentPassword (opcional) e newPassword
   * @throws Lança erro com mensagem traduzida se operação falhar
   */
  const handlePasswordSubmit = async (passwordData: { currentPassword?: string; newPassword: string }) => {
    try {
      setPasswordLoading(true);
      
      if (form.hasPassword) {
        // Change existing password
        await changePassword({
          currentPassword: passwordData.currentPassword!,
          newPassword: passwordData.newPassword
        });
        alert(t('profilePage.passwordChangedSuccess'));
      } else {
        // Create new password
        await createPassword({
          newPassword: passwordData.newPassword
        });
        alert(t('profilePage.passwordCreatedSuccess'));
        // Reload customer data to update the hasPassword status
        await loadCustomerData();
      }
    } catch (error: any) {
      console.error('Password error:', error);
      throw new Error(error.response?.data?.detail || t('profilePage.passwordError'));
    } finally {
      setPasswordLoading(false);
    }
  };

  /**
   * Handler para vincular ou desvincular conta Google
   * Se vinculada: pede confirmação, valida existência de password, e desvincula
   * Se desvinculada: redireciona para fluxo OAuth do Google com token de autenticação
   * Valida presença de password antes de permitir desvinculação (segurança)
   * @throws Exibe alert com erro se operação falhar
   */
  const handleGoogleAction = async () => {
    if (form.hasGoogleAuth) {
      // Unlink Google account
      if (!form.hasPassword) {
        alert(t('profilePage.cannotUnlinkWithoutPassword', { provider: 'Google' }));
        return;
      }
      
      // Confirm action
      const confirmUnlink = window.confirm(t('profilePage.confirmUnlink', { provider: 'Google' }));
      if (!confirmUnlink) return;
      
      setLinkLoading('google');
      try {
        await unlinkGoogle();
        alert(t('profilePage.unlinkSuccess', { provider: 'Google' }));
        await loadCustomerData();
      } catch (error: any) {
        console.error('Error unlinking Google:', error);
        const errorMessage = error.response?.data?.detail || t('profilePage.unlinkError', { provider: 'Google' });
        alert(errorMessage);
      } finally {
        setLinkLoading(null);
      }
    } else {
      // Link Google account
      setLinkLoading('google');
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert(t('profilePage.tokenNotFound'));
          setLinkLoading(null);
          return;
        }
        
        const linkUrl = `http://localhost:8000/api/v1/customersauth/link/google?token=${token}`;
        window.location.href = linkUrl;
      } catch (error) {
        console.error('Error linking Google:', error);
        alert(t('profilePage.linkError', { provider: 'Google' }));
        setLinkLoading(null);
      }
    }
  };

  /**
   * Handler para vincular ou desvincular conta Facebook
   * Se vinculada: pede confirmação, valida existência de password, e desvincula
   * Se desvinculada: redireciona para fluxo OAuth do Facebook com token de autenticação
   * Valida presença de password antes de permitir desvinculação (segurança)
   * @throws Exibe alert com erro se operação falhar
   */
  const handleFacebookAction = async () => {
    if (form.hasFacebookAuth) {
      // Unlink Facebook account
      if (!form.hasPassword) {
        alert(t('profilePage.cannotUnlinkWithoutPassword', { provider: 'Facebook' }));
        return;
      }
      
      // Confirm action
      const confirmUnlink = window.confirm(t('profilePage.confirmUnlink', { provider: 'Facebook' }));
      if (!confirmUnlink) return;
      
      setLinkLoading('facebook');
      try {
        await unlinkFacebook();
        alert(t('profilePage.unlinkSuccess', { provider: 'Facebook' }));
        await loadCustomerData();
      } catch (error: any) {
        console.error('Error unlinking Facebook:', error);
        const errorMessage = error.response?.data?.detail || t('profilePage.unlinkError', { provider: 'Facebook' });
        alert(errorMessage);
      } finally {
        setLinkLoading(null);
      }
    } else {
      // Link Facebook account
      setLinkLoading('facebook');
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert(t('profilePage.tokenNotFound'));
          setLinkLoading(null);
          return;
        }
        
        const linkUrl = `http://localhost:8000/api/v1/customersauth/link/facebook?token=${token}`;
        window.location.href = linkUrl;
      } catch (error) {
        console.error('Error linking Facebook:', error);
        alert(t('profilePage.linkError', { provider: 'Facebook' }));
        setLinkLoading(null);
      }
    }

  };

  /**
   * Handler para submissão de dados editados do perfil
   * Atualiza dados do cliente no backend através de API
   * Recarrega dados atualizados e fecha modal em caso de sucesso
   * Exibe mensagens de sucesso/erro apropriadas
   * @param data - Objeto com dados do perfil a serem atualizados
   * @throws Exibe alert com erro se operação falhar
   */
  const handleEditSubmit = async (data: any) => {
    setEditLoading(true);
    try {
      await updateCustomerProfile(data);
      alert(t('profilePage.profileUpdatedSuccess'));
      await loadCustomerData();
      setShowEditModal(false);
    } catch (error) {
      alert(t('profilePage.profileUpdateError'));
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="profile">
      <header className="prof-header">
        <div className="avatar" aria-hidden="true" style={{ backgroundColor: '#dc3545', color: '#ffffff' }}>{initials}</div>
        <div>
          <h1>{t('profilePage.title')}</h1>
          <p className="subtitle">{t('profilePage.subtitle')}</p>
        </div>
      </header>

      <div className="prof-form">
        <section className="card">
          <h2>{t('profilePage.personalInfo')}</h2>
          <div className="prof-grid">
            <div className="field">
              <label htmlFor="name">{t('profilePage.fullName')}</label>
              <input
                id="name"
                className="prof-input"
                value={form.name}
                placeholder={t('fullName')}
                readOnly
              />
            </div>
            <div className="field">
              <label htmlFor="email">{t('email')}</label>
              <input
                id="email"
                className="prof-input"
                type="email"
                value={form.email}
                placeholder={t('enterEmail')}
                readOnly
              />
            </div>
            <div className="field">
              <label htmlFor="phone">{t('phone')}</label>
              <input
                id="phone"
                className="prof-input"
                value={form.phone}
                placeholder={t('enterPhoneNumber')}
                readOnly
              />
            </div>
            <div className="field">
              <label htmlFor="birthDate">{t('birthDate')}</label>
              <input
                id="birthDate"
                className="prof-input"
                value={formatDate(form.birthDate)}
                placeholder={t('birthDate')}
                readOnly
              />
            </div>
          </div>
        </section>

        <section className="card">
          <h2>{t('profilePage.addressSection')}</h2>
          <div className="prof-grid">
            <div className="field">
              <label htmlFor="address">{t('address')}</label>
              <input
                id="address"
                className="prof-input"
                value={form.address}
                placeholder={t('enterAddress')}
                readOnly
              />
            </div>
            <div className="field">
              <label htmlFor="country">{t('country')}</label>
              <input
                id="country"
                className="prof-input"
                value={form.country}
                placeholder={'Portugal'}
                readOnly
              />
            </div>
            <div className="field">
              <label htmlFor="city">{t('city')}</label>
              <input
                id="city"
                className="prof-input"
                value={form.city}
                placeholder={t('enterCity')}
                readOnly
              />
            </div>
            <div className="field">
              <label htmlFor="postal_code">{t('postalCode')}</label>
              <input
                id="postal_code"
                className="prof-input"
                value={form.postal_code}
                placeholder={t('enterPostalCode')}
                readOnly
              />
            </div>
          </div>
        </section>

        <section className="card">
          <h2>{t('profilePage.accountSecurity')}</h2>
          
          <div className="d-grid gap-2">
            {/* Password Button */}
            <Button
              type="button"
              variant={passwordButton.variant}
              style={passwordButton.style}
              className={`d-flex align-items-center justify-content-center ${passwordButton.className}`}
              onClick={handlePasswordAction}
              size="sm"
            >
              <i className="bi bi-shield-check me-2"></i>
              {form.hasPassword ? t('profilePage.changePassword') : t('profilePage.createPassword')}
            </Button>

            {/* Google Button */}
            <Button
              type="button"
              variant={googleButton.variant}
              style={googleButton.style}
              className={`d-flex align-items-center justify-content-center ${googleButton.className}`}
              onClick={handleGoogleAction}
              disabled={linkLoading === 'google'}
              size="sm"
            >
              {linkLoading === 'google' ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">{t('profilePage.processing')}</span>
                  </div>
                  {t('profilePage.processing')}
                </>
              ) : (
                <>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                    alt="Google logo"
                    style={{ width: '16px', height: '16px', marginRight: '8px' }}
                  />
                  {form.hasGoogleAuth ? t('profilePage.unlinkGoogle') : t('profilePage.linkGoogle')}
                </>
              )}
            </Button>

            {/* Facebook Button */}
            <Button
              type="button"
              variant={facebookButton.variant}
              style={facebookButton.style}
              className={`d-flex align-items-center justify-content-center ${facebookButton.className}`}
              onClick={handleFacebookAction}
              disabled={linkLoading === 'facebook'}
              size="sm"
            >
              {linkLoading === 'facebook' ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">{t('profilePage.processing')}</span>
                  </div>
                  {t('profilePage.processing')}
                </>
              ) : (
                <>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                    alt="Facebook logo"
                    style={{ width: '16px', height: '16px', marginRight: '8px' }}
                  />
                  {form.hasFacebookAuth ? t('profilePage.unlinkFacebook') : t('profilePage.linkFacebook')}
                </>
              )}
            </Button>
          </div>
        </section>

        <div className="actions">
          <button
            type="button"
            className="btn primary red-hover-btn"
            onClick={() => setShowEditModal(true)}
          >
            {t('profilePage.editProfile')}
          </button>
        </div>
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
        isCreating={!form.hasPassword}
        loading={passwordLoading}
      />
      <EditCustomerInfoModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        initialData={form}
        loading={editLoading}
      />
    </div>
  );
};

export default Profile;
