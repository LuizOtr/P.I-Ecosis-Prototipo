# EcoSis — Protótipo

Protótipo interativo de baixa fidelidade do aplicativo de condomínio **EcoSis**, construído com React, Vite e Tailwind CSS.

## Comandos

- `npm install` - Instala as dependências do projeto
- `npm run dev` - Inicia o servidor de desenvolvimento local em `http://localhost:5173/`
- `npm run build` - Gera a compilação estática de produção em `dist/` com o caminho base `/P.I-Ecosis-Prototipo/`
- `npm run preview` - Visualiza localmente o build de produção em `http://localhost:4173/P.I-Ecosis-Prototipo/`
- `npm run format` - Formata o código usando oxfmt

## Estrutura do Projeto

- `src/main.tsx` - Ponto de entrada do React; importa `src/index.css` e monta `src/App.tsx` no elemento `#root`
- `src/App.tsx` - Componente principal com todas as telas do protótipo (Início, Avisos, Mural, Portaria, Chamados, Ajustes)
- `src/index.css` - CSS global e importação do Tailwind CSS v4
- `public/favicon.svg` - Favicon do protótipo
- `index.html` - Shell HTML do Vite com título, meta tags e montagem do `#root`
- `vite.config.ts` - Configuração do Vite com React, Tailwind CSS v4 e configuração do caminho base
- `package.json` - Dependências e scripts do projeto
- `.github/workflows/deploy.yml` - Workflow de publicação automática no GitHub Pages

## Deploy (GitHub Pages)

O projeto é hospedado publicamente no GitHub Pages:
**URL:** https://luizotr.github.io/P.I-Ecosis-Prototipo/

A cada `push` na branch `main`, o workflow `.github/workflows/deploy.yml` compila e publica o site automaticamente.

- O caminho base configurado em `vite.config.ts` é `/P.I-Ecosis-Prototipo/` em modo de produção. Ao referenciar assets estáticos, garanta que sejam resolvidos relativos ao base.

## Estilo

Este projeto utiliza **Tailwind CSS v4** por meio do plugin `@tailwindcss/vite` configurado em `vite.config.ts`. O arquivo `src/index.css` importa o Tailwind com `@import 'tailwindcss';`. Utilize classes utilitárias do Tailwind diretamente no JSX e adicione regras de estilo global ou temas em `src/index.css`. Não é necessário arquivo de configuração `tailwind.config.js` nem PostCSS.

Como `src/main.tsx` importa `src/index.css`, a configuração global de fontes pertence a `src/index.css`. Mantenha as declarações `@import` no início do CSS, seguidas de `@font-face` e definições de família de fontes.
