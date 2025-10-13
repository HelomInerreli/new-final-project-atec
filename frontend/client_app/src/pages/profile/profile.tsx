import React, { useMemo, useState } from "react";
import "../../styles/profile.css";

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  taxId: string; 
  address1: string;
  city: string;
  postalCode: string;
  country: string;
  newsletter: boolean;
};

const INITIAL_DATA: UserProfile = {
  firstName: "Diogo",
  lastName: "Silva",
  email: "diogo@example.com",
  phone: "+351 912 345 678",
  company: "Exemplo Lda",
  taxId: "123456789",
  address1: "Rua das Flores 12",
  city: "Lisboa",
  postalCode: "1000-001",
  country: "Portugal",
  newsletter: true,
};

const Profile: React.FC = () => {
  const [form, setForm] = useState<UserProfile>(INITIAL_DATA);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(INITIAL_DATA), [form]);

  const initials = useMemo(() => {
    const a = form.firstName?.[0] ?? "";
    const b = form.lastName?.[0] ?? "";
    return (a + b).toUpperCase();
  }, [form.firstName, form.lastName]);

  const onChange =
    <K extends keyof UserProfile>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.currentTarget.type === "checkbox"
        ? (e.currentTarget as HTMLInputElement).checked
        : e.currentTarget.value;
      setForm((f) => ({ ...f, [key]: value } as UserProfile));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Aqui ligarias à tua API (ex.: PUT /me)
    await new Promise((r) => setTimeout(r, 600));
    // Simular sucesso: normalmente atualizarias o estado base a partir da resposta
    Object.assign(INITIAL_DATA, form);
    setSaving(false);
    setSavedAt(new Date());
  };

  const handleReset = () => {
    setForm({ ...INITIAL_DATA });
    setSavedAt(null);
  };


  // VERIFICAR O PREENCHEMENTO AUTOMÁTICO, NÃO É PARA PREENCHER, É PARA FICAR TIPO SOMBRA

  return (
    <div className="profile">
      <header className="prof-header">
        <div className="avatar" aria-hidden="true">{initials || "?"}</div>
        <div>
          <h1>Meu Perfil</h1>
          <p className="subtitle">Gerencie as informações do seu perfil</p>
          {savedAt && <p className="saved-hint">Guardado em {savedAt.toLocaleTimeString("pt-PT")}</p>}
        </div>
      </header>

      <form className="prof-form" onSubmit={handleSubmit}>
        <section className="card">
          <h2>Informação pessoal</h2>
          <div className="prof-grid">
            <div className="field">
              <label htmlFor="firstName">Nome</label>
              <input
                id="firstName"
                className="prof-input"
                value={form.firstName}
                onChange={onChange("firstName")}
                placeholder="Nome"
                autoComplete="given-name"
              />
            </div>
            <div className="field">
              <label htmlFor="lastName">Apelido</label>
              <input
                id="lastName"
                className="prof-input"
                value={form.lastName}
                onChange={onChange("lastName")}
                placeholder="Apelido"
                autoComplete="family-name"
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="prof-input"
                type="email"
                value={form.email}
                onChange={onChange("email")}
                placeholder="email@exemplo.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Telemóvel</label>
              <input
                id="phone"
                className="prof-input"
                value={form.phone}
                onChange={onChange("phone")}
                placeholder="+351 ..."
                autoComplete="tel"
              />
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Empresa & Faturação</h2>
          <div className="prof-grid">
            <div className="field">
              <label htmlFor="company">Empresa</label>
              <input
                id="company"
                className="prof-input"
                value={form.company}
                onChange={onChange("company")}
                placeholder="Nome da empresa"
                autoComplete="organization"
              />
            </div>
            <div className="field">
              <label htmlFor="taxId">NIF</label>
              <input
                id="taxId"
                className="prof-input"
                value={form.taxId}
                onChange={onChange("taxId")}
                placeholder="123456789"
                inputMode="numeric"
              />
            </div>
            <div className="field field--full">
              <label htmlFor="address1">Morada</label>
              <input
                id="address1"
                className="prof-input"
                value={form.address1}
                onChange={onChange("address1")}
                placeholder="Rua, nº, andar"
                autoComplete="address-line1"
              />
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <input
                id="city"
                className="prof-input"
                value={form.city}
                onChange={onChange("city")}
                placeholder="Cidade"
                autoComplete="address-level2"
              />
            </div>
            <div className="field">
              <label htmlFor="postalCode">Código Postal</label>
              <input
                id="postalCode"
                className="prof-input"
                value={form.postalCode}
                onChange={onChange("postalCode")}
                placeholder="0000-000"
                autoComplete="postal-code"
              />
            </div>
            <div className="field">
              <label htmlFor="country">País</label>
              <select
                id="country"
                className="prof-input"
                value={form.country}
                onChange={onChange("country")}
                autoComplete="country-name"
              >
                <option>Portugal</option>
                <option>Espanha</option>
                <option>França</option>
                <option>Alemanha</option>
                <option>Outro</option>
              </select>
            </div>
          </div>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.newsletter}
              onChange={onChange("newsletter")}
            />
            <span>Quero receber novidades por email</span>
          </label>
        </section>

        <div className="actions">
          <button
            type="button"
            className="btn"
            onClick={handleReset}
            disabled={!dirty || saving}
          >
            Repor
          </button>
          <button
            type="submit"
            className="btn primary"
            disabled={saving || !form.email}
            aria-busy={saving}
          >
            {saving ? "A guardar..." : "Guardar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
