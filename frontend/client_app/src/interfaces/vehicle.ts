

/**
 * Interface principal para representação de um veículo
 * Contém todos os dados de um veículo incluindo identificação e quilometragem
 * Utilizada para exibir e gerir veículos do cliente
 */
export interface Vehicle {
    /** ID único do veículo (opcional em criação, definido pela API) */
    id?: number;
    /** Matrícula do veículo */
    plate: string;
    /** Marca do veículo (ex: Mercedes, BMW, Audi) */
    brand: string;
    /** Modelo do veículo (ex: C220, 320d, A3) */
    model: string;
    /** Quilometragem atual do veículo */
    kilometers: number;
    /** ID do cliente proprietário do veículo */
    customer_id: number;
    /** Data de eliminação lógica (soft delete) - null se veículo ativo */
    deleted_at?: string | null;
}

/**
 * Interface para criação de um novo veículo
 * Contém apenas campos obrigatórios para criar veículo na API
 * Não inclui id (gerado automaticamente) nem deleted_at
 */
export interface VehicleCreate {
    /** Matrícula do veículo */
    plate: string;
    /** Marca do veículo */
    brand: string;
    /** Modelo do veículo */
    model: string;
    /** Quilometragem inicial do veículo */
    kilometers: number;
    /** ID do cliente proprietário */
    customer_id: number;
}

/**
 * Interface para atualização parcial de dados de um veículo
 * Todos os campos são opcionais - apenas campos fornecidos serão atualizados
 * Não permite alterar customer_id por questões de segurança
 */
export interface VehicleUpdate {
    /** Nova matrícula (opcional) */
    plate?: string;
    /** Nova marca (opcional) */
    brand?: string;
    /** Novo modelo (opcional) */
    model?: string;
    /** Nova quilometragem (opcional) */
    kilometers?: number;
}

/**
 * Props para componente VehicleCard
 * Define propriedades para renderizar card de veículo com ações de edição e eliminação
 */
export interface VehicleCardProps {
    /** Objeto do veículo a ser exibido no card */
    vehicle: Vehicle;
    /** Callback opcional executado ao editar veículo */
    onEdit?: (vehicle: Vehicle) => void;
    /** Callback opcional executado ao eliminar veículo */
    onDelete?: (vehicleId: number) => void;
}

/**
 * Props para componente VehicleModal
 * Modal para criar novo veículo ou editar veículo existente
 * Se vehicle for null/undefined, modal abre em modo de criação
 */
export interface VehicleModalProps {
    /** Flag de controle de visibilidade do modal */
    show: boolean;
    /** Veículo a ser editado (null/undefined para criar novo) */
    vehicle?: Vehicle | null;
    /** ID do cliente proprietário (usado ao criar novo veículo) */
    customerId: number;
    /** Callback executado ao fechar o modal */
    onClose: () => void;
    /** Callback assíncrono executado ao salvar veículo (criar ou atualizar) */
    onSave: (vehicle: Vehicle) => Promise<void>;
}