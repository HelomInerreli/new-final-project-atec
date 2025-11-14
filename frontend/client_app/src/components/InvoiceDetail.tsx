import { useInvoice } from '../hooks/useInvoice';
import { formatCurrency, formatDate } from '../utils/formatters';
import { generateInvoicePDF } from '../services/pdfService';
import '../styles/invoiceDetail.css';

interface InvoiceDetailProps {
    appointmentId: number;
}



export function InvoiceDetail({ appointmentId }: InvoiceDetailProps) {
    const { invoice, loading, error } = useInvoice(appointmentId);

    const handleDownloadPDF = async () => {
        if (!invoice) return;
        
        try {
            await generateInvoicePDF('invoice-content', invoice.invoiceNumber);
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar PDF da fatura');
        }
    };

    if (loading) {
        return (
            <div className="invoice-loading">
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">A carregar...</span>
                </div>
                <p>A carregar fatura...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="invoice-error">
                <div className="error-icon">❌</div>
                <h3>Erro ao carregar fatura</h3>
                <p>{error || 'Failed to fetch invoice'}</p>
                <small>Esta fatura pode ainda não ter sido gerada. Certifique-se de que o pagamento foi concluído.</small>
            </div>
        );
    }

    return (
        <div className="invoice-detail-container">
            <div className="invoice-content" id="invoice-content">
                {/* Company Info */}
                <div className="company-info">
                    <div className="invoice-title-section">
                        <h1>MECATEC</h1>
                    </div>
                    <p>Serviços Automotivos</p>
                    <p>Rua da Oficina, 123</p>
                    <p>4000-000 Porto, Portugal</p>
                    <p>Tel: +351 220 000 000</p>
                    <p>Email: info@mecatec.pt</p>
                </div>

                {/* Client Info */}
                <div className="client-info">
                    <h3>Cliente</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-value">{invoice.clientName || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Fatura Nº:</span>
                            <span className="info-value">{invoice.invoiceNumber}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-value">{invoice.clientAddress || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Data de Emissão:</span>
                            <span className="info-value">{formatDate(invoice.appointmentDate)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-value">{invoice.clientPhone || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Data de Vencimento:</span>
                            <span className="info-value">{formatDate(invoice.dueDate)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-value">{invoice.clientEmail || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            {invoice.vehicle && (
                                <>
                                    <span className="info-label">Veículo:</span>
                                    <span className="info-value">{invoice.vehicle}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Services Table */}
                <div className="services-table">
                    <h3>Serviços Prestados</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Descrição</th>
                                <th>Qtd</th>
                                <th>Preço Unit.</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items && invoice.items.length > 0 ? (
                                invoice.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="item-description">
                                                <strong>{item.description || 'Serviço'}</strong>
                                            </div>
                                        </td>
                                        <td className="text-center">{item.quantity || 1}</td>
                                        <td className="text-right">{formatCurrency(item.unitPrice || 0)}</td>
                                        <td className="text-right">{formatCurrency(item.total || 0)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center">Nenhum serviço encontrado</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="invoice-totals">
                    <div className="totals-row">
                        <span className="totals-label">Subtotal:</span>
                        <span className="totals-value">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.tax > 0 && (
                        <div className="totals-row">
                            <span className="totals-label">IVA (23%):</span>
                            <span className="totals-value">{formatCurrency(invoice.tax)}</span>
                        </div>
                    )}
                    <div className="totals-row total-final">
                        <span className="totals-label">Total:</span>
                        <span className="totals-value">{formatCurrency(invoice.total)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="invoice-footer">
                    <p>Obrigado pela sua preferência! Para questões sobre esta fatura, contacte-nos através do email info@mecatec.pt ou telefone +351 220 000 000</p>
                </div>

                {/* Action Button */}
                <div className="invoice-actions">
                    <button className="btn-download-pdf" onClick={handleDownloadPDF}>
                        📥 Descarregar PDF
                    </button>
                </div>
            </div>
        </div>
    );
}