import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import './../styles/RedButton.css';

/**
 * Interface para as propriedades do componente EditCustomerInfoModal
 * Define os callbacks e dados necessários para o modal de edição
 */
interface EditCustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerInfo) => void;
  initialData: CustomerInfo;
  loading: boolean;
}

/**
 * Interface para representação dos dados do cliente
 * Contém todos os campos editáveis do perfil do cliente
 */
interface CustomerInfo {
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birthDate?: string;
}

/**
 * Componente modal para editar informações do cliente
 * Permite editar nome, telefone, morada, cidade, código postal, país e data de nascimento
 * @param isOpen - Estado de abertura do modal
 * @param onClose - Função callback para fechar o modal
 * @param onSubmit - Função callback para submeter os dados editados
 * @param initialData - Dados iniciais do cliente para preencher o formulário
 * @param loading - Estado de carregamento durante a submissão
 * @returns Componente JSX do modal de edição
 */
const EditCustomerInfoModal: React.FC<EditCustomerInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading
}) => {
  /**
   * Hook de tradução para internacionalização
   */
  const { t } = useTranslation();

  /**
   * Estado para armazenar os dados do formulário
   * Tipo: CustomerInfo
   * Inicia com os dados iniciais fornecidos
   */
  const [formData, setFormData] = useState<CustomerInfo>(initialData);

  /**
   * Estado para armazenar a data selecionada no DatePicker
   * Tipo: Date | null
   * Inicia com a data de nascimento dos dados iniciais ou null
   */
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialData.birthDate ? new Date(initialData.birthDate) : null
  );

  /**
   * Estado para armazenar mensagens de erro de validação
   * Tipo: string
   * Inicia como string vazia (sem erro)
   */
  const [error, setError] = useState('');

  /**
   * Efeito para atualizar o formulário quando os dados iniciais ou estado do modal mudam
   * Reset dos campos ao abrir o modal com novos dados
   */
  useEffect(() => {
    setFormData(initialData);
    setSelectedDate(initialData.birthDate ? new Date(initialData.birthDate) : null);
  }, [initialData, isOpen]);

  /**
   * Função para manipular alterações nos campos de texto do formulário
   * Atualiza o estado do formData com o novo valor do campo
   * @param e - Evento de mudança do input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Função para manipular alterações na data de nascimento
   * Converte a data para formato ISO (YYYY-MM-DD) e atualiza o formData
   * @param date - Data selecionada no DatePicker ou null
   */
  const handleDateChange = (date: Date | null) => {

    setSelectedDate(date);

    let dateString = '';
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${day}`;
      setFormData(prev => ({
        ...prev,
        birth_date: dateString
      }));
    }
    };

  /**
   * Função para submeter o formulário de edição
   * Valida se o nome está preenchido antes de chamar o callback onSubmit
   * @param e - Evento de submit do formulário
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError(`${t('name')} ${t('is')} ${t('required')}`);
      return;
    }
    setError('');
    onSubmit(formData);
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      {/* Cabeçalho do modal com título e botão de fecho */}
      <Modal.Header closeButton>
        <Modal.Title>{t('profilePage.editProfile')}</Modal.Title>
      </Modal.Header>

      {/* Corpo do modal contendo o formulário de edição */}
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Alerta de erro de validação, exibido apenas se houver erro */}
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Campo de nome completo (obrigatório) */}
          <Form.Group className="mb-3">
            <Form.Label>{t('fullName')}</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </Form.Group>

          {/* Campo de número de telefone */}
          <Form.Group className="mb-3">
            <Form.Label>{t('phoneNumber')}</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>

          {/* Secção de morada */}
          <Form.Group className="mb-3">
            <Form.Label>{t('address')}</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>

          {/* Campo de cidade */}
          <Form.Group className="mb-3">
            <Form.Label>{t('city')}</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>

          {/* Campo de código postal */}
          <Form.Group className="mb-3">
            <Form.Label>{t('postalCode')}</Form.Label>
            <Form.Control
              type="text"
              name="postal_code"
              value={formData.postal_code || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>

          {/* Campo de país */}
          <Form.Group className="mb-3">
            <Form.Label>{t('country')}</Form.Label>
            <Form.Control
              type="text"
              name="country"
              value={formData.country || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>

          {/* Seletor de data de nascimento com calendário */}
          <Form.Group className="mb-3">
            <Form.Label>{t('birthDate')}</Form.Label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
              minDate={new Date(1924, 0, 1)}
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              className="form-control"
              disabled={loading}
              isClearable
            />
          </Form.Group>

          {/* Botões de ação: Guardar e Cancelar */}
          <div className="d-grid gap-2">
            <Button type="submit" variant="primary" disabled={loading} className="red-hover-btn">
              {loading ? <Spinner animation="border" size="sm" color="red"/> : t('save')}
            </Button>
            <Button type="button" variant="outline-secondary" onClick={onClose} disabled={loading}>
              {t('cancel')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditCustomerInfoModal;