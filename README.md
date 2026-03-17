# 🚨 SP em Alerta

![Python](https://img.shields.io/badge/Python-Backend-blue)
![React Native](https://img.shields.io/badge/React%20Native-Frontend-61dafb)
![Expo](https://img.shields.io/badge/Expo-Mobile-black)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)

**SP em Alerta** é um aplicativo mobile desenvolvido para a cidade de **São Paulo** que permite aos usuários **registrar e visualizar ocorrências de segurança em tempo real**, como:

* 🚔 Assaltos
* ⚠️ Situações de risco
* 🚗 Acidentes
* 🔦 Atividades suspeitas
* 📢 Alertas comunitários

O objetivo da plataforma é **aumentar a consciência urbana da população**, permitindo que moradores compartilhem informações importantes sobre acontecimentos em sua região.

O aplicativo utiliza **React Native com Expo no frontend** e **Python no backend**, além da integração com **Google Maps API** para visualização e registro de ocorrências diretamente no mapa.

---

# 📱 Funcionalidades

✔️ Registro de ocorrências com localização no mapa
✔️ Visualização de alertas em tempo real
✔️ Integração com Google Maps
✔️ Interface mobile intuitiva
✔️ Sistema de compartilhamento de ocorrências
✔️ Visualização geográfica dos eventos

---

# 🧠 Arquitetura do Sistema

O sistema segue uma arquitetura baseada em **API REST**, separando frontend e backend.

```
Usuário (App Mobile)
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

# 🛠️ Tecnologias Utilizadas

## 📱 Frontend

* React Native
* Expo
* TypeScript
* JavaScript
* Google Maps API

## 🖥️ Backend

* Python
* API REST
* Estrutura modular com rotas e modelos

## ⚙️ Ferramentas

* Node.js
* NPM
* ESLint
* Git
* VS Code

---

# 📂 Estrutura do Projeto

```
AlertaSP/
│
├── app/                # Rotas e telas do aplicativo (Expo Router)
├── assets/             # Imagens e recursos estáticos
├── components/         # Componentes reutilizáveis
├── constants/          # Constantes globais
├── hooks/              # Hooks personalizados do React
├── scripts/            # Scripts auxiliares
├── styles/             # Estilização do projeto
│
├── .vscode/            # Configurações do VSCode
├── app.json            # Configuração do Expo
├── eslint.config.js    # Configuração do ESLint
├── package.json        # Dependências do frontend
├── tsconfig.json       # Configuração do TypeScript
│
└── backend/            # API da aplicação
    │
    ├── __init__.py
    ├── config.py
    ├── extensions.py
    ├── models.py
    ├── routes.py
    ├── secret.py
    │
    ├── instance/
    │
    ├── app.py          # Arquivo principal da API
    ├── Procfile        # Configuração de deploy
    ├── render.txt      # Configuração para Render
    └── requirements.txt
```

---

# ⚙️ Instalação do Projeto

## 1️⃣ Clonar o repositório

```bash
git clone https://github.com/seu-repositorio/sp-em-alerta.git
```

```bash
cd AlertaSP
```

---

# 🖥️ Executando o Backend (Python)

Entre na pasta do backend:

```bash
cd backend
```

Crie um ambiente virtual:

```bash
python -m venv venv
```

Ative o ambiente virtual.

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Execute o servidor:

```bash
python app.py
```

A API estará rodando em:

```
http://localhost:5000
```

---

# 📱 Executando o Frontend (Expo)

Volte para a pasta raiz do projeto.

```bash
cd ..
```

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npx expo start
```

Você poderá executar o aplicativo através de:

* 📱 **Expo Go** no celular
* 🤖 **Emulador Android**
* 🌐 **Navegador**

---

# 🗺️ Integração com Google Maps

O aplicativo utiliza **Google Maps API** para:

* Visualização de ocorrências no mapa
* Seleção de localização
* Registro de novos alertas

Para utilizar o mapa, é necessário configurar uma **API Key do Google Maps**.

Exemplo:

```
GOOGLE_MAPS_API_KEY=SUA_CHAVE_AQUI
```

---

# 📖 Como Utilizar o Aplicativo

1️⃣ Abra o aplicativo pelo **Expo**.

2️⃣ O mapa da cidade de **São Paulo** será exibido.

3️⃣ Visualize ocorrências registradas por outros usuários.

4️⃣ Para criar um novo alerta:

* selecione uma localização no mapa
* adicione uma descrição da ocorrência
* confirme o envio

5️⃣ O alerta será exibido para outros usuários.

---

# 🎯 Objetivo do Projeto

O projeto **SP em Alerta** busca:

* aumentar a **segurança comunitária**
* permitir **compartilhamento rápido de informações**
* melhorar a **consciência urbana da população**
* fornecer uma plataforma colaborativa de alertas

---

# 👨‍💻 Equipe de Desenvolvimento

* **Alan Araújo da Silveira**
* **Fernanda Figueiredo**
* **João Pedro Antunes**
* **Matheus Barros Ferreira**
* **Murilo Leone Fernandes**

---

# 🚀 Melhorias Futuras

* 🔔 Notificações em tempo real
* 📊 Estatísticas por região
* 🧠 Classificação automática de ocorrências com IA
* 🗺️ Heatmap de violência
* 🔍 Filtros por tipo de ocorrência
* 👤 Sistema de contas de usuário
* 📢 Alertas de emergência

---

# 📄 Licença

Este projeto foi desenvolvido para **fins educacionais e acadêmicos**.

---
