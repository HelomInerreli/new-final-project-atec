import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getInvoiceByAppointment } from "../services/invoiceService";

interface PaymentStatus {
  showSuccess: boolean;
  showCancelled: boolean;
  appointmentId: number | null;
  invoiceNumber: string | null;
}

export const usePaymentStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>({
    showSuccess: false,
    showCancelled: false,
    appointmentId: null,
    invoiceNumber: null,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get("payment");
    const appointmentId = params.get("appointment");

    console.log("🔍 Payment status check:", {
      payment,
      appointmentId,
      pathname: location.pathname,
      search: location.search,
    });

    if (payment === "success" && appointmentId) {
      console.log("✅ Payment success detected, confirming payment...");

      // Primeiro confirma o pagamento no backend, depois busca a invoice
      const confirmAndFetchInvoice = async () => {
        let retries = 5;
        let delay = 1000; // 1 segundo

        while (retries > 0) {
          try {
            console.log(`📡 Confirming payment (attempt ${6 - retries}/5)...`);

            // Chamar o endpoint de confirmação de pagamento
            const confirmResponse = await fetch(
              `http://localhost:8000/api/v1/payments/confirm-payment/${appointmentId}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (!confirmResponse.ok) {
              throw new Error(
                `Failed to confirm payment: ${confirmResponse.status}`
              );
            }

            const confirmData = await confirmResponse.json();
            console.log("✅ Payment confirmed:", confirmData);

            // Agora buscar a invoice
            console.log("📡 Fetching invoice...");
            const invoice = await getInvoiceByAppointment(
              parseInt(appointmentId)
            );

            console.log("✅ Invoice fetched successfully:", invoice);
            setStatus({
              showSuccess: true,
              showCancelled: false,
              appointmentId: parseInt(appointmentId),
              invoiceNumber:
                invoice.invoiceNumber || confirmData.invoice_number || null,
            });
            return; // Sucesso, sai do loop
          } catch (error) {
            console.warn(
              `⚠️ Failed to confirm payment/fetch invoice (${
                retries - 1
              } retries left):`,
              error
            );
            retries--;

            if (retries > 0) {
              console.log(`⏳ Waiting ${delay}ms before retry...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
              delay *= 1.5; // Exponential backoff
            } else {
              // Último retry falhou, mostra modal sem invoice number
              console.log(
                "❌ All retries exhausted, showing modal without invoice number"
              );
              setStatus({
                showSuccess: true,
                showCancelled: false,
                appointmentId: parseInt(appointmentId),
                invoiceNumber: null,
              });
            }
          }
        }
      };

      confirmAndFetchInvoice();
    } else if (payment === "cancelled") {
      console.log("❌ Payment cancelled detected");
      setStatus({
        showSuccess: false,
        showCancelled: true,
        appointmentId: null,
        invoiceNumber: null,
      });
    }
  }, [location.search, location.pathname]);

  const clearStatus = () => {
    console.log("🧹 Clearing payment status and removing query params");
    setStatus({
      showSuccess: false,
      showCancelled: false,
      appointmentId: null,
      invoiceNumber: null,
    });

    // Remove query params da URL
    const params = new URLSearchParams(location.search);
    params.delete("payment");
    params.delete("appointment");

    const newSearch = params.toString();
    const newUrl = {
      pathname: location.pathname,
      search: newSearch ? `?${newSearch}` : "",
    };

    console.log("📍 Navigating to:", newUrl);
    navigate(newUrl, { replace: true });
  };

  return { ...status, clearStatus };
};
