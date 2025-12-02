# Sistema de Quiz para Professores e Alunos

Um sistema completo de gerenciamento de quizzes educacionais construído com Next.js 15, Supabase e Tailwind CSS.

## Características

- **Para Professores:**
  - Criar e gerenciar turmas
  - Criar questões com múltipla escolha
  - Organizar questões em quizzes
  - Atribuir quizzes às turmas
  - Visualizar desempenho dos alunos

- **Para Alunos:**
  - Entrar em turmas usando código
  - Ver quizzes disponíveis
  - Responder quizzes
  - Ver resultados e feedback

## Requisitos

- Node.js 18+ 
- Conta Vercel (para desenvolvimento e deploy)
- Integração Supabase configurada

## Como Abrir o Site

### Opção 1: Desenvolvimento Local

1. **Clone o repositório ou baixe o código**
   \`\`\`bash
   git clone <seu-repositorio>
   cd <nome-do-projeto>
   \`\`\`

2. **Instale as dependências**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure as variáveis de ambiente**
   
   As variáveis de ambiente já estão configuradas no projeto v0:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - E outras variáveis do Postgres

4. **Execute o servidor de desenvolvimento**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Abra no navegador**
   
   Acesse: `http://localhost:3000`

### Opção 2: Deploy na Vercel (Recomendado)

1. **No v0, clique em "Publish"** no canto superior direito

2. **O projeto será automaticamente deployado na Vercel**
   
   Você receberá um link como: `https://seu-projeto.vercel.app`

3. **Acesse o link fornecido**

## Como Usar o Sistema

### Primeiro Acesso

1. **Crie uma conta:**
   - Acesse a página inicial
   - Clique em "Cadastrar"
   - Preencha: Nome, Email, Senha
   - Escolha o tipo: Professor ou Aluno

2. **Faça login:**
   - Use seu email e senha cadastrados

### Para Professores

1. **Criar uma Turma:**
   - Acesse "Minhas Turmas"
   - Clique em "Criar Nova Turma"
   - Preencha: Nome, Descrição
   - Um código será gerado automaticamente

2. **Criar Questões:**
   - Acesse "Questões"
   - Clique em "Nova Questão"
   - Preencha: Título, Pergunta, Alternativas, Resposta Correta

3. **Adicionar Questões à Turma:**
   - Vá em "Minhas Turmas"
   - Clique em "Gerenciar" na turma desejada
   - Na aba "Questões", adicione questões do seu banco

4. **Criar Quiz:**
   - Na mesma tela de gerenciar turma
   - Vá na aba "Quizzes"
   - Clique em "Criar Quiz"
   - Selecione as questões que fazem parte do quiz

5. **Compartilhe o código da turma com seus alunos**

### Para Alunos

1. **Entrar em uma Turma:**
   - Acesse "Entrar em Turma"
   - Digite o código fornecido pelo professor
   - Clique em "Entrar"

2. **Fazer um Quiz:**
   - Acesse "Quizzes"
   - Selecione a turma
   - Clique em "Começar Quiz"
   - Responda as questões
   - Clique em "Finalizar Quiz"

3. **Ver Resultados:**
   - Após finalizar, veja sua pontuação
   - Revise as respostas corretas

## Estrutura do Projeto

\`\`\`
├── app/
│   ├── api/              # API Routes (Next.js)
│   │   ├── auth/         # Autenticação
│   │   ├── questoes/     # Gerenciamento de questões
│   │   ├── quizzes/      # Gerenciamento de quizzes
│   │   ├── tentativas/   # Respostas dos alunos
│   │   └── turmas/       # Gerenciamento de turmas
│   ├── aluno/            # Página do aluno
│   ├── professor/        # Página do professor
│   ├── cadastro/         # Página de cadastro
│   ├── layout.tsx        # Layout global
│   └── page.tsx          # Página inicial (login)
├── lib/
│   └── supabase/         # Clients Supabase
│       ├── client.ts     # Client do browser
│       └── server.ts     # Client do servidor
├── components/ui/        # Componentes shadcn/ui
└── README.md             # Este arquivo
\`\`\`

## Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **Supabase** - Banco de dados e autenticação
- **Tailwind CSS v4** - Estilização
- **shadcn/ui** - Componentes UI
- **TypeScript** - Tipagem estática

## Banco de Dados

O sistema usa as seguintes tabelas no Supabase:

- `profiles` - Perfis de usuários (professores e alunos)
- `turmas` - Turmas criadas pelos professores
- `turma_alunos` - Relacionamento aluno-turma
- `questoes` - Questões criadas pelos professores
- `turma_questoes` - Questões disponíveis em cada turma
- `quizzes` - Quizzes criados pelos professores
- `quiz_questoes` - Questões de cada quiz
- `tentativas` - Respostas dos alunos

## Troubleshooting

### Erro de autenticação
- Verifique se as variáveis de ambiente do Supabase estão configuradas
- Tente fazer logout e login novamente

### Turmas não aparecem
- Verifique se você está logado com o tipo de usuário correto
- Para alunos: certifique-se de que entrou na turma com o código correto

### Quizzes não carregam
- Verifique se o professor adicionou questões ao quiz
- Tente recarregar a página

## Suporte

Para problemas ou dúvidas, entre em contato com o administrador do sistema.

## Licença

Este projeto é de uso educacional.
