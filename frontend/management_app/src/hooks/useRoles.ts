import { useState, useEffect } from 'react';
import { roleService } from '../services/roleService';
import type { Role } from '../interfaces/Role';

export function useRoles() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true);
                const data = await roleService.getAll();
                setRoles(data);
                setError(null);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    return { roles, loading, error };
}
