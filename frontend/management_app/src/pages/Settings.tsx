import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { userService, type PasswordChange } from "../services/userService";
import { Loader2, User, Lock, Calendar } from "lucide-react";
import "../components/inputs.css";

export default function Settings() {
  const { user, loading: userLoading } = useCurrentUser();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    current_password: "",
    new_password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load user data when available
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData.phone?.trim()) {
      toast.error("O telefone não pode estar vazio");
      return;
    }

    if (!profileData.address?.trim()) {
      toast.error("A morada não pode estar vazia");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await userService.updateProfile(profileData);
      toast.success("Perfil atualizado com sucesso!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.current_password) {
      toast.error("Digite a senha atual");
      return;
    }

    if (!passwordData.new_password) {
      toast.error("Digite a nova senha");
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (passwordData.new_password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsChangingPassword(true);
    try {
      await userService.changePassword(passwordData);
      toast.success("Senha alterada com sucesso!");
      setPasswordData({
        current_password: "",
        new_password: "",
      });
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar senha");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Não foi possível carregar as informações do usuário.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-1">
          Visualize e atualize suas informações pessoais
        </p>
      </div>

      <div className="grid gap-6">
        {/* Informações Pessoais */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Informações Pessoais
              </h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Dados do funcionário</p>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleUpdateProfile} className="grid gap-6">
              {/* Nome e Apelido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-input-wrapper">
                  <input
                    id="name"
                    type="text"
                    className="mb-input"
                    value={profileData.name}
                    disabled
                    style={{
                      minHeight: "56px",
                      backgroundColor: "#f3f4f6",
                      cursor: "not-allowed",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <label
                    className={`mb-input-label ${
                      profileData.name ? "shrunken" : ""
                    }`}
                    style={{ color: "#9ca3af" }}
                  >
                    Nome (não editável)
                  </label>
                </div>

                <div className="mb-input-wrapper">
                  <input
                    id="last_name"
                    type="text"
                    className="mb-input"
                    value={user.last_name || ""}
                    disabled
                    style={{
                      minHeight: "56px",
                      backgroundColor: "#f3f4f6",
                      cursor: "not-allowed",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <label
                    className={`mb-input-label ${
                      user.last_name ? "shrunken" : ""
                    }`}
                    style={{ color: "#9ca3af" }}
                  >
                    Apelido (não editável)
                  </label>
                </div>
              </div>

              {/* Email e Telefone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-input-wrapper">
                  <input
                    id="email"
                    type="email"
                    className="mb-input"
                    value={profileData.email}
                    disabled
                    style={{
                      minHeight: "56px",
                      backgroundColor: "#f3f4f6",
                      cursor: "not-allowed",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <label
                    className={`mb-input-label ${
                      profileData.email ? "shrunken" : ""
                    }`}
                    style={{ color: "#9ca3af" }}
                  >
                    Email (não editável)
                  </label>
                </div>

                <div className="mb-input-wrapper">
                  <input
                    id="phone"
                    type="text"
                    className="mb-input"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    onFocus={(e) => {
                      const label = e.target.nextElementSibling;
                      if (label) label.classList.add("shrunken");
                    }}
                    onBlur={(e) => {
                      const label = e.target.nextElementSibling;
                      if (!e.target.value && label) {
                        label.classList.remove("shrunken");
                      }
                    }}
                    disabled={isUpdatingProfile}
                    style={{ minHeight: "56px" }}
                  />
                  <label
                    className={`mb-input-label ${
                      profileData.phone ? "shrunken" : ""
                    }`}
                  >
                    Telefone *
                  </label>
                </div>
              </div>

              {/* Morada */}
              <div className="mb-input-wrapper">
                <input
                  id="address"
                  type="text"
                  className="mb-input"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                  onFocus={(e) => {
                    const label = e.target.nextElementSibling;
                    if (label) label.classList.add("shrunken");
                  }}
                  onBlur={(e) => {
                    const label = e.target.nextElementSibling;
                    if (!e.target.value && label) {
                      label.classList.remove("shrunken");
                    }
                  }}
                  disabled={isUpdatingProfile}
                  style={{ minHeight: "56px" }}
                />
                <label
                  className={`mb-input-label ${
                    profileData.address ? "shrunken" : ""
                  }`}
                >
                  Morada *
                </label>
              </div>

              {/* Data de Nascimento e Data de Contratação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-input-wrapper">
                  <input
                    id="date_of_birth"
                    type="date"
                    className="mb-input"
                    value={
                      user.date_of_birth
                        ? new Date(user.date_of_birth)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    disabled
                    style={{
                      minHeight: "56px",
                      backgroundColor: "#f3f4f6",
                      cursor: "not-allowed",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <label
                    className={`mb-input-label ${
                      user.date_of_birth ? "shrunken" : ""
                    }`}
                    style={{ color: "#9ca3af" }}
                  >
                    Data de Nascimento (não editável)
                  </label>
                  <Calendar
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "20px",
                      height: "20px",
                      color: "#9ca3af",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                <div className="mb-input-wrapper">
                  <input
                    id="hired_at"
                    type="date"
                    className="mb-input"
                    value={
                      user.hired_at
                        ? new Date(user.hired_at).toISOString().split("T")[0]
                        : ""
                    }
                    disabled
                    style={{
                      minHeight: "56px",
                      backgroundColor: "#f3f4f6",
                      cursor: "not-allowed",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <label
                    className={`mb-input-label ${
                      user.hired_at ? "shrunken" : ""
                    }`}
                    style={{ color: "#9ca3af" }}
                  >
                    Data de Contratação (não editável)
                  </label>
                  <Calendar
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "20px",
                      height: "20px",
                      color: "#9ca3af",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              {/* Salário e Função */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-input-wrapper">
                  <input
                    id="salary"
                    type="text"
                    className="mb-input"
                    value={user.salary ? `€ ${user.salary.toFixed(2)}` : ""}
                    disabled
                    style={{
                      minHeight: "56px",
                      backgroundColor: "#f3f4f6",
                      cursor: "not-allowed",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <label
                    className={`mb-input-label ${
                      user.salary ? "shrunken" : ""
                    }`}
                    style={{ color: "#9ca3af" }}
                  >
                    Salário (não editável)
                  </label>
                </div>

                <div className="mb-input-wrapper">
                  <input
                    id="role"
                    type="text"
                    className="mb-input"
                    value={user.employee_role?.name || ""}
                    disabled
                    style={{
                      minHeight: "56px",
                      backgroundColor: "#f3f4f6",
                      cursor: "not-allowed",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <label
                    className={`mb-input-label ${
                      user.employee_role ? "shrunken" : ""
                    }`}
                    style={{ color: "#9ca3af" }}
                  >
                    Função (não editável)
                  </label>
                </div>
              </div>

              {/* Área do Sistema e Status de Gestor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-input-wrapper">
                  <input
                    id="system_role"
                    type="text"
                    className="mb-input"
                    value={user.role}
                    disabled
                    style={{
                      minHeight: "56px",
                      backgroundColor: "#f3f4f6",
                      cursor: "not-allowed",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <label
                    className="mb-input-label shrunken"
                    style={{ color: "#9ca3af" }}
                  >
                    Área de Acesso ao Sistema (não editável)
                  </label>
                </div>

                <div className="mb-input-wrapper">
                  <input
                    id="is_manager"
                    type="text"
                    className="mb-input"
                    value={user.is_manager ? "Sim" : "Não"}
                    disabled
                    style={{
                      minHeight: "56px",
                      backgroundColor: "#f3f4f6",
                      cursor: "not-allowed",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <label
                    className="mb-input-label shrunken"
                    style={{ color: "#9ca3af" }}
                  >
                    É Gestor (não editável)
                  </label>
                </div>
              </div>

              <p className="text-xs text-gray-500 px-2">
                Você pode alterar apenas o telefone e a morada. Os demais campos
                devem ser alterados por um gestor.
              </p>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    "Atualizar Perfil"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Alterar Senha */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Alterar Senha
              </h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Atualize sua senha de acesso
            </p>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleChangePassword} className="grid gap-6">
              {/* Senha Atual */}
              <div className="mb-input-wrapper">
                <input
                  id="current_password"
                  type="password"
                  className="mb-input"
                  value={passwordData.current_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      current_password: e.target.value,
                    })
                  }
                  onFocus={(e) => {
                    const label = e.target.nextElementSibling;
                    if (label) label.classList.add("shrunken");
                  }}
                  onBlur={(e) => {
                    const label = e.target.nextElementSibling;
                    if (!e.target.value && label) {
                      label.classList.remove("shrunken");
                    }
                  }}
                  disabled={isChangingPassword}
                  style={{ minHeight: "56px" }}
                />
                <label
                  className={`mb-input-label ${
                    passwordData.current_password ? "shrunken" : ""
                  }`}
                >
                  Senha Atual *
                </label>
              </div>

              <hr className="border-gray-200" />

              {/* Nova Senha */}
              <div className="mb-input-wrapper">
                <input
                  id="new_password"
                  type="password"
                  className="mb-input"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      new_password: e.target.value,
                    })
                  }
                  onFocus={(e) => {
                    const label = e.target.nextElementSibling;
                    if (label) label.classList.add("shrunken");
                  }}
                  onBlur={(e) => {
                    const label = e.target.nextElementSibling;
                    if (!e.target.value && label) {
                      label.classList.remove("shrunken");
                    }
                  }}
                  disabled={isChangingPassword}
                  style={{ minHeight: "56px" }}
                />
                <label
                  className={`mb-input-label ${
                    passwordData.new_password ? "shrunken" : ""
                  }`}
                >
                  Nova Senha *
                </label>
              </div>
              <p className="text-xs text-gray-500 -mt-4 px-2">
                Mínimo de 6 caracteres
              </p>

              {/* Confirmar Nova Senha */}
              <div className="mb-input-wrapper">
                <input
                  id="confirm_password"
                  type="password"
                  className="mb-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={(e) => {
                    const label = e.target.nextElementSibling;
                    if (label) label.classList.add("shrunken");
                  }}
                  onBlur={(e) => {
                    const label = e.target.nextElementSibling;
                    if (!e.target.value && label) {
                      label.classList.remove("shrunken");
                    }
                  }}
                  disabled={isChangingPassword}
                  style={{ minHeight: "56px" }}
                />
                <label
                  className={`mb-input-label ${
                    confirmPassword ? "shrunken" : ""
                  }`}
                >
                  Confirmar Nova Senha *
                </label>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    "Alterar Senha"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
