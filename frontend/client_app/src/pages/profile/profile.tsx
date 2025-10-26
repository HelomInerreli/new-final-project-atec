import React, { useState, useEffect, useMemo } from "react";
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
  });
  const [loading, setLoading] = useState(true);

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
      const customerData = await getCustomerDetails(loggedInCustomerId!);
      
      setForm({
        name: customerData.name || "",
        email: customerData.email || "",
        phone: customerData.phone || "",
        address: customerData.address || "",
        city: customerData.city || "",
        postalCode: customerData.postal_code || "",
        birthDate: customerData.birth_date || "",
        country: customerData.country || "",
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
