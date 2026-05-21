# Documentacao Tecnica - SP em Alerta

## Visao geral

O SP em Alerta e um sistema academico para registro e visualizacao de alertas urbanos em Sao Paulo. A solucao e dividida em duas partes principais:

- **Frontend mobile/web**: app Expo/React Native localizado em `AlertaSP/`.
- **Backend REST**: API Flask localizada em `backend/`, com entrada principal em `app.py`.

O app consome a API para cadastro, login, recuperacao de senha, noticias e alertas no mapa.

## Arquitetura

```txt
Usuario
  -> App Expo / React Native
  -> API Flask
  -> Banco de dados SQL
  -> Servicos externos
       - Resend API para email em modo apresentacao
       - SMTP como fallback local
       - Nominatim/OpenStreetMap para rua por coordenadas
       - Google News RSS para noticias
       - Google Maps no app
```

## Tecnologias principais

### Backend

- Python
- Flask
- Flask-SQLAlchemy
- Flask-Mail
- Flask-CORS
- Gunicorn no deploy
- PostgreSQL no Render quando `DATABASE_URL` esta configurado
- SQLite local como fallback

### Frontend

- Expo
- React Native
- Expo Router
- Axios
- React Native Web
- Expo Location
- Google Maps API

## Estrutura resumida

```txt
app.py                    # entrada do backend Flask
backend/
  __init__.py             # cria app, inicializa banco e mail
  config.py               # variaveis de ambiente e configuracoes
  extensions.py           # instancias db/mail
  models.py               # User, Alert, News
  routes.py               # rotas REST
  EMAIL.md                # detalhes do sistema de email

AlertaSP/
  app/                    # telas e rotas do app
  components/             # componentes do app
  src/services/api.js     # cliente Axios da API
  styles/                 # estilos das telas

render.yaml               # configuracao de deploy no Render
requirements.txt          # dependencias Python
```

## Backend

O backend e uma API REST Flask. O arquivo `app.py` cria a aplicacao com `create_app()` e registra rotas extras como health check e download do APK.

### Rotas principais

- `GET /health`: verifica API e banco.
- `GET /health/db`: alias do health check.
- `POST /register`: cadastra usuario e gera OTP de verificacao.
- `POST /verify-otp`: valida o OTP de cadastro.
- `POST /resend-otp`: reenvia OTP.
- `POST /login`: autentica usuario.
- `POST /forgot-password`: gera OTP para redefinicao de senha.
- `POST /reset-password`: valida OTP e troca senha.
- `POST /alert`: cria alerta no mapa.
- `GET /alert`: lista alertas recentes.
- `PATCH /alert/<id>/street`: atualiza nome da rua de um alerta.
- `GET /reverse-geocode`: busca nome de rua por latitude/longitude.
- `GET /news`: retorna noticias relacionadas a Sao Paulo.
- `POST /reset-db`: limpa dados de usuarios e alertas.
- `GET /download`: pagina simples para baixar APK.
- `GET /download/app`: download do APK.

## Banco de dados

O projeto usa SQLAlchemy com tres modelos principais:

- `User`: email, senha com hash, nome, status de verificacao, OTP e expiracao.
- `Alert`: latitude, longitude, rua, titulo, descricao, data de criacao e usuario associado.
- `News`: titulo, descricao, nivel, regiao, fonte, imagem, link e data.

Quando `DATABASE_URL` existe, o backend usa esse banco. Se nao existir, usa SQLite local:

```env
DATABASE_URL=
```

No Render, e recomendado configurar PostgreSQL via `DATABASE_URL`, pois SQLite local nao e persistente de forma confiavel em ambiente hospedado.

## Frontend

O app fica em `AlertaSP/` e usa Expo Router. O cliente HTTP esta em:

```txt
AlertaSP/src/services/api.js
```

Por padrao, a API aponta para:

```txt
https://sp-em-alerta-27yd.onrender.com
```

Essa URL pode ser sobrescrita com:

```env
EXPO_PUBLIC_API_URL=https://sua-api.onrender.com
```

## Sistema de email

O sistema envia emails em cadastro, reenvio de OTP e recuperacao de senha.

Existem dois modos:

- **Resend API**: modo usado para apresentacao no Render free.
- **SMTP Flask-Mail**: fallback local ou para hospedagem que permita SMTP.

Variaveis usadas no modo Resend:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=AlertaSP <onboarding@resend.dev>
RESEND_TEST_RECIPIENT=joao.santunes@aluno.impacta.edu.br
```

### Modo de apresentacao com Resend

Como a Resend limita o remetente `onboarding@resend.dev`, o projeto usa `RESEND_TEST_RECIPIENT`.

Nesse modo:

1. O usuario digita qualquer email no app.
2. O backend gera o OTP normalmente.
3. O email real e enviado para `RESEND_TEST_RECIPIENT`.
4. A mensagem inclui o destinatario original.
5. A API devolve `test_otp`.
6. O app mostra o codigo e preenche o campo OTP.

Essa estrategia e valida apenas para apresentacao. Em producao, OTP nao deve ser devolvido para o app.

## Deploy no Render

O arquivo `render.yaml` define:

```yaml
buildCommand: pip install -r requirements.txt
startCommand: gunicorn app:app
```

Variaveis esperadas no Render:

```env
DATABASE_URL=
SECRET_KEY=
FRONTEND_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_TEST_RECIPIENT=
FLASK_ENV=production
PORT=5001
```

O Render define a porta real do servico via `PORT`. O backend le essa variavel ao rodar diretamente por `python app.py`.

## CORS

O backend libera origens locais usadas pelo Expo e tambem aceita:

```env
FRONTEND_URL=
FRONTEND_URLS=
```

Isso permite configurar a URL publica do frontend hospedado ou multiplas URLs separadas por virgula.

## Integracoes externas

### Resend

Usada para envio de email por API HTTPS. Foi escolhida porque o Render free pode bloquear SMTP.

### SMTP/Gmail

Disponivel como fallback. Para Gmail, a senha deve ser uma senha de app:

```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USE_SSL=False
MAIL_USERNAME=
MAIL_PASSWORD=
```

### Nominatim/OpenStreetMap

Usado no backend para transformar coordenadas em nome de rua. A consulta pode falhar por instabilidade, limite de uso ou timeout.

### Google News RSS

Usado para buscar noticias recentes sobre Sao Paulo. Caso falhe, o backend tenta retornar noticias salvas no banco.

### Google Maps

Usado no app para visualizacao de mapa. Depende de chave configurada no ambiente do app.

## Limitacoes e restricoes

- O modo Resend com `RESEND_TEST_RECIPIENT` e apenas para demonstracao.
- Sem dominio verificado na Resend, nao e possivel enviar email livremente para qualquer destinatario usando `onboarding@resend.dev`.
- O Render free pode bloquear SMTP nas portas `25`, `465` e `587`.
- SQLite nao e indicado para persistencia no Render.
- A rota `/reset-db` apaga usuarios e alertas, portanto deve ser removida ou protegida antes de producao.
- O sistema de login nao usa JWT ou sessao persistente robusta.
- Alertas nao possuem moderacao, validacao comunitaria ou controle antifraude.
- O app aceita alertas com base em coordenadas informadas pelo cliente, sem prova forte de presenca no local.
- OTP e usado tambem em modo demonstracao com retorno para o app, o que nao deve existir em producao.
- O envio de noticias depende de RSS externo e pode variar conforme disponibilidade do Google News.
- A reverse geocoding usa servico externo gratuito e pode sofrer limite de requisicoes.
- O sistema nao possui notificacoes push em tempo real.
- O modelo de permissao ainda e simples; algumas rotas nao exigem autenticacao.
- As mensagens de erro e textos do backend podem precisar de revisao de acentuacao/encoding.

## Recomendacoes para producao

- Remover `RESEND_TEST_RECIPIENT` e nunca retornar `test_otp`.
- Verificar dominio proprio na Resend e usar remetente como `noreply@seudominio.com`.
- Proteger ou remover `/reset-db`.
- Implementar autenticacao com token JWT.
- Associar alertas ao usuario autenticado.
- Adicionar rate limit em login, OTP e criacao de alertas.
- Criar migracoes de banco com Alembic/Flask-Migrate.
- Padronizar logs estruturados.
- Criar testes automatizados para rotas criticas.
- Validar melhor dados de entrada.
- Configurar monitoramento de erro e uptime.
- Revisar seguranca de CORS para producao.

## Como executar localmente

Backend:

```bash
pip install -r requirements.txt
python app.py
```

Frontend:

```bash
cd AlertaSP
npm install
npm run start
```

Validacoes usadas no desenvolvimento:

```bash
python -c "from app import app; print('backend ok')"
cd AlertaSP
npm run lint
```
