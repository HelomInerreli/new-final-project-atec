import React, { useState, useEffect } from 'react';
import { type GoogleAuthData, type FacebookAuthData } from '../api/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

/**
 * Interface para as props do modal de informações do cliente
 * @property isOpen - Estado de visibilidade do modal
 * @property onClose - Função callback para fechar o modal
 * @property onSubmit - Função callback para submeter os dados do cliente
 * @property googleData - Dados de autenticação do Google (opcional)
 * @property facebookData - Dados de autenticação do Facebook (opcional)
 * @property email - Email do utilizador (opcional)
 * @property loading - Estado de carregamento durante submissão
 */
interface CustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerInfo) => void;
  googleData?: GoogleAuthData | null;
  facebookData?: FacebookAuthData | null;
  email?: string;
  loading: boolean;
}

/**
 * Interface para dados de informação do cliente
 * @property name - Nome completo do cliente
 * @property phone - Número de telefone (opcional)
 * @property address - Morada (opcional)
 * @property city - Cidade (opcional)
 * @property postal_code - Código postal (opcional)
 * @property country - País (opcional)
 * @property birth_date - Data de nascimento no formato YYYY-MM-DD (opcional)
 */
interface CustomerInfo {
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
}

/**
 * Modal para recolher informações adicionais do cliente durante o registo
 * Suporta pré-preenchimento com dados do Google/Facebook OAuth
 * Recolhe: nome, email, telefone, morada completa e data de nascimento
 * @param isOpen - Estado de visibilidade do modal
 * @param onClose - Função para fechar o modal
 * @param onSubmit - Função para processar submissão dos dados
 * @param googleData - Dados de autenticação Google (opcional)
 * @param facebookData - Dados de autenticação Facebook (opcional)
 * @param email - Email manual do utilizador (opcional)
 * @param loading - Estado de carregamento
 * @returns Componente JSX do modal
 */
const CustomerInfoModal: React.FC<CustomerInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  googleData,
  facebookData,
  email,
  loading
}) => {
  /**
   * Estado para mensagens de erro de validação
   * Tipo: string
   * Inicial: string vazia
   */
  const [error, setError] = useState('');
  
  /**
   * Estado para a data selecionada no DatePicker
   * Tipo: Date | null
   * Inicial: null (nenhuma data selecionada)
   */
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  /**
   * Estado para os dados do formulário de informações do cliente
   * Tipo: CustomerInfo (nome, telefone, morada, cidade, código postal, país, data de nascimento)
   * Inicial: objeto com campos vazios
   */
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    birth_date: ''
  });

  /**
   * Hook de tradução para internacionalização
   */
  const { t } = useTranslation();

  /**
   * Efeito para pré-preencher formulário com dados de OAuth (Google ou Facebook)
   * Executa quando googleData ou facebookData estão disponíveis
   * Preenche automaticamente o campo nome com dados da autenticação social
   */
  useEffect(() => {
    if (googleData) {
      setFormData(prev => ({
        ...prev,
        name: googleData.name || ''
      }));
    } else if (facebookData) {
      setFormData(prev => ({
        ...prev,
        name: facebookData.name || ''
      }));
    }
  }, [googleData, facebookData]);

  /**
   * Processa a submissão do formulário com validação
   * Valida que o nome foi preenchido antes de submeter
   * @param e - Evento de submissão do formulário
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError(`${t('name')} ${t('is')} ${t('required')}`);
      return;
    }

    
    setError(''); // Clear any previous errors
    onSubmit(formData); // Submit the updated form data with the date
  };

  /**
   * Gere alterações nos campos de input do formulário
   * Atualiza o estado formData com o novo valor do campo
   * @param e - Evento de alteração do input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Gere alterações na seleção de data de nascimento
   * Converte a data para formato YYYY-MM-DD e atualiza formData
   * @param date - Data selecionada no DatePicker (ou null se limpo)
   */
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);

    let dateString = '';
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${day}`;
    }

    // Atualiza o formData com a string de data correta
    setFormData(prev => ({
      ...prev,
      birth_date: dateString
    }));
  };

  /**
   * Determina o email a exibir com base na prioridade: Google > Facebook > Manual
   * Email bloqueado se vier de autenticação OAuth
   */
  const displayEmail = googleData?.email || facebookData?.email || email || '';
  const isEmailDisabled = !!(googleData?.email || facebookData?.email);

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      {/* Cabeçalho do modal com título dinâmico baseado no método de autenticação */}
      <Modal.Header closeButton>
        <Modal.Title>
          {googleData ? 'Complete Google Registration' : 
           facebookData ? 'Complete Facebook Registration' : 
           'Complete Registration'}
        </Modal.Title>
      </Modal.Header>
      {/* Corpo do modal com formulário de informações do cliente */}
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Alerta de erro (exibido apenas se houver erro de validação) */}
          {error && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}
          
          {/* Alerta de sucesso para autenticação Google */}
          {googleData && (
            <Alert variant="success" className="mb-3">
              <small>✓ {t('successfully')} {t('authenticated')} {t('with')} {t('google')} {t('as')} {googleData.email}</small>
            </Alert>
          )}

          {/* Alerta de sucesso para autenticação Facebook */}
          {facebookData && (
            <Alert variant="info" className="mb-3">
              <small>✓ {t('successfully')} {t('authenticated')} {t('with')} {t('facebook')} {t('as')} {facebookData.name}</small>
            </Alert>
          )}
          
          {/* Campo de nome completo (pré-preenchido se OAuth) */}
          <Form.Group className="mb-3">
            <Form.Label htmlFor='name'>{t('fullName')}</Form.Label>
            <Form.Control
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              disabled={!!(googleData || facebookData) || loading}
              placeholder={t('enterFullName')}
            />
          </Form.Group>
          
          {/* Campo de email (bloqueado se vier de OAuth) */}
          <Form.Group className="mb-3">
            <Form.Label htmlFor='email'>{t('email')}</Form.Label>
            <Form.Control
              type="email"
              id="email"
              name="email"
              value={displayEmail}
              onChange={() => {}}
              disabled={isEmailDisabled || loading}
              placeholder={t('enterEmail')}
              required
            />
            {isEmailDisabled && (
              <Form.Text className="text-muted">
                {t('email')} {t('from')} {googleData ? 'Google' : 'Facebook'} {t('authentication')}
              </Form.Text>
            )}
          </Form.Group>
          
          {/* Campo de número de telefone (opcional) */}
          <Form.Group className="mb-3">
            <Form.Label htmlFor='phone'>{t('phoneNumber')}</Form.Label>
            <Form.Control
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              disabled={loading}
              placeholder={t('enterPhoneNumber')}
            />
          </Form.Group>
          
          {/* Campo de morada (opcional) */}
          <Form.Group className="mb-3">
            <Form.Label htmlFor='address'>{t('address')}</Form.Label>
            <Form.Control 
              type="text"
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              disabled={loading}
              placeholder={t('enterAddress')}
            />
          </Form.Group>
          
          {/* Campo de cidade (opcional) */}
          <Form.Group className="mb-3">
            <Form.Label htmlFor='city'>{t('city')}</Form.Label>
            <Form.Control
              type="text"
              id="city"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              disabled={loading}
              placeholder={t('enterCity')}
            />
          </Form.Group>
          
          {/* Campo de código postal (opcional) */}
          <Form.Group className="mb-3">
            <Form.Label htmlFor='postal_code'>{t('postalCode')}</Form.Label>
            <Form.Control
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code || ''}
              onChange={handleChange}
              disabled={loading}
              placeholder={t('enterPostalCode')}
            />
          </Form.Group>
          
          {/* Campo de país (opcional) */}
          <Form.Group className="mb-3">
            <Form.Label htmlFor='country'>{t('country')}</Form.Label>
            <Form.Control
              type="text"
              id="country"
              name="country"
              value={formData.country || ''}
              onChange={handleChange}
              disabled={loading}
              placeholder={t('enterCountry')}
            />
          </Form.Group>

          {/* Campo de data de nascimento com DatePicker (opcional) */}
          <Form.Group className="mb-3">
            <Form.Label>{t('birthDate')}</Form.Label>
            <div>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText={t('selectBirthDate')}
                showPopperArrow={false}
                maxDate={new Date()} 
                minDate={new Date(1924, 0, 1)} 
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                className="form-control"
                disabled={loading}
                popperPlacement="bottom-start"
                autoComplete="off"
                isClearable
                wrapperClassName="d-block" 
              />
            </div>
          </Form.Group>

          {/* Botões de ação */}
          <div className="d-grid gap-2">
            {/* Botão de submissão com spinner durante carregamento */}
            <Button 
              type="submit" 
              variant="dark" 
              disabled={loading}
              className="mb-2 red-hover-btn"
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {t('creating')} {t('account')}...
                </>
              ) : (
                t('completeRegistration')
              )}
            </Button>
            
            {/* Botão de cancelamento */}
            <Button 
              type="button" 
              variant="outline-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CustomerInfoModal;