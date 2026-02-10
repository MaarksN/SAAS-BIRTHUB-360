export const createLogEntry = (actionDescription: string): string => {
  const timestamp = new Date().toLocaleString('pt-BR');
  return `${timestamp}: ${actionDescription}`;
};
