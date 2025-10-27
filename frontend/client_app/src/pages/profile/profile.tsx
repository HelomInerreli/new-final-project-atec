import React, { useState, useEffect, useMemo } from "react";
import { Button } from "react-bootstrap";
import { useAuth } from "../../api/auth";
import { getCustomerDetails } from "../../api/auth";
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
    if (form.hasPassword) {
      // Navigate to change password page or show modal
      alert("Funcionalidade para alterar palavra-passe será implementada em breve");
    } else {
      // Navigate to create password page or show modal
      alert("Funcionalidade para criar palavra-passe será implementada em breve");
    }
  };

  const handleGoogleAction = async () => {
    if (form.hasGoogleAuth) {
      // Unlink Google account
      if (!form.hasPassword) {
        alert("Não é possível desligar o Google sem ter uma palavra-passe configurada. Configure uma palavra-passe primeiro.");
        return;
      }
      
      setLinkLoading('google');
      try {
        // TODO: Implement unlink Google API call
        alert("Funcionalidade para desligar Google será implementada em breve");
      } catch (error) {
        console.error('Error unlinking Google:', error);
        alert("Erro ao desligar conta Google");
      } finally {
        setLinkLoading(null);
      }
    } else {
      // Link Google account
      setLinkLoading('google');
      try {
        window.location.href = 'http://localhost:8000/api/v1/customersauth/link/google';
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
      
      setLinkLoading('facebook');
      try {
        // TODO: Implement unlink Facebook API call
        alert("Funcionalidade para desligar Facebook será implementada em breve");
      } catch (error) {
        console.error('Error unlinking Facebook:', error);
        alert("Erro ao desligar conta Facebook");
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
    </div>
  );
};

export default Profile;
