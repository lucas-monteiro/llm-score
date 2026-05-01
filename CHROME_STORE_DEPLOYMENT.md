# Chrome Web Store Deployment Guide

Guia completo para validação, empacotamento e publicação da extensão LLM Score na Chrome Web Store.

## 📋 Índice

1. [Instalação de Dependências](#instalação-de-dependências)
2. [Validação Local](#validação-local)
3. [Empacotamento](#empacotamento)
4. [Upload Manual](#upload-manual)
5. [Automação com GitHub Actions](#automação-com-github-actions)
6. [Credenciais e Segurança](#credenciais-e-segurança)

---

## Instalação de Dependências

### 1. Instalar novos pacotes

```bash
npm install
```

Isso vai instalar:
- `archiver` - Para criar arquivos ZIP
- `chrome-webstore-upload` - Para upload automatizado
- `@types/node` - Para suporte TypeScript em scripts Node

### 2. Verificar instalação

```bash
npm list archiver chrome-webstore-upload
```

---

## Validação Local

Valida automaticamente:
- `manifest.json` - Estrutura e campos obrigatórios
- `package.json` - Versão e estrutura
- Arquivos necessários (`popup.html`, `styles.css`, `dist/`)
- Diretório `icons/` (recomendado)

### Executar validação

```bash
npm run validate
```

**Saída esperada:**
```
🔍 Validating LLM Score extension...

✓ manifest.json: v1.0.0, "LLM Score"
✓ package.json: v1.0.0
✓ popup.html
✓ styles.css
✓ tsconfig.json
✓ dist/popup.js
✓ dist/content.js
✓ icons/ contains 1 file(s)

==================================================
✅ All validations passed!
```

---

## Empacotamento

Cria um arquivo ZIP pronto para upload na Chrome Web Store.

### Executar empacotamento

```bash
npm run pack
```

**Saída esperada:**
```
📦 Packing LLM Score extension...

✓ manifest.json
✓ popup.html
✓ styles.css
✓ dist/popup.js
✓ dist/content.js
✓ icons/

✅ Package created: llm-score.zip (45.23 KB)

Next steps:
1. Go to https://chrome.google.com/webstore/devconsole/
2. Select your extension
3. Upload the llm-score.zip file
4. Fill in the details and publish
```

### Verificar conteúdo do ZIP

```bash
unzip -l llm-score.zip
```

---

## Upload Manual

### Passo 1: Fazer build e validar

```bash
npm run build
npm run validate
npm run pack
```

### Passo 2: Acessar Console do Desenvolvedor

1. Ir para https://chrome.google.com/webstore/devconsole/
2. Fazer login com a conta Google que gerencia a extensão
3. Selecionar a extensão "LLM Score"

### Passo 3: Carregar o arquivo ZIP

1. Clicar em "Package" ou "Upload updated package"
2. Selecionar o arquivo `llm-score.zip`
3. Clicar em "Upload"

### Passo 4: Revisar e publicar

1. Preencher/revisar:
   - **Título**: LLM Score
   - **Descrição**: Scores webpage content quality for LLM readiness
   - **Idiomas**: Português (Brasil), English (US)
   - **Categoria**: Productivity / Developer Tools
   - **Screenshots** e ícones (128x128, 1280x800)
   - **URLs** de privacidade/suporte (opcional)

2. Clicar em "Submit for review" ou "Publish"

---

## Automação com GitHub Actions

### Requisitos

1. **Repositório no GitHub**
2. **Secrets configuradas** (ver seção abaixo)
3. **Branch principal** (main, master ou develop)

### Fluxo Automático

#### Build em cada push (qualquer branch)

```
Push to main/master/develop
        ↓
   npm run lint (aviso)
        ↓
   npm run typecheck
        ↓
   npm run build
        ↓
   npm run validate
        ↓
   npm run pack
        ↓
   Salvar artefato por 30 dias
```

#### Deploy automático em tags (v1.0.0, v1.0.1, etc)

```
Push tag v1.x.x
        ↓
   Validar e buildar
        ↓
   Fazer upload para Chrome Web Store
        ↓
   Criar Release no GitHub
```

### Como usar

#### 1. Fazer commit e push

```bash
git add .
git commit -m "Fix: improve suggestions panel"
git push origin main
```

**Resultado**: GitHub Actions roda validação e build automaticamente

#### 2. Criar uma release (tag)

```bash
git tag v1.0.1 -m "Release 1.0.1"
git push origin v1.0.1
```

**Resultado**: GitHub Actions faz upload automático para a Chrome Web Store

---

## Credenciais e Segurança

### Obter credenciais da Chrome Web Store API

1. Ir para https://console.cloud.google.com/
2. Criar novo projeto ou usar existente
3. Ativar "Chrome Web Store API"
4. Criar "OAuth 2.0 Client ID" (tipo: Desktop)
5. Baixar credenciais (JSON)

### Configurar Secrets no GitHub

1. Ir para **Settings** → **Secrets and variables** → **Actions**
2. Clicar em "New repository secret"
3. Adicionar os seguintes secrets:

| Nome | Valor | Exemplo |
|------|-------|---------|
| `EXTENSION_ID` | ID da extensão na Chrome Web Store | `abcdefghijklmnopqrstuvwxyzabcdef` |
| `CLIENT_ID` | OAuth Client ID | `123456789-abc.apps.googleusercontent.com` |
| `CLIENT_SECRET` | OAuth Client Secret | `GOCSPX-xxxxx` |
| `REFRESH_TOKEN` | Refresh token (obtido inicialmente) | `1//0gxxxxxx` |

### Obter Refresh Token (primeira vez)

```bash
npx chrome-webstore-upload auth \
  --client-id YOUR_CLIENT_ID \
  --client-secret YOUR_CLIENT_SECRET
```

Isso abrirá um navegador para autenticação. Copiar o refresh token exibido.

---

## Scripts Disponíveis

```bash
npm run build          # Compilar TypeScript
npm run watch         # Watch mode (recompila on change)
npm run typecheck     # Verificar tipos TypeScript
npm run lint          # ESLint (avisos)
npm run validate      # Validar estrutura da extensão
npm run pack          # Criar llm-score.zip
npm run upload        # Upload para Chrome Web Store (requer secrets)
```

---

## Troubleshooting

### ❌ "manifest.json not found"

```bash
npm run build
# Certifique-se de estar no diretório correto:
cd /path/to/llm-score
```

### ❌ "dist/ missing"

Você precisa compilar TypeScript:

```bash
npm run build
```

### ❌ "Upload failed: Invalid credentials"

Verifique se os secrets estão corretos:
- `EXTENSION_ID` corresponde à sua extensão
- `CLIENT_ID`, `CLIENT_SECRET` e `REFRESH_TOKEN` são válidos
- O refresh token não expirou

### ❌ "icons/ is missing"

Crie a pasta e adicione um ícone 128x128:

```bash
mkdir icons
# Adicione um arquivo PNG 128x128
cp icon.png icons/icon-128.png
```

---

## Dicas Importantes

1. **Sempre testar localmente antes de publicar**
   ```bash
   npm run validate && npm run pack
   ```

2. **Manter versão sincronizada** entre `manifest.json` e `package.json`

3. **Revisar changelog** antes de publicar nova versão

4. **Usar tags semânticas**: v1.0.0, v1.0.1, v1.1.0

5. **Credenciais em repositório privado** (nunca commit secrets)

6. **Backup do refresh token** em local seguro

---

## Recursos Úteis

- [Chrome Web Store Documentation](https://developer.chrome.com/docs/webstore/)
- [chrome-webstore-upload GitHub](https://github.com/DrewML/chrome-webstore-upload)
- [Chrome Extension Manifest v3](https://developer.chrome.com/docs/extensions/mv3/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
