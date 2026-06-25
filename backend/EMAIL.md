# Sistema de Email

Este backend envia emails para verificacao de conta, reenvio de OTP e recuperacao de senha.

## Provedores suportados

O projeto suporta dois modos de envio:

1. **EmailJS API**: alternativa para apresentacao usando API HTTP.
2. **Resend API**: usado no Render para apresentacao, porque funciona por HTTPS e nao depende de portas SMTP.
3. **SMTP Flask-Mail**: usado como fallback local, por exemplo com Gmail SMTP.

Quando `EMAILJS_SERVICE_ID` existe no ambiente, o backend usa EmailJS. Se essa variavel nao existir e `RESEND_API_KEY` existir, usa Resend. Se nenhuma das duas existir, usa Flask-Mail/SMTP.

## Variaveis do EmailJS

Configure no Render:

```env
EMAILJS_SERVICE_ID=seu_service_id
EMAILJS_TEMPLATE_ID=seu_template_id
EMAILJS_PUBLIC_KEY=sua_public_key
EMAILJS_PRIVATE_KEY=sua_private_key
```

O template do EmailJS deve aceitar variaveis como:

```txt
to_email
subject
message
otp
```

O backend tambem envia `email`, `recipient`, `text`, `html`, `code`, `codigo` e `from_name` para facilitar ajustes no template.

## Variaveis do Resend

Configure no Render:

```env
RESEND_API_KEY=sua_chave_da_resend
RESEND_FROM_EMAIL=AlertaSP <onboarding@resend.dev>
RESEND_TEST_RECIPIENT=joao.santunes@aluno.impacta.edu.br
```

### Modo de apresentacao

Como a Resend limita o envio com `onboarding@resend.dev`, usamos `RESEND_TEST_RECIPIENT`.

Nesse modo:

1. O usuario informa o email dele no app.
2. O backend gera o codigo OTP normalmente.
3. O email e enviado para `RESEND_TEST_RECIPIENT`.
4. O corpo do email mostra o destinatario original.
5. A API tambem devolve `test_otp` para o app.
6. O app mostra o codigo e preenche automaticamente o campo OTP.

Esse modo e apenas para teste/apresentacao. Em producao, nao se deve devolver OTP na resposta da API.

## Variaveis SMTP

Para uso local ou em hospedagem que permita SMTP:

```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USE_SSL=False
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_senha_de_app
```

Com Gmail, `MAIL_PASSWORD` deve ser uma senha de app. O codigo remove espacos automaticamente da senha quando o servidor e `smtp.gmail.com`.

## Rotas que enviam email

- `POST /register`: cria conta e envia OTP de verificacao.
- `POST /resend-otp`: gera e envia novo OTP.
- `POST /forgot-password`: gera e envia OTP para redefinir senha.

## Observacao sobre Render

No plano gratuito do Render, o envio SMTP nas portas `25`, `465` e `587` pode ser bloqueado. Por isso, para apresentacao no Render free, use Resend API.
