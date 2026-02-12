import { jsPDF } from "jspdf";

export const generateProposal = (lead: { companyName: string; sector: string; }) => {
   const doc = new jsPDF();

   // Cabeçalho
   doc.setFontSize(22);
   doc.setTextColor(40, 40, 40);
   doc.text(`Proposta Comercial`, 20, 20);

   // Conteúdo
   doc.setFontSize(12);
   doc.text(`Cliente: ${lead.companyName}`, 20, 40);
   doc.text(`Data: ${new Date().toLocaleDateString()}`, 20, 50);

   doc.setDrawColor(200, 200, 200);
   doc.line(20, 55, 190, 55); // Linha separadora

   doc.text(`Resumo da Solução:`, 20, 70);
   doc.setFont("helvetica", "italic");
   doc.text(`Implementação de sistema de IA para o setor de ${lead.sector}.`, 20, 80);

   doc.save(`Proposta_${lead.companyName.replace(/ /g, '_')}.pdf`);
};
