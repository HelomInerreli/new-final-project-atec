import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import http, { setAuthToken } from "../api/http";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_manager: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isManager: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      setAuthToken(token);
      const response = await http.get("/managementauth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to load user info:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Verifica se é gestor ou manager
  const isManager =
    user?.is_manager || user?.role?.toLowerCase() === "management" || false;

  // Verifica se é admin
  const isAdmin = user?.role?.toLowerCase() === "admin" || false;

  // Pode editar se for gestor, manager ou admin
  const canEdit = isManager || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isManager,
        isAdmin,
        canEdit,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
