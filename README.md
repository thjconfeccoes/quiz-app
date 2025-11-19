# Quiz do Signo - Aplicação React

Uma aplicação de quiz interativa para descobrir qual signo combina mais com sua personalidade.

## Configuração para Deploy no Netlify

### 1. Mercado Pago Setup

1. Crie uma conta no [Mercado Pago Developers](https://www.mercadopago.com/developers)
2. Crie uma nova aplicação e obtenha seu Access Token
3. Configure as variáveis de ambiente no Netlify:

**Variáveis de Ambiente:**
- `VITE_MERCADO_PAGO_ACCESS_TOKEN`: Seu token de acesso do Mercado Pago

### 2. Deploy no Netlify

1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente nas configurações do site
3. Faça o deploy

### 3. Desenvolvimento Local

1. Instale as dependências:
```bash
npm install
```

2. Configure o arquivo `.env` com seu token de teste do Mercado Pago:
```
VITE_MERCADO_PAGO_ACCESS_TOKEN="TEST-YOUR-MERCADO-PAGO-ACCESS-TOKEN-HERE"
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Funcionalidades

- Quiz com 25 perguntas personalizadas
- Sistema de pagamento via Mercado Pago
- Resultados personalizados baseados nas respostas
- Design responsivo com Tailwind CSS
- Suporte para múltiplos idiomas

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Mercado Pago SDK
- i18next para internacionalização
