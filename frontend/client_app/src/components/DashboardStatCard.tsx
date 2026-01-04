import type { ReactNode } from 'react';
import '../styles/DashboardStatCard.css';

/**
 * Props para o componente DashboardStatCard
 */
interface DashboardStatCardProps {
    /**
     * Ícone a ser exibido no card (componente React)
     */
    icon: ReactNode;
    
    /**
     * Título do card (ex: "Veículos Registrados")
     */
    title: string;
    
    /**
     * Valor principal a ser exibido (ex: 3)
     */
    value: string | number;
    
    /**
     * Descrição ou informação adicional (opcional)
     */
    description?: string;
    
    /**
     * Cor de destaque para o ícone (opcional, padrão: vermelho)
     */
    color?: 'red' | 'blue' | 'green' | 'orange';
    
    /**
     * Função callback ao clicar no card (opcional)
     */
    onClick?: () => void;
}

/**
 * Componente de card para exibir estatísticas no dashboard
 * Segue o padrão visual das outras páginas do projeto
 */
export function DashboardStatCard({
    icon,
    title,
    value,
    description,
    color = 'red',
    onClick,
}: DashboardStatCardProps) {
    return (
        <div 
            className={`dashboard-stat-card ${onClick ? 'clickable' : ''}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className={`stat-card-header stat-card-header-${color}`}>
                <div className="stat-icon">
                    {icon}
                </div>
            </div>
            
            <div className="stat-card-body">
                <h3 className="stat-title">{title}</h3>
                <div className="stat-value">{value}</div>
                {description && (
                    <p className="stat-description">{description}</p>
                )}
            </div>
        </div>
    );
}
