export interface LeadCSV {
  id: string;
  companyName: string;
  sector: string;
  location: string;
  score: number;
  status: string;
  createdAt: string;
  tags: string[];
}

export const parseLeadsFromCSV = (file: File): Promise<LeadCSV[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');

      // Mapeamento e Limpeza
      const newLeads = lines.slice(1).map((line) => {
        const cols = line.split(',');
        if (cols.length < 2) return null; // Ignora linhas vazias

        return {
          id: crypto.randomUUID(),
          companyName: cols[0]?.replace(/"/g, '').trim() || 'Sem Nome',
          sector: cols[1]?.replace(/"/g, '').trim() || 'Geral',
          location: cols[2]?.replace(/"/g, '').trim() || 'Brasil',
          score: 50,
          status: 'new',
          createdAt: new Date().toISOString(),
          tags: ['importado-csv']
        } as LeadCSV;
      }).filter((item): item is LeadCSV => Boolean(item));

      resolve(newLeads);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
