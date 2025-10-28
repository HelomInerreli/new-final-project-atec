import React, { useState, useEffect, useMemo } from "react";
import { Button } from "react-bootstrap";
import { useAuth } from "../../api/auth";
import { getCustomerDetails, createPassword, changePassword, unlinkGoogle, unlinkFacebook } from "../../api/auth";
import PasswordModal from '../../components/PasswordModal';
import "../../styles/profile.css";

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  birthDate: string;
  country: string;
  hasPassword: boolean;
  hasGoogleAuth: boolean;
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

const Profile: React.FC = () => {
  const { loggedInCustomerId, isLoggedIn } = useAuth();
  const [form, setForm] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    birthDate: "",
    country: "",
    hasPassword: false,
    hasGoogleAuth: false,
    hasFacebookAuth: false,
  });
  const [loading, setLoading] = useState(true);
  const [linkLoading, setLinkLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // MOVE THE HOOK CALLS HERE - RIGHT AFTER STATE DECLARATIONS
  const passwordButton = useAccountButtonVariant(form.hasPassword);
  const googleButton = useAccountButtonVariant(form.hasGoogleAuth);
  const facebookButton = useAccountButtonVariant(form.hasFacebookAuth);

  const initials = useMemo(() => {
    if (!form.name) return "?";
    const names = form.name.split(" ");
    const firstInitial = names[0]?.[0] || "";
    const lastInitial = names[names.length - 1]?.[0] || "";
    return (firstInitial + lastInitial).toUpperCase();
  }, [form.name]);

  // Load customer data
  useEffect(() => {
    if (isLoggedIn && loggedInCustomerId) {
      loadCustomerData();
    }
  }, [isLoggedIn, loggedInCustomerId]);

  // Handle OAuth linking callbacks
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const facebookLinked = urlParams.get('facebook_linked');
    const googleLinked = urlParams.get('google_linked');
    
    if (facebookLinked === 'success') {
      alert('Conta Facebook ligada com sucesso!');
      loadCustomerData();
      window.history.replaceState({}, '', '/profile');
    } else if (facebookLinked === 'error') {
      const reason = urlParams.get('reason');
      let errorMessage = 'Erro ao ligar conta Facebook. Tente novamente.';
      
      if (reason === 'already_linked') {
        errorMessage = 'Esta conta Facebook já está ligada a outro utilizador.';
      } else if (reason === 'auth_failed') {
        errorMessage = 'Falha na autenticação. Tente novamente.';
      } else if (reason === 'no_session') {
        errorMessage = 'Sessão expirada. Tente novamente.';
      }
      
      alert(errorMessage);
      window.history.replaceState({}, '', '/profile');
    }
    
    if (googleLinked === 'success') {
      alert('Conta Google ligada com sucesso!');
      loadCustomerData();
      window.history.replaceState({}, '', '/profile');
    } else if (googleLinked === 'error') {
      alert('Erro ao ligar conta Google. Tente novamente.');
      window.history.replaceState({}, '', '/profile');
    }
  }, []);

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
        postalCode: customerData.postal_code || "",
        birthDate: customerData.birth_date || "",
        country: customerData.country || "",
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT");
  };

  if (!isLoggedIn) {
    return (
      <div className="profile">
        <div className="card">
          <p>Por favor, faça login para ver o seu perfil.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile">
        <div className="card">
          <p>A carregar dados do perfil...</p>
        </div>
      </div>
    );
  }

  const handlePasswordAction = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (passwordData: { currentPassword?: string; newPassword: string }) => {
    try {
      setPasswordLoading(true);
      
      if (form.hasPassword) {
        // Change existing password
        await changePassword({
          currentPassword: passwordData.currentPassword!,
          newPassword: passwordData.newPassword
        });
        alert('Palavra-passe alterada com sucesso!');
      } else {
        // Create new password
        await createPassword({
          newPassword: passwordData.newPassword
        });
        alert('Palavra-passe criada com sucesso!');
        // Reload customer data to update the hasPassword status
        await loadCustomerData();
      }
    } catch (error: any) {
      console.error('Password error:', error);
      throw new Error(error.response?.data?.detail || 'Erro ao processar palavra-passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleGoogleAction = async () => {
    if (form.hasGoogleAuth) {
      // Unlink Google account
      if (!form.hasPassword) {
        alert("Não é possível desligar o Google sem ter uma palavra-passe configurada. Configure uma palavra-passe primeiro.");
        return;
      }
      
      // Confirm action
      const confirmUnlink = window.confirm("Tem a certeza de que deseja desligar a sua conta Google?");
      if (!confirmUnlink) return;
      
      setLinkLoading('google');
      try {
        await unlinkGoogle();
        alert("Conta Google desligada com sucesso!");
        await loadCustomerData();
      } catch (error: any) {
        console.error('Error unlinking Google:', error);
        const errorMessage = error.response?.data?.detail || "Erro ao desligar conta Google";
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
          alert("Erro: Não foi possível encontrar o token de autenticação");
          setLinkLoading(null);
          return;
        }
        
        const linkUrl = `http://localhost:8000/api/v1/customersauth/link/google?token=${token}`;
        window.location.href = linkUrl;
      } catch (error) {
        console.error('Error linking Google:', error);
        alert("Erro ao conectar com Google");
        setLinkLoading(null);
      }
    }
  };

  const handleFacebookAction = async () => {
    if (form.hasFacebookAuth) {
      // Unlink Facebook account
      if (!form.hasPassword) {
        alert("Não é possível desligar o Facebook sem ter uma palavra-passe configurada. Configure uma palavra-passe primeiro.");
        return;
      }
      
      // Confirm action
      const confirmUnlink = window.confirm("Tem a certeza de que deseja desligar a sua conta Facebook?");
      if (!confirmUnlink) return;
      
      setLinkLoading('facebook');
      try {
        await unlinkFacebook();
        alert("Conta Facebook desligada com sucesso!");
        await loadCustomerData();
      } catch (error: any) {
        console.error('Error unlinking Facebook:', error);
        const errorMessage = error.response?.data?.detail || "Erro ao desligar conta Facebook";
        alert(errorMessage);
      } finally {
        setLinkLoading(null);
      }
    } else {
      // Link Facebook account
      setLinkLoading('facebook');
      try {
          // Get the token from localStorage
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert("Erro: Não foi possível encontrar o token de autenticação");
          setLinkLoading(null);
          return;
        }
        
        // Include token as query parameter
        const linkUrl = `http://localhost:8000/api/v1/customersauth/link/facebook?token=${token}`;
        window.location.href = linkUrl;
      } catch (error) {
        console.error('Error linking Facebook:', error);
        alert("Erro ao conectar com Facebook");
        setLinkLoading(null);
      }
    }
  };

  return (
    <div className="profile">
      <header className="prof-header">
        <div className="avatar" aria-hidden="true">{initials}</div>
        <div>
          <h1>Meu Perfil</h1>
          <p className="subtitle">Informações do seu perfil</p>
        </div>
      </header>

      <div className="prof-form">
        <section className="card">
          <h2>Informação pessoal</h2>
          <div className="prof-grid">
            <div className="field">
              <label htmlFor="name">Nome Completo</label>
              <input
                id="name"
                className="prof-input"
                value={form.name}
                placeholder="Nome completo"
                readOnly
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="prof-input"
                type="email"
                value={form.email}
                placeholder="email@exemplo.com"
                readOnly
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Telemóvel</label>
              <input
                id="phone"
                className="prof-input"
                value={form.phone}
                placeholder="+351 ..."
                readOnly
              />
            </div>
            <div className="field">
              <label htmlFor="birthDate">Data de Nascimento</label>
              <input
                id="birthDate"
                className="prof-input"
                value={formatDate(form.birthDate)}
                placeholder="DD/MM/AAAA"
                readOnly
              />
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Morada</h2>
          <div className="prof-grid">
            <div className="field">
              <label htmlFor="address">Morada</label>
              <input
                id="address"
                className="prof-input"
                value={form.address}
                placeholder="Rua, nº, andar"
                readOnly
              />
            </div>
            <div className="field">
              <label htmlFor="country">País</label>
              <input
                id="country"
                className="prof-input"
                value={form.country}
                placeholder="Portugal"
                readOnly
              />
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <input
                id="city"
                className="prof-input"
                value={form.city}
                placeholder="Cidade"
                readOnly
              />
            </div>
            <div className="field">
              <label htmlFor="postalCode">Código Postal</label>
              <input
                id="postalCode"
                className="prof-input"
                value={form.postalCode}
                placeholder="0000-000"
                readOnly
              />
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Segurança da Conta</h2>
          
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
              {form.hasPassword ? 'Alterar Palavra-passe' : 'Criar Palavra-passe'}
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
                    <span className="visually-hidden">A processar...</span>
                  </div>
                  A processar...
                </>
              ) : (
                <>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                    alt="Google logo"
                    style={{ width: '16px', height: '16px', marginRight: '8px' }}
                  />
                  {form.hasGoogleAuth ? 'Desligar Google' : 'Ligar ao Google'}
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
                    <span className="visually-hidden">A processar...</span>
                  </div>
                  A processar...
                </>
              ) : (
                <>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                    alt="Facebook logo"
                    style={{ width: '16px', height: '16px', marginRight: '8px' }}
                  />
                  {form.hasFacebookAuth ? 'Desligar Facebook' : 'Ligar ao Facebook'}
                </>
              )}
            </Button>
          </div>
        </section>

        <div className="actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => alert("Funcionalidade de edição será implementada em breve")}
          >
            Editar Perfil
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
    </div>
  );
};

export default Profile;
