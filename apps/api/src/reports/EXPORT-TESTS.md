# Reports Export - Testes Manuais

## 📋 Exportação de Relatórios (CSV e PDF)

### ✅ Funcionalidades Implementadas

1. **Relatório Financeiro** - JSON, CSV, PDF
2. **Relatório de Comissões** - JSON, CSV, PDF
3. **Relatório de Agendamentos** - JSON, CSV, PDF

---

## 🧪 Testes via Swagger

### Passo 1: Autenticação

```bash
POST /auth/login
{
  "email": "owner@barbershop.com",
  "password": "senha123"
}
```

Copiar o `accessToken` e usar no Swagger (botão "Authorize").

---

### Passo 2: Relatório Financeiro (JSON)

**Endpoint:** `GET /reports/financial`

**Params:**
```
startDate=2024-12-01
endDate=2024-12-31
format=json
```

**Resposta esperada:**
```json
{
  "summary": {
    "totalIncome": 15000,
    "totalExpense": 5000,
    "balance": 10000,
    "totalTransactions": 45,
    "period": "2024-12-01 a 2024-12-31"
  },
  "transactions": [...],
  "incomeByCategory": {...},
  "expenseByCategory": {...}
}
```

---

### Passo 3: Relatório Financeiro (CSV)

**Endpoint:** `GET /reports/financial`

**Params:**
```
startDate=2024-12-01
endDate=2024-12-31
format=csv
```

**Resposta esperada:**  
Arquivo CSV baixado: `relatorio-financeiro.csv`

**Conteúdo do CSV:**
```csv
Data,Tipo,Categoria,Descrição,Valor (R$),Método,Status
01/12/2024,Entrada,SERVICE,Corte de cabelo,50.00,CASH,COMPLETED
02/12/2024,Saída,SUPPLIES,Produtos de higiene,120.00,CARD,COMPLETED
```

---

### Passo 4: Relatório Financeiro (PDF)

**Endpoint:** `GET /reports/financial`

**Params:**
```
startDate=2024-12-01
endDate=2024-12-31
format=pdf
```

**Resposta esperada:**  
Arquivo PDF baixado: `relatorio-financeiro.pdf`

**Conteúdo do PDF:**
- Cabeçalho com título e período
- Resumo com totais
- Tabela de transações (data, tipo, descrição, valor)
- Rodapé com data de geração

---

### Passo 5: Relatório de Comissões (CSV)

**Endpoint:** `GET /reports/commissions`

**Params:**
```
month=12
year=2024
format=csv
```

**Resposta esperada:**  
Arquivo CSV baixado: `relatorio-comissoes.csv`

**Conteúdo do CSV:**
```csv
Barbeiro,Total de Serviços,Receita Total (R$),Taxa de Comissão (%),Comissão Total (R$)
João Silva,45,4500.00,20,900.00
Maria Santos,38,3800.00,15,570.00
```

---

### Passo 6: Relatório de Comissões (PDF)

**Endpoint:** `GET /reports/commissions`

**Params:**
```
month=12
year=2024
format=pdf
```

**Resposta esperada:**  
Arquivo PDF baixado: `relatorio-comissoes.pdf`

**Conteúdo do PDF:**
- Cabeçalho: "Relatório de Comissões - 12/2024"
- Resumo: Total de comissões, total de barbeiros
- Seção por barbeiro com detalhes

---

### Passo 7: Relatório de Agendamentos (CSV)

**Endpoint:** `GET /reports/appointments`

**Params:**
```
startDate=2024-12-01
endDate=2024-12-31
format=csv
```

**Resposta esperada:**  
Arquivo CSV baixado: `relatorio-agendamentos.csv`

**Conteúdo do CSV:**
```csv
Data/Hora,Cliente,Serviço,Barbeiro,Status,Valor (R$),Método de Pagamento
01/12/2024 14:00,Carlos Souza,Corte de cabelo,João Silva,COMPLETED,50.00,CASH
02/12/2024 16:30,Ana Paula,Barba,Maria Santos,CONFIRMED,30.00,CARD
```

---

### Passo 8: Relatório de Agendamentos (PDF)

**Endpoint:** `GET /reports/appointments`

**Params:**
```
startDate=2024-12-01
endDate=2024-12-31
format=pdf
```

**Resposta esperada:**  
Arquivo PDF baixado: `relatorio-agendamentos.pdf`

**Conteúdo do PDF:**
- Cabeçalho: "Relatório de Agendamentos"
- Resumo: Total, confirmados, cancelados, taxa de conclusão
- Tabela com todos os agendamentos

---

### Passo 9: Filtrar Relatório por Barbeiro

**Endpoint:** `GET /reports/commissions`

**Params:**
```
barberId=barber-uuid
month=12
year=2024
format=json
```

**Resposta esperada:**
Relatório de comissões apenas do barbeiro específico.

---

### Passo 10: Filtrar Agendamentos por Status

**Endpoint:** `GET /reports/appointments`

**Params:**
```
startDate=2024-12-01
endDate=2024-12-31
status=COMPLETED
format=csv
```

**Resposta esperada:**  
CSV contendo apenas agendamentos com status `COMPLETED`.

---

## 📊 Formatos Suportados

| Formato | Content-Type             | Extensão | Uso                              |
|---------|--------------------------|----------|----------------------------------|
| `json`  | `application/json`       | N/A      | Visualização em tela (padrão)    |
| `csv`   | `text/csv; charset=utf-8`| `.csv`   | Excel, Google Sheets, análise    |
| `pdf`   | `application/pdf`        | `.pdf`   | Impressão, compartilhamento      |

---

## 🛠️ Dependências Necessárias

### Instalar PDFKit:

```bash
cd apps/api
npm install pdfkit
npm install --save-dev @types/pdfkit
```

**Nota:** A implementação usa a biblioteca PDFKit para geração de PDFs.

---

## 📝 Estrutura dos Arquivos CSV

### Relatório Financeiro:
- **Colunas:** Data, Tipo, Categoria, Descrição, Valor (R$), Método, Status
- **Formato de data:** DD/MM/YYYY
- **Formato de valor:** R$ 0.00
- **Escape:** Campos com vírgulas são envolvidos em aspas

### Relatório de Comissões:
- **Colunas:** Barbeiro, Total de Serviços, Receita Total (R$), Taxa de Comissão (%), Comissão Total (R$)
- **Cálculo:** Comissão = Receita × (Taxa / 100)

### Relatório de Agendamentos:
- **Colunas:** Data/Hora, Cliente, Serviço, Barbeiro, Status, Valor (R$), Método de Pagamento
- **Walk-in:** Cliente sem cadastro aparece como "Walk-in"

---

## 🎨 Estrutura dos PDFs

### Layout:
- **Tamanho:** A4
- **Margem:** 50px
- **Fonte:** Helvetica

### Cabeçalho:
- Título (20pt, centralizado)
- Período (12pt, centralizado)

### Resumo:
- Seção com fundo cinza claro
- Métricas principais em negrito

### Tabela:
- Cabeçalho em negrito (9pt)
- Linhas alternadas (zebra striping)
- Paginação automática (nova página a cada 700px)

### Rodapé:
- Data de geração (8pt, centralizado)

---

## ✅ Checklist de Testes

- [ ] Relatório Financeiro JSON
- [ ] Relatório Financeiro CSV (verificar encoding UTF-8)
- [ ] Relatório Financeiro PDF (verificar layout)
- [ ] Relatório de Comissões JSON
- [ ] Relatório de Comissões CSV
- [ ] Relatório de Comissões PDF
- [ ] Relatório de Agendamentos JSON
- [ ] Relatório de Agendamentos CSV
- [ ] Relatório de Agendamentos PDF
- [ ] Filtrar por período (startDate/endDate)
- [ ] Filtrar por barbeiro específico
- [ ] Filtrar por status de agendamento
- [ ] Validar campos com vírgulas no CSV (devem ser escapados)
- [ ] Validar charset UTF-8 (acentos e caracteres especiais)
- [ ] Verificar paginação automática em PDFs longos

---

## 🔥 Uso no Frontend

### Download programático:

```typescript
// React/Next.js
const downloadReport = async (format: 'csv' | 'pdf') => {
  const response = await fetch(
    `/api/reports/financial?startDate=2024-12-01&endDate=2024-12-31&format=${format}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio-financeiro.${format}`;
  a.click();
};
```

---

## 🎯 Status: COMPLETO

**Próximos passos:**
1. Adicionar gráficos aos PDFs (opcional - requer canvas)
2. Suporte a outros formatos (Excel XLSX)
3. Agendamento automático de envio de relatórios por email
4. Templates customizáveis de PDF
