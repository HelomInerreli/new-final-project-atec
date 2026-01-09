/**
 * Formata uma string de mês/ano para exibir as 3 primeiras letras do mês
 * @param monthYear - String no formato "dezembro 2025" ou "dezembro de 2025" (mês em português)
 * @returns String formatada com 3 letras do mês em maiúsculas, ex: "DEZ 2025"
 */
export function formatMonthYear(monthYear: string): string {
  // Remove "de" ou "De" do meio se existir: "dezembro de 2025" -> "dezembro 2025"
  const normalized = monthYear.trim().replace(/\s+[dD]e\s+/g, ' ');
  
  // Divide a string em partes: ["dezembro", "2025"]
  const parts = normalized.split(' ');
  
  if (parts.length !== 2) {
    // Se o formato não for o esperado, retorna o original
    return monthYear;
  }
  
  const [month, year] = parts;
  
  // Retorna as 3 primeiras letras do mês em maiúsculas + ano
  // Exemplo: "dezembro de 2025" -> "DEZ 2025"
  const shortMonth = month.substring(0, 3).toUpperCase();
  
  return `${shortMonth} ${year}`;
}
