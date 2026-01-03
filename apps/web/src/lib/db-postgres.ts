// Stub file para compatibilidade - a API real está no backend NestJS
// Este arquivo existe apenas para evitar erros de build no Next.js
// Todas as chamadas de banco de dados devem ir para a API externa

import { API_URL } from './api';

// Tipo para consultas SQL
type SqlQuery = {
  text: string;
  values?: any[];
};

// Função stub que redireciona para API
export const sql = async <T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<{ rows: T[] }> => {
  // Todas as operações devem usar a API REST
  return { rows: [] };
};

// Query stub
export const query = async <T = any>(
  text: string,
  values?: any[]
): Promise<{ rows: T[] }> => {
  // Todas as operações devem usar a API REST
  return { rows: [] };
};

export default { sql, query };
