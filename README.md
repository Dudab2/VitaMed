# VitaMed 💊

Aplicação web desenvolvida para auxiliar idosos na organização e no acompanhamento de suas rotinas de medicamentos, permitindo também o acompanhamento por cuidadores e familiares.

O VitaMed tem como objetivo facilitar a identificação dos medicamentos por meio de fotos das embalagens, organizar os horários das doses e contribuir para uma administração mais segura dos medicamentos.

Projeto desenvolvido para a disciplina **Análise e Projeto de Sistemas**, do curso de Engenharia de Software, do UDF – Centro Universitário do Distrito Federal, no semestre 2026.2.

## Demonstração online

**Acesse o projeto:** https://dudab2.github.io/VitaMed/

O projeto possui uma interface web e um backend desenvolvido para processar as operações do sistema e realizar a comunicação com o banco de dados.

## Problema identificado

Muitos idosos apresentam dificuldades para lembrar os horários dos medicamentos e distinguir um remédio do outro. Essa dificuldade pode aumentar quando existe a necessidade de utilizar vários medicamentos ao longo do dia.

O VitaMed busca minimizar esse problema por meio de uma plataforma que centraliza as informações dos medicamentos, facilita a identificação visual das embalagens e permite o acompanhamento das doses por cuidadores e familiares.

O sistema é uma ferramenta de apoio à organização da rotina medicamentosa e não substitui prescrições ou orientações de profissionais de saúde.

O projeto está alinhado ao **ODS 3 – Saúde e Bem-Estar**, que busca assegurar uma vida saudável e promover o bem-estar para todos.

## Atores do sistema

| Ator | Descrição |
|---|---|
| Idoso | Usuário responsável pelo acompanhamento de seus medicamentos, recebimento de lembretes e confirmação das doses. |
| Cuidador | Usuário que acompanha a rotina medicamentosa do idoso vinculado e recebe alertas sobre doses não confirmadas. |
| Relógio do Sistema | Responsável pelo controle dos horários e pelo disparo dos lembretes programados. |

## Funcionalidades do sistema

O VitaMed contempla 15 casos de uso que representam as principais funcionalidades previstas para o sistema.

| UC | Funcionalidade |
|---|---|
| UC01 | Efetuar login |
| UC02 | Recuperar senha |
| UC03 | Gerenciar perfis e conta |
| UC04 | Cadastrar medicamento |
| UC05 | Anexar foto do medicamento |
| UC06 | Gerenciar medicamento (editar, pausar, reativar e excluir) |
| UC07 | Disparar lembrete |
| UC08 | Confirmar uso do medicamento |
| UC09 | Adiar lembrete (soneca) |
| UC10 | Registrar dose não tomada |
| UC11 | Receber alerta de dose não tomada |
| UC12 | Emitir histórico e relatórios |
| UC13 | Cadastrar contato de emergência |
| UC14 | Verificar registros de dose |
| UC15 | Alertar estoque baixo |

*As funcionalidades descritas representam o escopo do projeto. A implementação está sendo realizada gradualmente.*

## Regras de negócio

Entre as principais regras de negócio definidas para o VitaMed, destacam-se:

- **RN03 e RN23:** uma dose não confirmada após 15 minutos deve ser registrada como não confirmada, gerando um alerta ao cuidador uma única vez por dose.
- **RN04:** cada lembrete pode ser adiado no máximo duas vezes.
- **RN09:** um medicamento só pode ser excluído quando não houver dose pendente no dia.
- **RN12:** o sistema deve emitir um alerta quando o estoque de medicamentos for suficiente para, no máximo, três dias.
- **RN14:** após cinco tentativas incorretas de login, o acesso deve ser bloqueado durante 15 minutos.
- **RN25:** a senha deve possuir, no mínimo, oito caracteres, incluindo letras e números.

## Acessibilidade e usabilidade

Considerando que o público-alvo é composto principalmente por pessoas idosas, o desenvolvimento da interface considera requisitos específicos de acessibilidade e usabilidade.

Entre os principais critérios estão:

- Fontes grandes e de fácil leitura.
- Alto contraste entre textos e elementos visuais.
- Botões grandes e de fácil identificação.
- Organização simples das informações.
- Redução da quantidade de elementos por tela.
- Realização das principais ações em até três toques.

Esses critérios buscam proporcionar uma experiência mais intuitiva e acessível aos usuários.

## Tecnologias utilizadas

**Frontend**
- HTML5 – estrutura das páginas.
- CSS3 – estilização e organização visual.
- JavaScript – implementação das funcionalidades e interações da interface.

**Backend**
- Node.js – ambiente de execução JavaScript.
- Express – framework utilizado para criação das rotas e da API.
- MySQL2 – comunicação com o banco de dados MySQL.
- bcrypt – criptografia de senhas por meio de hash.
- dotenv – gerenciamento de variáveis de ambiente.
- CORS – configuração de acesso entre diferentes origens.

**Banco de dados**
- MySQL – armazenamento das informações do sistema.

**Hospedagem**
- GitHub Pages – disponibilização da interface web.

## Banco de dados

O sistema utiliza o banco de dados MySQL para armazenar e organizar as informações necessárias ao seu funcionamento.

A comunicação com o banco de dados é realizada pelo backend, desenvolvido em Node.js e Express, utilizando a biblioteca MySQL2.

As credenciais de acesso são configuradas por meio de variáveis de ambiente, evitando que informações sensíveis sejam inseridas diretamente no código-fonte.

A biblioteca bcrypt é utilizada para proteger as senhas dos usuários por meio de hash.

## Como executar o projeto localmente

### Pré-requisitos

- Node.js instalado.
- npm instalado.
- Acesso ao banco de dados MySQL.
- Git instalado (opcional).

### 1. Clonar o repositório

```bash
git clone https://github.com/dudab2/VitaMed.git
```

### 2. Acessar a pasta do projeto

```bash
cd VitaMed
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto e configure as informações de conexão com o banco de dados:

```env
PORT=3000
DB_HOST=seu_host
DB_PORT=sua_porta
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=defaultdb
```

Substitua os valores de exemplo pelas credenciais correspondentes ao seu banco de dados.

### 5. Iniciar o backend

Na raiz do projeto, execute:

```bash
node server/server.js
```

O servidor será iniciado na porta definida nas variáveis de ambiente, conforme a configuração do código.

### 6. Acessar a aplicação

Abra o arquivo `index.html` no navegador ou utilize o ambiente de execução configurado para o frontend.

Verifique se o endereço da API utilizado pelo frontend corresponde ao endereço do backend em execução.

**Importante:** o arquivo `.env` contém informações confidenciais e não deve ser enviado ao GitHub. O arquivo também deve estar incluído no `.gitignore`.

## Estrutura do projeto

```text
VitaMed/
├── node_modules/
├── server/
│   ├── ca.pem
│   ├── server_backup.js
│   └── server.js
├── .env
├── .gitattributes
├── .gitignore
├── app.js
├── index.html
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── style_melhorias.css
└── style.css
```

## Documentação do projeto

A documentação acadêmica do VitaMed contempla as etapas de análise e modelagem do sistema, incluindo:

- 28 requisitos funcionais.
- 26 requisitos não funcionais.
- 26 regras de negócio.
- Diagrama de casos de uso.
- Descrição dos 15 casos de uso.
- Diagramas de sequência.
- Diagrama de classes.
- Diagramas de atividades.
- Diagramas de objetos.

## Status do desenvolvimento

- [x] Levantamento dos requisitos funcionais.
- [x] Levantamento dos requisitos não funcionais.
- [x] Definição das regras de negócio.
- [x] Elaboração do diagrama de casos de uso.
- [x] Elaboração dos diagramas de sequência.
- [x] Desenvolvimento da interface inicial.
- [x] Implementação inicial do backend com Node.js e Express.
- [x] Configuração da conexão com o banco de dados MySQL.
- [x] Teste de conexão com o banco de dados.
- [x] Implementação do login.
- [x] Implementação do cadastro de medicamentos.
- [ ] Finalização da integração entre frontend e backend.
- [ ] Implementação das demais funcionalidades previstas.
- [ ] Elaboração dos diagramas de classes, atividades e objetos.
- [ ] Realização dos testes completos do sistema.

## Equipe

| Integrante | Matrícula |
|---|---|
| Érika Nunes Noleto | 44294450 |
| Maria Eduarda Gonçalves Rodrigues | 44012055 |
| Pedro Ruan de Oliveira Moura | 43985106 |
| Victor Hugo Teles Carvalho | 44013078 |

**Professor:** Gabriel de Oliveira Alves

## Licença

Projeto acadêmico, desenvolvido para fins educacionais e sem finalidade comercial.
