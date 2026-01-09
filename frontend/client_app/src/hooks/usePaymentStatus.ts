import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface PaymentStatus {
  showSuccess: boolean;
  showCancelled: boolean;
  appointmentId: number | null;
}

export const usePaymentStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>({
    showSuccess: false,
    showCancelled: false,
    appointmentId: null,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get('payment');
    const appointmentId = params.get('appointment');

    if (payment === 'success' && appointmentId) {
      setStatus({
        showSuccess: true,
        showCancelled: false,
        appointmentId: parseInt(appointmentId),
      });
    } else if (payment === 'cancelled') {
      setStatus({
        showSuccess: false,
        showCancelled: true,
        appointmentId: null,
      });
    }
  }, [location.search]);

  const clearStatus = () => {
    setStatus({
      showSuccess: false,
      showCancelled: false,
      appointmentId: null,
    });
    
    // Remove query params da URL
    const params = new URLSearchParams(location.search);
    params.delete('payment');
    
    const newSearch = params.toString();
    navigate({
      pathname: location.pathname,
      search: newSearch ? `?${newSearch}` : '',
    }, { replace: true });
  };

  return { ...status, clearStatus };
};