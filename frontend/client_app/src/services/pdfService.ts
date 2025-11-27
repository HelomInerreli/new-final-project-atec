import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateInvoicePDF = async (elementId: string, invoiceNumber: string) => {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error('Invoice element not found');
        }

        // Ocultar botões antes de gerar PDF
        const actionsDiv = element.querySelector('.invoice-actions') as HTMLElement;
        if (actionsDiv) {
            actionsDiv.style.display = 'none';
        }

        // Capturar o elemento como imagem
        const canvas = await html2canvas(element, {
            scale: 2, // Melhor qualidade
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        // Mostrar botões novamente
        if (actionsDiv) {
            actionsDiv.style.display = '';
        }

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Definir margens (em mm)
        const margin = 10; // 10mm de margem em todos os lados
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgWidth = pageWidth - (2 * margin); // Largura da imagem considerando margens
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = margin; // Começa com margem superior

        // Adicionar primeira página
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 2 * margin);

        // Adicionar páginas extras se necessário
        while (heightLeft > 0) {
            position = margin - (imgHeight - heightLeft);
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - 2 * margin);
        }

        // Download do PDF
        pdf.save(`Fatura_${invoiceNumber}.pdf`);
        
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};