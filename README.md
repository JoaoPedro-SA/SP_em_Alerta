# 🚨 SP em Alerta

![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge\&logo=python)
![React Native](https://img.shields.io/badge/React%20Native-Mobile-blue?style=for-the-badge\&logo=react)
![Expo](https://img.shields.io/badge/Expo-Framework-black?style=for-the-badge\&logo=expo)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-success?style=for-the-badge)

O **SP em Alerta** é um aplicativo mobile desenvolvido para a cidade de São Paulo com foco em segurança comunitária e conscientização urbana.

A plataforma permite que usuários registrem, visualizem e compartilhem ocorrências em tempo real diretamente no mapa da cidade.

## 📱 Funcionalidades

* 🚔 Registro de ocorrências em tempo real
* 📍 Geolocalização integrada com Google Maps
* ⚠️ Compartilhamento de alertas comunitários
* 🗺️ Visualização de ocorrências no mapa
* 📲 Interface mobile intuitiva
* 🔄 Atualização dinâmica de eventos
* 📡 Estrutura baseada em API REST

---

# 🧠 Tipos de Ocorrências

O aplicativo permite registrar diferentes tipos de alertas:

* Assaltos
* Acidentes
* Situações de risco
* Atividades suspeitas
* Alertas comunitários

---

# 🏗️ Arquitetura do Sistema

O projeto utiliza uma arquitetura separada entre frontend e backend:

```text
Usuário (Aplicativo Mobile)
            │
            ▼
Frontend (React Native + Expo)
            │
            ▼
API REST (Python)
            │
            ▼
Google Maps API
```

---

# ⚙️ Tecnologias Utilizadas

## 🎨 Frontend

* React Native
* Expo
* TypeScript
* JavaScript
* Google Maps API

## 🐍 Backend

* Python
* API REST
* Estrutura modular

## 🛠️ Ferramentas

* Node.js
* NPM
* ESLint
* Git
* VS Code

---

# 📂 Estrutura do Projeto

```text
AlertaSP/
│
├── app/                # Rotas e telas do aplicativo
├── assets/             # Recursos estáticos
├── components/         # Componentes reutilizáveis
├── constants/          # Constantes globais
├── hooks/              # Hooks personalizados
├── scripts/            # Scripts auxiliares
├── styles/             # Estilos da aplicação
│
├── backend/            # API Python
│   ├── __init__.py
│   ├── config.py
│   ├── extensions.py
│   ├── models.py
│   ├── routes.py
│   ├── secret.py
│   ├── app.py
│   └── requirements.txt
│
├── package.json
├── app.json
├── tsconfig.json
└── README.md
```

---

# 🚀 Instalação do Projeto

## 1️⃣ Clonar o repositório

```bash
git clone https://github.com/Theuss-fer/SP_em_Alerta.git

cd SP_em_Alerta
```

---

# 🐍 Executando o Backend

## Entrar na pasta do backend

```bash
cd backend
```

## Criar ambiente virtual

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / Mac

```bash
python3 -m venv venv
source venv/bin/activate
```

## Instalar dependências

```bash
pip install -r requirements.txt
```

## Executar servidor

```bash
python app.py
```

A API ficará disponível em:

```text
http://localhost:5000
```

---

# 📱 Executando o Frontend

## Voltar para a raiz do projeto

```bash
cd ..
```

## Instalar dependências

```bash
npm install
```

## Iniciar aplicação

```bash
npx expo start
```

Você poderá executar o aplicativo utilizando:

* Expo Go
* Emulador Android
* Navegador Web

---

# 🗺️ Configuração do Google Maps

O projeto utiliza a Google Maps API para:

* Exibir ocorrências no mapa
* Selecionar localizações
* Registrar novos alertas

Crie um arquivo `.env` e adicione:

```env
GOOGLE_MAPS_API_KEY=SUA_CHAVE_AQUI
```

---

# 📌 Como Utilizar

1. Abra o aplicativo pelo Expo
2. Visualize o mapa da cidade de São Paulo
3. Consulte alertas registrados por outros usuários
4. Crie uma nova ocorrência
5. Compartilhe informações importantes com a comunidade

---

# 🎯 Objetivo do Projeto

O SP em Alerta busca:

* Melhorar a segurança comunitária
* Incentivar colaboração entre moradores
* Facilitar o compartilhamento rápido de informações
* Aumentar a consciência urbana

---

# 🔮 Melhorias Futuras

* 🔔 Notificações em tempo real
* 📊 Estatísticas por região
* 🤖 Classificação automática com IA
* 🔥 Heatmap de ocorrências
* 🎛️ Filtros avançados
* 👤 Sistema de autenticação
* 🚑 Alertas emergenciais

---

# 👨‍💻 Equipe de Desenvolvimento

* Alan Araújo da Silveira
* Fernanda Figueiredo
* João Pedro Antunes
* Matheus Barros Ferreira
* Murilo Leone Fernandes

---

# 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos e educacionais.

---

# ⭐ Contribuição

Contribuições são bem-vindas.

Caso queira colaborar:

```bash
# Fork o projeto
# Crie uma branch

git checkout -b minha-feature

# Commit das alterações

git commit -m "feat: nova funcionalidade"

# Push da branch

git push origin minha-feature
```

Depois disso, abra um Pull Request.
