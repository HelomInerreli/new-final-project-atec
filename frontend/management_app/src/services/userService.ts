import http from '../api/http';
import type { CurrentUser } from '../interfaces/CurrentUser';

export interface UserUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

export const userService = {
  /**
   * Get current user information
   */
  getCurrentUser: async (): Promise<CurrentUser> => {
    try {
      const response = await http.get<CurrentUser>('/managementauth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw new Error('Não foi possível carregar informações do usuário.');
    }
  },

  /**
   * Update current user profile
   */
  updateProfile: async (userData: UserUpdate): Promise<CurrentUser> => {
    try {
      const response = await http.put<CurrentUser>('/managementauth/me', userData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Não foi possível atualizar o perfil.');
    }
  },

  /**
   * Change current user password
   */
  changePassword: async (passwordData: PasswordChange): Promise<void> => {
    try {
      await http.post('/managementauth/me/change-password', passwordData);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Não foi possível alterar a senha.');
    }
  },
};
