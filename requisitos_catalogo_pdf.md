# Requisitos do Projeto: Geração de Catálogo de Produtos em PDF via Notion + n8n

## 📆 Contexto
O objetivo é permitir a geração de um PDF de catálogo com produtos selecionados diretamente da base de dados do Notion, para ser enviado facilmente via WhatsApp. O projeto deve permitir tanto a criação de pedidos quanto catálogos promocionais.

---

## 📑 Requisitos Funcionais

### 1. Banco de Dados
- A fonte de dados será uma **tabela no Notion**, com os seguintes campos:
  - `Nome` (texto)
  - `Preço` (número)
  - `Imagem` (arquivos ou URL)
  - `SKU` (código interno)
  - `Barcode` (código de barras, texto)
  - `Catálogo Ativo` (checkbox)

### 2. Geração de Catálogo (Caso 2)
- Quando um Webhook for acionado no n8n, o sistema:
  - Consulta os produtos com `Catálogo Ativo == true`
  - Monta um JSON com os dados dos produtos (nome, preço, imagem)
  - Envia esse JSON para o PDFMonkey para gerar o catálogo
  - Retorna a URL do PDF gerado
  - (Opcional) Envia o PDF automaticamente para um número via WhatsApp Cloud API

### 3. Template PDFMonkey
- O template no PDFMonkey será desenvolvido em **HTML/CSS com Liquid**
- O layout do catálogo incluirá:
  - Nome do produto
  - Preço unitário
  - Imagem (responsiva)
  - Disposição em grade (2 produtos por linha)

### 4. Integração com WhatsApp (futuro)
- Integração via **WhatsApp Business Cloud API**
  - Envio automático do PDF para cliente ou grupo
  - Uso de template aprovado pela Meta para envio de documentos (PDF)

---

## 📊 Requisitos Não-Funcionais

- A solução não requer backend próprio
- Toda a lógica será centralizada no n8n
- O Notion será a fonte principal e editável do catálogo
- O PDFMonkey será usado para renderizar documentos com visual profissional
- O sistema deve ser modular e permitir expansão para outros fluxos (como pedido personalizado)

---

## 🚀 Roadmap Futuro

1. Criar fluxo para montagem de **pedidos personalizados** com seleção de produtos e quantidade
2. Adicionar suporte a leitura por código de barras (escaneamento)
3. Adicionar reconhecimento por imagem (Google Vision)
4. Gerar relatórios de vendas e popularidade
5. Dashboard de controle dos pedidos gerados

---

## 📅 Tarefas Próximas

- [x] Definir campos obrigatórios no Notion
- [x] Criar o webhook no n8n
- [x] Montar função que prepara JSON para PDFMonkey
- [x] Criar template de catálogo em HTML/CSS
- [ ] Testar envio real com produtos da base
- [ ] Automatizar envio via WhatsApp

---

Se precisar expandir para pedidos, o mesmo modelo pode ser duplicado e adaptado com base na seleção de SKU + quantidade.

