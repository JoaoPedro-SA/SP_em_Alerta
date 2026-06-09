# 🚨 SP em Alerta

<div align="center">

![SP em Alerta Banner](https://img.shields.io/badge/SP%20em%20Alerta-Seguran%C3%A7a%20Comunit%C3%A1ria-red?style=for-the-badge&logo=googlemaps)

[![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)](https://python.org)
[![React Native](https://img.shields.io/badge/React%20Native-Mobile-blue?style=for-the-badge&logo=react)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-Framework-black?style=for-the-badge&logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-2.4%25-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-success?style=for-the-badge)]()
[![Licença](https://img.shields.io/badge/Licen%C3%A7a-Acad%C3%AAmica-orange?style=for-the-badge)]()

**Plataforma comunitária de alertas urbanos em tempo real para a cidade de São Paulo**

[Sobre o Projeto](#-sobre-o-projeto) • [Funcionalidades](#-funcionalidades) • [Arquitetura](#️-arquitetura-do-sistema) • [Como Rodar](#-como-rodar-o-projeto) • [API](#-endpoints-da-api) • [Equipe](#-equipe)

</div>

---

## 📖 Sobre o Projeto

O **SP em Alerta** é um aplicativo mobile desenvolvido como projeto acadêmico para a cidade de **São Paulo**, com foco em **segurança comunitária** e **conscientização urbana**.

A plataforma permite que cidadãos registrem, visualizem e compartilhem ocorrências em tempo real diretamente no mapa da cidade, facilitando a comunicação entre moradores e aumentando a percepção coletiva de segurança.

> ⚠️ **Importante:** A criação de novos alertas está disponível **apenas na versão mobile** (aplicativo). A versão web (navegador) permite somente a **visualização** dos alertas já registrados.

---

## 🧩 Funcionalidades

| Funcionalidade | Mobile | Web |
|---|---|---|
| 🗺️ Visualizar alertas no mapa | ✅ | ✅ |
| 🚔 Registrar nova ocorrência | ✅ | ❌ |
| 📍 Geolocalização automática | ✅ | ❌ |
| 🔄 Atualização dinâmica de eventos | ✅ | ✅ |
| ⚠️ Compartilhar alertas comunitários | ✅ | ❌ |

### Tipos de Ocorrências Suportadas

- 🔫 Assaltos
- 🚗 Acidentes de trânsito
- ⚠️ Situações de risco
- 👀 Atividades suspeitas
- 📢 Alertas comunitários gerais

---

## 🏗️ Arquitetura do Sistema

O projeto segue uma arquitetura cliente-servidor desacoplada, dividida entre **Frontend Mobile** (React Native + Expo) e **Backend** (Python/Flask com API REST), integrados via requisições HTTP.

```
┌─────────────────────────────────────────────────────┐
│                   USUÁRIO FINAL                      │
│          📱 Mobile App   /   🌐 Web Browser          │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│         FRONTEND — React Native + Expo              │
│                                                     │
│   app/          → Telas e navegação (rotas)         │
│   components/   → Componentes reutilizáveis         │
│   hooks/        → Lógica de estado customizada      │
│   constants/    → Configurações e constantes        │
│   styles/       → Estilos globais                   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP REST (JSON)
                       ▼
┌─────────────────────────────────────────────────────┐
│          BACKEND — Python / Flask                   │
│                                                     │
│   app.py        → Ponto de entrada                  │
│   routes.py     → Definição dos endpoints REST      │
│   models.py     → Modelos de dados (ORM)            │
│   config.py     → Configurações do servidor         │
│   extensions.py → Inicialização de extensões        │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│            SERVIÇOS EXTERNOS                        │
│         🗺️ Google Maps API                          │
│   (Exibição do mapa, Geolocalização, Marcadores)    │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ Tecnologias Utilizadas

### 🎨 Frontend
| Tecnologia | Finalidade |
|---|---|
| React Native | Framework principal do app mobile |
| Expo | Toolchain e ambiente de desenvolvimento |
| TypeScript | Tipagem estática |
| JavaScript | Lógica da aplicação |
| Google Maps API | Visualização e interação com mapas |

### 🐍 Backend
| Tecnologia | Finalidade |
|---|---|
| Python 3.x | Linguagem principal |
| Flask | Micro-framework web para a API REST |
| SQLAlchemy (via extensions) | ORM para persistência de dados |
| Flask-Migrate / extensões | Gerenciamento de banco de dados |

### 🛠️ Ferramentas e DevOps
| Ferramenta | Finalidade |
|---|---|
| Node.js + NPM | Gerenciamento de pacotes do frontend |
| Git | Controle de versão |
| Render | Hospedagem do backend (via `render.yaml`) |
| ESLint | Linting de código |
| VS Code | Editor recomendado |

---

## 📂 Estrutura do Projeto

```
SP_em_Alerta/
│
├── 📁 AlertaSP/              # Projeto Frontend (React Native + Expo)
│   ├── 📁 app/               # Telas e rotas da aplicação (Expo Router)
│   ├── 📁 assets/            # Imagens, ícones e recursos estáticos
│   ├── 📁 components/        # Componentes de UI reutilizáveis
│   ├── 📁 constants/         # Constantes globais (cores, configurações)
│   ├── 📁 hooks/             # Custom Hooks (lógica de estado)
│   ├── 📁 scripts/           # Scripts auxiliares
│   ├── 📁 styles/            # Estilos globais da aplicação
│   ├── 📄 app.json           # Configurações do Expo
│   ├── 📄 package.json       # Dependências Node.js
│   └── 📄 tsconfig.json      # Configuração do TypeScript
│
├── 📁 backend/               # API REST Python/Flask
│   ├── 📄 __init__.py        # Inicialização do módulo
│   ├── 📄 app.py             # Ponto de entrada do servidor Flask
│   ├── 📄 config.py          # Configurações (banco de dados, variáveis)
│   ├── 📄 extensions.py      # Inicialização das extensões Flask (SQLAlchemy, etc.)
│   ├── 📄 models.py          # Modelos de dados (Ocorrência, etc.)
│   ├── 📄 routes.py          # Definição dos endpoints da API
│   ├── 📄 secret.py          # Gerenciamento de chaves secretas
│   └── 📄 requirements.txt   # Dependências Python
│
├── 📁 downloads/             # APKs e builds para download direto
│
├── 📄 app.py                 # Entry point principal (raiz)
├── 📄 Procfile               # Configuração do processo para deploy (Heroku/Render)
├── 📄 render.yaml            # Configuração de deploy no Render
├── 📄 render.txt             # Notas sobre o deploy no Render
├── 📄 requirements.txt       # Dependências Python (raiz, para deploy)
├── 📄 .gitignore             # Arquivos ignorados pelo Git
└── 📄 README.md              # Este arquivo
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

Antes de começar, garanta que você tem instalado:

- **[Git](https://git-scm.com/)** — para clonar o repositório
- **[Python 3.8+](https://www.python.org/downloads/)** — para rodar o backend
- **[Node.js 18+](https://nodejs.org/)** e **NPM** — para rodar o frontend
- **[Expo Go](https://expo.dev/go)** — app instalado no celular (Android ou iOS) para testar
- Uma chave de API do **[Google Maps](https://console.cloud.google.com/)** (necessária para o mapa funcionar)

---

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/Theuss-fer/SP_em_Alerta.git
cd SP_em_Alerta
```

---

### 2️⃣ Configurar e Rodar o Backend (Python/Flask)

#### Entrar na pasta do backend

```bash
cd backend
```

#### Criar ambiente virtual (recomendado)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

> 💡 Você saberá que o ambiente virtual está ativo quando `(venv)` aparecer no início do terminal.

#### Instalar as dependências

```bash
pip install -r requirements.txt
```

#### Configurar variáveis de ambiente (opcional / local)

Crie um arquivo `.env` dentro da pasta `backend/`:

```env
SECRET_KEY=sua_chave_secreta_aqui
DATABASE_URL=sqlite:///alertas.db   # ou URL do banco de dados de produção
```

#### Iniciar o servidor

```bash
python app.py
```

O backend ficará disponível em:
```
http://localhost:5000
```

> ✅ Se aparecer algo como `Running on http://127.0.0.1:5000`, o servidor está funcionando.

---

### 3️⃣ Configurar e Rodar o Frontend (React Native + Expo)

#### Voltar para a raiz do projeto e entrar na pasta do app

```bash
cd ..
cd AlertaSP
```

#### Instalar as dependências

```bash
npm install
```

#### Configurar a chave do Google Maps

Crie um arquivo `.env` dentro da pasta `AlertaSP/`:

```env
GOOGLE_MAPS_API_KEY=SUA_CHAVE_DO_GOOGLE_MAPS_AQUI
EXPO_PUBLIC_API_URL=http://localhost:5000
```

> ⚠️ Substitua `SUA_CHAVE_DO_GOOGLE_MAPS_AQUI` pela sua chave de API real do Google Maps Platform.

#### Iniciar o servidor de desenvolvimento Expo

```bash
npx expo start
```

Você verá um **QR Code** no terminal. A partir daí, você tem as seguintes opções:

| Opção | Como acessar | Observação |
|---|---|---|
| 📱 **Expo Go (Android/iOS)** | Escanear o QR Code com o app Expo Go | Recomendado — funcionalidade completa, incluindo criação de alertas |
| 🤖 **Emulador Android** | Pressionar `a` no terminal | Requer Android Studio instalado |
| 🍎 **Simulador iOS** | Pressionar `i` no terminal | Requer macOS + Xcode |
| 🌐 **Navegador Web** | Pressionar `w` no terminal | Apenas visualização de alertas (sem criação) |

---

## 📱 Usando o Aplicativo

### Versão Mobile (Expo Go) — Acesso Completo

1. Instale o **[Expo Go](https://expo.dev/go)** no seu celular
2. Certifique-se de que celular e computador estão na **mesma rede Wi-Fi**
3. Escaneie o QR Code exibido no terminal com o Expo Go
4. O app será carregado no celular
5. Visualize o **mapa de São Paulo** com os alertas ativos
6. Toque em um marcador para ver os detalhes de uma ocorrência
7. Use o botão de **nova ocorrência** para registrar um alerta na sua localização atual
8. Preencha o tipo de ocorrência e a descrição, e confirme

### Versão Web (Navegador) — Somente Visualização

> ⚠️ Na versão web, só é possível **visualizar** os alertas no mapa. O botão de criação de ocorrência não está disponível.

1. Com o Expo iniciado, pressione `w` para abrir no navegador
2. O mapa de São Paulo será exibido com todos os alertas cadastrados
3. Clique nos marcadores para ver os detalhes das ocorrências

---

## 🌐 Endpoints da API

O backend expõe uma API REST no endereço `http://localhost:5000`. Abaixo estão os principais endpoints:

### Ocorrências

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/ocorrencias` | Lista todas as ocorrências registradas |
| `POST` | `/ocorrencias` | Cria uma nova ocorrência |
| `GET` | `/ocorrencias/<id>` | Busca uma ocorrência específica pelo ID |
| `DELETE` | `/ocorrencias/<id>` | Remove uma ocorrência |

### Exemplo de requisição — Criar ocorrência (`POST /ocorrencias`)

```json
{
  "tipo": "Assalto",
  "descricao": "Assalto a transeunte na calçada",
  "latitude": -23.5505,
  "longitude": -46.6333
}
```

### Exemplo de resposta — Listar ocorrências (`GET /ocorrencias`)

```json
[
  {
    "id": 1,
    "tipo": "Assalto",
    "descricao": "Assalto a transeunte na calçada",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "criado_em": "2025-06-01T14:30:00"
  }
]
```

---

## 🔑 Configuração da Google Maps API

O projeto utiliza a Google Maps API para renderizar o mapa e os marcadores de ocorrência.

### Como obter sua chave de API

1. Acesse o **[Google Cloud Console](https://console.cloud.google.com/)**
2. Crie um novo projeto (ou use um existente)
3. Ative as seguintes APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Maps JavaScript API** (para a versão web)
4. Acesse **Credenciais** → **Criar credencial** → **Chave de API**
5. Copie a chave gerada e adicione ao arquivo `.env` do frontend:

```env
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

> 💡 Para testes locais, você pode deixar a chave sem restrições. Em produção, configure restrições de domínio/IP no Google Cloud.

---

## 🧪 Testando o Projeto

### Testando o Backend

Com o servidor Flask rodando em `http://localhost:5000`, você pode testar a API diretamente:

**Via navegador (GET):**
```
http://localhost:5000/ocorrencias
```

**Via curl (terminal):**
```bash
# Listar ocorrências
curl http://localhost:5000/ocorrencias

# Criar nova ocorrência
curl -X POST http://localhost:5000/ocorrencias \
  -H "Content-Type: application/json" \
  -d '{"tipo": "Assalto", "descricao": "Teste", "latitude": -23.5505, "longitude": -46.6333}'
```

**Via Postman / Insomnia:**
1. Importe a URL base `http://localhost:5000`
2. Crie uma requisição `GET /ocorrencias` para listar
3. Crie uma requisição `POST /ocorrencias` com o body JSON para criar

### Testando o Frontend

1. Com o Expo rodando, abra o app no celular via Expo Go
2. Verifique se o mapa carrega corretamente
3. Teste a criação de um alerta tocando no botão correspondente
4. Confirme que o marcador aparece no mapa após o cadastro

---

## 📦 Download do App (APK)

A pasta `downloads/` no repositório contém versões compiladas do aplicativo para download direto, sem precisar configurar o ambiente de desenvolvimento.

Para instalar o APK no Android:

1. Baixe o arquivo `.apk` da pasta `downloads/`
2. No Android, vá em **Configurações → Segurança** e ative **"Fontes desconhecidas"** (ou "Instalar apps desconhecidos")
3. Abra o arquivo baixado e confirme a instalação

> ℹ️ Versão iOS requer TestFlight ou build via Xcode.

---

## ☁️ Deploy (Produção)

O projeto está configurado para deploy no **[Render](https://render.com)** via `render.yaml`.

O arquivo `Procfile` define o comando de inicialização para plataformas como Heroku/Render:

```
web: python app.py
```

O `requirements.txt` na raiz do projeto é utilizado pelo serviço de deploy para instalar as dependências Python automaticamente.

---

## 🔮 Melhorias Futuras

- [ ] 🔔 Notificações push em tempo real
- [ ] 📊 Dashboard com estatísticas por região
- [ ] 🔥 Heatmap (mapa de calor) de ocorrências
- [ ] 🤖 Classificação automática de alertas com IA
- [ ] 🎛️ Filtros avançados por tipo e período
- [ ] 👤 Sistema de autenticação de usuários
- [ ] 🚑 Canal dedicado para alertas emergenciais
- [ ] 🌙 Modo escuro

---

## ⚠️ Problemas Comuns

### O mapa não carrega
- Verifique se a `GOOGLE_MAPS_API_KEY` está configurada corretamente no `.env`
- Confirme se as APIs de Maps estão ativadas no Google Cloud Console
- Verifique se há erros no console do Expo

### O app não conecta ao backend
- Confirme que o backend está rodando em `http://localhost:5000`
- Verifique se celular e computador estão na mesma rede Wi-Fi
- Certifique-se que `EXPO_PUBLIC_API_URL` no `.env` aponta para o IP correto da sua máquina (ex: `http://192.168.1.10:5000`)

### Erro `pip install` no backend
- Certifique-se de estar com o ambiente virtual ativo (veja o `(venv)` no terminal)
- Tente atualizar o pip: `pip install --upgrade pip`

### Expo não encontra o QR Code
- Reinicie o servidor: `npx expo start --clear`
- Tente usar o modo tunnel: `npx expo start --tunnel`

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para colaborar com o projeto:

```bash
# 1. Faça um fork do repositório

# 2. Clone o seu fork
git clone https://github.com/SEU_USUARIO/SP_em_Alerta.git

# 3. Crie uma branch para sua feature
git checkout -b feature/minha-nova-funcionalidade

# 4. Faça as alterações e commit
git add .
git commit -m "feat: descrição da nova funcionalidade"

# 5. Envie para o seu fork
git push origin feature/minha-nova-funcionalidade

# 6. Abra um Pull Request no repositório original
```

### Convenções de Commit

| Prefixo | Uso |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Atualização de documentação |
| `style:` | Formatação de código |
| `refactor:` | Refatoração sem nova funcionalidade |
| `chore:` | Tarefas de manutenção |

---

## 👨‍💻 Equipe de Desenvolvimento

Projeto desenvolvido por alunos para fins acadêmicos:

| Nome |
|---|
| Alan Araújo da Silveira |
| Fernanda Figueiredo |
| João Pedro Antunes |
| Matheus Barros Ferreira |
| Murilo Leone Fernandes |

---

## 📄 Licença

Este projeto foi desenvolvido exclusivamente para fins **acadêmicos e educacionais**. Todos os direitos reservados à equipe de desenvolvimento.

---

<div align="center">

Feito com ❤️ em São Paulo 🏙️

**SP em Alerta — Juntos por uma cidade mais segura**

</div>