# Plano de evolução — Pomodoro

## Diagnóstico atual

O aplicativo é um PWA estático. Tarefas, notas e preferências são gravadas no
`localStorage` do navegador. Isso funciona offline, mas os dados não pertencem
a uma conta, não sincronizam entre dispositivos e podem ser apagados pelo
usuário/navegador. Login Google e persistência segura exigem um serviço de
autenticação e banco de dados.

## Arquitetura recomendada

Usar **Firebase Authentication + Cloud Firestore + Cloud Functions**:

- Authentication: login e criação de conta pelo Google, com OAuth 2.0 / OpenID
  Connect. Não implementar senha nem armazenar token Google manualmente.
- Firestore: documentos separados por `uid`: `users/{uid}/tasks`, `notes`,
  `settings`, `reminders` e `stats`.
- Regras do Firestore: cada operação só é permitida se
  `request.auth.uid == userId`; validar campos, tamanhos, datas e tipos.
- Cloud Functions: ações privilegiadas, limpeza de dados, auditoria e envio de
  lembretes push. Nenhum segredo de serviço vai ao navegador.
- Firebase Cloud Messaging: lembretes confiáveis quando o PWA estiver fechado
  (com consentimento explícito). Alarmes locais são somente complemento.

Alternativa equivalente: Supabase Auth (Google) + Postgres com RLS + Edge
Functions. A decisão deve considerar conta de nuvem, custo, região de dados e
política de privacidade. Não usar os dois ao mesmo tempo.

## Privacidade, criptografia e persistência

- HTTPS obrigatório, HSTS, TLS moderno e domínio próprio em produção.
- Criptografia em trânsito (TLS) e em repouso provida pelo serviço escolhido.
- Para conteúdo realmente confidencial, aplicar criptografia ponta a ponta no
  cliente: gerar uma chave aleatória AES-GCM por usuário, protegê-la por uma
  chave derivada de senha/frase secreta com Web Crypto + PBKDF2/Argon2id, e
  salvar no banco somente textos cifrados, IV e versão do esquema.
- O login Google sozinho não fornece uma senha disponível para derivar essa
  chave. Por isso E2EE requer uma frase secreta adicional e um fluxo de
  recuperação claramente informado; se a frase for perdida, os dados não
  poderão ser recuperados.
- Tokens/sessões devem usar o SDK oficial; nunca `localStorage` manual para
  tokens, client secret, chave de serviço ou dados sensíveis.
- Backup/exportação, exclusão de conta, retenção e política de privacidade
  devem ser definidos antes do lançamento.

## Entregas por fase

1. **Fundação** — criar projeto Firebase/Supabase, ambientes de dev/homologação
   e produção, domínio autorizado do OAuth, variáveis públicas separadas e
   regras de banco versionadas.
2. **Conta e migração** — tela de login Google, estado autenticado, botão sair,
   migração opt-in do `localStorage` para a conta e separação completa dos dados
   por usuário.
3. **Lembretes** — formulário com título, data, hora, fuso, repetição e status;
   validação no cliente e servidor; notificações web com permissão explícita;
   agendamento no backend e registro de entrega/falha.
4. **Responsividade** — abordagem mobile-first; navegação em uma coluna abaixo
   de 768 px, alvos de toque de pelo menos 44 px, modais que cabem na tela,
   teclado virtual testado, contraste e navegação por teclado/leitor de tela.
5. **E2EE e observabilidade** — implementar somente após decidir o modelo de
   recuperação; adicionar logs sem conteúdo sensível, alertas de autenticação e
   rotina de atualização de dependências.
6. **Qualidade** — testes unitários, integração com emuladores, fluxo OAuth,
   regras de autorização, modo offline/sincronização e testes em Chrome Android
   e Safari iOS.

## Critérios de aceite

- Um usuário não consegue ler, criar, alterar ou apagar documentos de outro.
- Encerrar sessão impede o acesso; uma nova sessão recupera somente os dados da
  própria conta.
- Lembretes respeitam fuso horário, não duplicam após reconexão e só notificam
  usuários que deram permissão.
- O layout funciona de 320 px a desktop, inclusive com zoom de 200%.
- Segredos não aparecem no repositório, bundle, logs, service worker ou DevTools.

## Plano de teste de invasão (homologação autorizada)

Executar apenas no ambiente de homologação, com contas e dados de teste e
autorização formal de escopo. Não testar produção sem autorização.

| Área | Teste | Resultado esperado |
| --- | --- | --- |
| Autenticação OAuth | redirecionamento, `state`/PKCE, sessão expirada, logout e troca de conta | sem sequestro de sessão ou login indevido |
| Autorização | trocar `uid` e IDs de documentos em chamadas autenticadas e não autenticadas | regras negam toda operação cruzada |
| API/regras | campos extras, tipos inválidos, payload grande, paginação e abuso de taxa | validação, limites e respostas seguras |
| XSS | inserir HTML/JS em tarefa, nota e lembrete | conteúdo é tratado como texto; CSP bloqueia execução |
| CSRF/CORS | origens não autorizadas e requisições forjadas | origens e credenciais restritas |
| Segredos | busca no Git, bundle e service worker; rotação de chaves | nenhum segredo exposto |
| Criptografia | inspeção do banco, IVs, troca de ciphertext e recuperação | dados cifrados e adulteração detectada |
| PWA | cache antigo, atualização do service worker e offline | não servir conteúdo sensível obsoleto nem quebrar sessão |
| Dependências | SCA, auditoria de licenças e atualização de vulnerabilidades | vulnerabilidades críticas bloqueiam release |

Ferramentas sugeridas: OWASP ZAP/Burp Suite Community para DAST controlado,
DevTools para inspeção de cliente, Firebase Emulator/Supabase local para regras,
e Dependabot/npm audit (quando houver dependências). Registrar evidência, risco,
correção, reteste e aprovação. Referência: OWASP ASVS e OWASP Top 10.

## Limite de segurança

Não existe certificação de “1005% seguro”. A meta de lançamento deve ser:
nenhuma vulnerabilidade crítica/alta aberta, ameaças conhecidas tratadas, pentest
com reteste aprovado e monitoramento/patches contínuos.
