/**
 * Hook personalizado para gerenciar funções (roles).
 * Permite buscar lista de funções disponíveis.
 */

import { useState, useEffect } from 'react';
// Importa hooks do React
import { roleService } from '../services/roleService';
// Serviço para funções
import type { Role } from '../interfaces/Role';
// Tipo para função

/**
 * Hook para gerenciar lista de funções.
 * @returns Estado das funções
 */
export function useRoles() {
    // Estado para lista de funções
    const [roles, setRoles] = useState<Role[]>([]);
    // Estado de carregamento
    const [loading, setLoading] = useState<boolean>(true);
    // Estado de erro
    const [error, setError] = useState<string | null>(null);

    // Efeito para buscar funções na montagem
    useEffect(() => {
        // Função para buscar funções
        const fetchRoles = async () => {
            try {
                // Inicia carregamento
                setLoading(true);
                // Busca dados
                const data = await roleService.getAll();
                // Define funções
                setRoles(data);
                // Limpa erro
                setError(null);
            } catch (err) {
                // Define erro
                setError((err as Error).message);
            } finally {
                // Finaliza carregamento
                setLoading(false);
            }
        };

        // Chama função
        fetchRoles();
    }, []);

    // Retorna estado
    return { roles, loading, error };
}
