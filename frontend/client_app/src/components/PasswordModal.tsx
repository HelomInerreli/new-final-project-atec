import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

/**
 * Interface para as props do componente PasswordModal
 * @property isOpen - Estado de visibilidade do modal
 * @property onClose - Função callback para fechar o modal
 * @property onSubmit - Função callback para submeter os dados da palavra-passe
 * @property isCreating - Indica se está a criar nova palavra-passe ou a alterar existente
 * @property loading - Estado de carregamento durante submissão
 */
interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (passwordData: { currentPassword?: string; newPassword: string }) => Promise<void>;
    isCreating: boolean;
    loading: boolean;
}

/**
 * Modal para criação ou alteração de palavra-passe
 * Valida comprimento mínimo (6 caracteres) e confirmação de palavra-passe
 * Modo duplo: criar palavra-passe (novo utilizador) ou alterar palavra-passe existente
 * @param isOpen - Estado de visibilidade do modal
 * @param onClose - Função para fechar o modal
 * @param onSubmit - Função para processar a submissão
 * @param isCreating - Define se é criação ou alteração
 * @param loading - Estado de carregamento
 * @returns Componente JSX do modal
 */
const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
  loading
}) => {
  /**
   * Estado para armazenar a palavra-passe atual (apenas em modo alteração)
   * Tipo: string
   * Inicial: string vazia
   */
  const [currentPassword, setCurrentPassword] = useState('');
  
  /**
   * Estado para armazenar a nova palavra-passe
   * Tipo: string
   * Inicial: string vazia
   */
  const [newPassword, setNewPassword] = useState('');
  
  /**
   * Estado para confirmação da nova palavra-passe
   * Tipo: string
   * Inicial: string vazia
   */
  const [confirmPassword, setConfirmPassword] = useState('');
  
  /**
   * Estado para armazenar mensagens de erro de validação
   * Tipo: string
   * Inicial: string vazia
   */
  const [error, setError] = useState('');
  
  /**
   * Hook de tradução para internacionalização
   */
  const { t } = useTranslation();

  /**
   * Limpa todos os campos do formulário e mensagens de erro
   * Restaura o estado inicial do modal
   */
  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  /**
   * Fecha o modal e limpa o formulário
   * Chama a função onClose fornecida pelas props
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /**
   * Processa a submissão do formulário com validações
   * Valida comprimento mínimo, confirmação e palavra-passe atual (se necessário)
   * @param e - Evento de submissão do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword.length < 6) {
      setError(t('passwordModal.minLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwordModal.mismatch'));
      return;
    }

    if (!isCreating && !currentPassword) {
      setError(t('passwordModal.requiredCurrent'));
      return;
    }

    try {
      const passwordData = isCreating 
        ? { newPassword }
        : { currentPassword, newPassword };
      
      await onSubmit(passwordData);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || t('passwordModal.error'));
    }
  };

  return (
    <Modal show={isOpen} onHide={handleClose} centered>
      {/* Cabeçalho do modal com título dinâmico */}
      <Modal.Header closeButton>
        <Modal.Title>
          {isCreating ? t('passwordModal.titleCreate') : t('passwordModal.titleChange')}
        </Modal.Title>
      </Modal.Header>
      {/* Corpo do modal com formulário */}
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Alerta de erro (exibido apenas se houver erro) */}
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {/* Campo de palavra-passe atual (apenas em modo alteração) */}
          {!isCreating && (
            <Form.Group className="mb-5">
              <Form.Label htmlFor="currentPassword">{t('passwordModal.current')}</Form.Label>
              <Form.Control
                type="password"
                id="currentPassword"
                placeholder={t('passwordModal.placeholderCurrent')}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required={!isCreating}
                disabled={loading}
              />
            </Form.Group>
          )}

          {/* Campo de nova palavra-passe */}
          <Form.Group className="mb-3">
            <Form.Label htmlFor="newPassword">
              {isCreating ? t('passwordModal.new') : t('passwordModal.new')}
            </Form.Label>
            <Form.Control
              type="password"
              id="newPassword"
              placeholder={t('passwordModal.placeholderNew')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
            <Form.Text className="text-muted">
              {t('passwordModal.minLength')}
            </Form.Text>
          </Form.Group>

          {/* Campo de confirmação da palavra-passe */}
          <Form.Group className="mb-3">
            <Form.Label htmlFor="confirmPassword">{t('passwordModal.confirm')}</Form.Label>
            <Form.Control
              type="password"
              id="confirmPassword"
              placeholder={t('passwordModal.placeholderConfirm')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>

          {/* Botões de ação */}
          <div className="d-grid gap-2">
            {/* Botão de submissão com spinner durante carregamento */}
            <Button 
              type="submit" 
              variant="dark" 
              className="red-hover-btn"
              disabled={loading}
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
                  {t('passwordModal.processing')}
                </>
              ) : (
                isCreating ? t('passwordModal.titleCreate') : t('passwordModal.titleChange')
              )}
            </Button>
            
            {/* Botão de cancelamento */}
            <Button 
              type="button" 
              variant="outline-secondary" 
              onClick={handleClose}
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

export default PasswordModal;