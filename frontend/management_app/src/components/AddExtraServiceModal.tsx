import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import Select from './Select';
import Input from './Input';
import TextArea from './TextArea';
import { toast } from '../hooks/use-toast';
import http from '../api/http';
import '../styles/AddExtraServiceModal.css';

interface ExtraService {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
}

interface AddExtraServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

export default function AddExtraServiceModal({
  isOpen,
  onClose,
  orderId,
  onSuccess,
}: AddExtraServiceModalProps) {
  const [catalog, setCatalog] = useState<ExtraService[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Modo: 'catalog' para escolher do catálogo, 'custom' para criar personalizado
  const [mode, setMode] = useState<'catalog' | 'custom'>('catalog');
  
  // Para modo catálogo
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  
  // Para modo personalizado
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customDuration, setCustomDuration] = useState('');

  // Buscar catálogo de serviços extras
  useEffect(() => {
    if (isOpen) {
      fetchCatalog();
    }
  }, [isOpen]);

  const fetchCatalog = async () => {
    try {
      setLoadingCatalog(true);
      const response = await http.get('/extra_services/catalog');
      setCatalog(response.data);
    } catch (error) {
      console.error('Erro ao buscar catálogo de serviços extras:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o catálogo de serviços.',
        variant: 'destructive',
      });
    } finally {
      setLoadingCatalog(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'catalog' && !selectedServiceId) {
      toast({
        title: 'Atenção',
        description: 'Selecione um serviço do catálogo.',
        variant: 'destructive',
      });
      return;
    }
    
    if (mode === 'custom') {
      if (!customName || !customPrice) {
        toast({
          title: 'Atenção',
          description: 'Preencha o nome e preço do serviço.',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      setSubmitting(true);
      
      const payload = mode === 'catalog'
        ? {
            extra_service_id: parseInt(selectedServiceId),
          }
        : {
            name: customName,
            description: customDescription || undefined,
            price: parseFloat(customPrice),
            duration_minutes: customDuration ? parseInt(customDuration) : undefined,
          };

      await http.post(`/appointments/${orderId}/extra_services`, payload);
      
      toast({
        title: 'Sucesso!',
        description: 'Proposta de serviço extra enviada ao cliente.',
      });
      
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao adicionar serviço extra:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.detail || 'Não foi possível adicionar o serviço extra.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setMode('catalog');
    setSelectedServiceId('');
    setCustomName('');
    setCustomDescription('');
    setCustomPrice('');
    setCustomDuration('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedService = catalog.find(s => s.id.toString() === selectedServiceId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="add-extra-service-modal">
        <DialogHeader>
          <DialogTitle>Propor Serviço Extra</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Seletor de Modo */}
            <div className="mode-selector">
              <button
                type="button"
                className={`mode-btn ${mode === 'catalog' ? 'active' : ''}`}
                onClick={() => setMode('catalog')}
              >
                <i className="bi bi-list-ul me-2"></i>
                Do Catálogo
              </button>
              <button
                type="button"
                className={`mode-btn ${mode === 'custom' ? 'active' : ''}`}
                onClick={() => setMode('custom')}
              >
                <i className="bi bi-pencil-square me-2"></i>
                Personalizado
              </button>
            </div>

            {mode === 'catalog' ? (
              <div className="catalog-mode">
                <Select
                  label="Selecionar Serviço"
                  value={selectedServiceId}
                  onChange={(value) => setSelectedServiceId(value)}
                  options={[
                    { value: '', label: loadingCatalog ? 'Carregando...' : 'Escolha um serviço' },
                    ...catalog.map((service) => ({
                      value: service.id.toString(),
                      label: `${service.name} - €${service.price.toFixed(2)}`,
                    })),
                  ]}
                />

                {selectedService && (
                  <div className="service-preview">
                    <h6 className="preview-title">Detalhes do Serviço</h6>
                    <div className="preview-content">
                      <p><strong>Nome:</strong> {selectedService.name}</p>
                      {selectedService.description && (
                        <p><strong>Descrição:</strong> {selectedService.description}</p>
                      )}
                      <p><strong>Preço:</strong> €{selectedService.price.toFixed(2)}</p>
                      {selectedService.duration_minutes && (
                        <p><strong>Duração estimada:</strong> {selectedService.duration_minutes} min</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="custom-mode">
                <Input
                  label="Nome do Serviço"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: Troca de óleo adicional"
                />

                <TextArea
                  label="Descrição"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={3}
                />

                <div className="input-row">
                  <Input
                    label="Preço (€)"
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="0.00"
                  />

                  <Input
                    label="Duração (min)"
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="Ex: 30"
                  />
                </div>
              </div>
            )}

            <div className="alert alert-info mt-3">
              <i className="bi bi-info-circle me-2"></i>
              <small>
                O cliente receberá um email com a proposta e poderá aprová-la ou recusá-la na aplicação.
              </small>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || loadingCatalog} className="bg-red-600 hover:bg-red-700 text-white">
              {submitting ? 'Enviando...' : 'Enviar Proposta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
