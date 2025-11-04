import React, { useState, useEffect, useMemo } from "react";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../api/auth";
import { getCustomerDetails, createPassword, changePassword, unlinkGoogle, unlinkFacebook, updateCustomerProfile } from "../../api/auth";
import PasswordModal from '../../components/PasswordModal';
import EditCustomerInfoModal from '../../components/EditCustomerInfoModal';
import "../../styles/profile.css";
import "../../styles/RedButton.css";

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
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
  const { t } = useTranslation();
  const { loggedInCustomerId, isLoggedIn } = useAuth();
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
  const [loading, setLoading] = useState(true);
  const [linkLoading, setLinkLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

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

  const handleEditSubmit = async (data: UserProfile) => {
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
