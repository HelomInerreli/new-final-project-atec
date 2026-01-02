import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Gera PDF de fatura a partir de elemento HTML
 * Captura elemento via html2canvas, converte para imagem e gera PDF com jsPDF
 * Oculta botões de ação antes de capturar, adiciona margens de 10mm
 * Suporta múltiplas páginas se conteúdo exceder altura A4
 * @param elementId - ID do elemento HTML contendo a fatura
 * @param invoiceNumber - Número da fatura para nome do ficheiro (ex: "2025-001")
 * @returns Promise<boolean> - true se PDF gerado com sucesso
 * @throws Error se elemento não for encontrado ou falhar geração do PDF
 */
export const generateInvoicePDF = async (elementId: string, invoiceNumber: string) => {
    try {
        // Buscar elemento HTML da fatura
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error('Invoice element not found');
        }

        // Ocultar botões de ação antes de capturar imagem
        const actionsDiv = element.querySelector('.invoice-actions') as HTMLElement;
        if (actionsDiv) {
            actionsDiv.style.display = 'none';
        }

        // Capturar elemento como imagem PNG de alta qualidade
        const canvas = await html2canvas(element, {
            scale: 2, // Melhor qualidade
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        // Restaurar visibilidade dos botões
        if (actionsDiv) {
            actionsDiv.style.display = '';
        }

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Definir margens e dimensões (formato A4: 210mm x 297mm)
        const margin = 10; // 10mm de margem em todos os lados
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgWidth = pageWidth - (2 * margin); // Largura da imagem considerando margens
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = margin; // Começa com margem superior

        // Adicionar primeira página com imagem
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 2 * margin);

        // Adicionar páginas extras se conteúdo exceder uma página
        while (heightLeft > 0) {
            position = margin - (imgHeight - heightLeft);
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - 2 * margin);
        }

        // Fazer download do PDF com nome formatado
        pdf.save(`Fatura_${invoiceNumber}.pdf`);
        
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};