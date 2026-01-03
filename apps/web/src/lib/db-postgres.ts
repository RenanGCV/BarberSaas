// Stub file para compatibilidade - a API real está no backend NestJS
// Este arquivo existe apenas para evitar erros de build no Next.js
// Todas as chamadas de banco de dados devem ir para a API externa

import { API_URL } from './api';

// Tipo para consultas SQL mock
type SqlQuery = {
  text: string;
  values?: any[];
};

// Função mock que redireciona para API
export const sql = async <T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<{ rows: T[] }> => {
  console.warn(
    'Direct database access is deprecated. Use the API instead at:',
    API_URL
  );
  
  // Retorna array vazio - todas as operações devem usar a API REST
  return { rows: [] };
};

// Query mock
export const query = async <T = any>(
  text: string,
  values?: any[]
): Promise<{ rows: T[] }> => {
  console.warn(
    'Direct database access is deprecated. Use the API instead at:',
    API_URL
  );
  
  return { rows: [] };
};

export default { sql, query };
