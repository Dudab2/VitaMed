# VitaMed 💊

Aplicativo para organizar a rotina de medicamentos de idosos, com acompanhamento por cuidadores e familiares. O sistema permite cadastrar medicamentos, consultar informações e acompanhar os horários das doses.

O VitaMed busca facilitar a identificação dos medicamentos por meio de imagens das caixas, lembretes e uma interface acessível, contribuindo para uma rotina mais organizada e segura.

Projeto desenvolvido para a disciplina **Análise e Projeto de Sistemas**, do curso de Engenharia de Software, UDF – Centro Universitário do Distrito Federal (2026.2).

## Demonstração online

**Acesse o projeto:** https://dudab2.github.io/VitaMed/

## Problema

Muitos idosos têm dificuldade para lembrar os horários dos medicamentos e distinguir um remédio do outro. Pessoas que utilizam vários medicamentos diariamente estão mais sujeitas a esquecer ou confundir doses.

O VitaMed busca solucionar esse problema reunindo os medicamentos em um único sistema, facilitando o acompanhamento da rotina pelo próprio idoso e por seus cuidadores.

O aplicativo não substitui a orientação dos profissionais de saúde. Seu objetivo é auxiliar na organização e no acompanhamento da prescrição médica.

Alinhado ao **ODS 3 – Saúde e Bem-Estar**.

## Atores

| Ator | Papel |
|---|---|
| Idoso | Cadastra seus medicamentos, recebe lembretes e confirma as doses |
| Cuidador | Acompanha os medicamentos e as doses do idoso vinculado |
| Relógio do Sistema | Controla os horários e dispara os lembretes |

## Funcionalidades (casos de uso)

| UC | Funcionalidade |
|---|---|
| UC01 | Efetuar login |
| UC02 | Recuperar senha |
| UC03 | Gerenciar perfis e conta |
| UC04 | Cadastrar medicamento |
| UC05 | Anexar foto do medicamento |
| UC06 | Gerenciar medicamento |
| UC07 | Disparar lembrete |
| UC08 | Confirmar uso do remédio |
| UC09 | Adiar lembrete (soneca) |
| UC10 | Registrar dose não tomada |
| UC11 | Receber alerta de dose não tomada |
| UC12 | Emitir histórico e relatórios |
| UC13 | Cadastrar contato de emergência |
| UC14 | Verificar registros de dose |
| UC15 | Alertar estoque baixo |

*Os casos de uso representam o escopo funcional planejado para o projeto. Nem todos estão implementados na versão atual.*

## Regras de negócio em destaque

- Uma dose não confirmada em **15 minutos** é marcada como não confirmada e o cuidador é alertado uma única vez por dose.
- Cada dose pode ser adiada no máximo **2 vezes**.
- O alerta de estoque baixo dispara quando restam doses para no máximo **3 dias**.
- Após **5 tentativas** de login incorretas, o acesso é bloqueado por 15 minutos.
- Um medicamento só pode ser excluído se não houver dose pendente no dia.
- A senha deve ter no mínimo 8 caracteres, com letras e números.

## Acessibilidade

Como o público-alvo é composto principalmente por idosos, o sistema considera requisitos específicos de acessibilidade e usabilidade:

- Fontes grandes e legíveis.
- Alto contraste entre os elementos.
- Botões grandes e de fácil identificação.
- Poucos elementos por tela.
- Ações principais realizadas em até 3 toques.

## Tecnologias utilizadas

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express
- MySQL2
- bcrypt
- dotenv
- CORS

**Banco de dados**
- MySQL
- Aiven Cloud

**Hospedagem**
- GitHub Pages (interface web)
- Render (backend)

## Banco de dados

O VitaMed utiliza um banco de dados MySQL hospedado na plataforma Aiven Cloud.

O backend é responsável pela comunicação entre a interface e o banco de dados, permitindo o processamento das operações do sistema.

As senhas dos usuários são protegidas utilizando a biblioteca bcrypt.

## Como executar o projeto localmente

**1. Clone o repositório:**

```bash
git clone https://github.com/dudab2/VitaMed.git
```

**2. Entre na pasta do projeto:**

```bash
cd VitaMed
```

**3. Instale as dependências:**

```bash
npm install
```

**4. Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto com as credenciais de conexão do banco de dados:

```env
PORT=3000
DB_HOST=seu_host
DB_PORT=sua_porta
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=defaultdb
```

**5. Inicie o servidor:**

Na raiz do projeto, execute:

```bash
node server/server.js
```

**6. Acesse a aplicação:**

Abra o frontend no navegador e utilize o endereço configurado para a API do backend.

**Importante:** Não compartilhe o arquivo `.env` nem envie credenciais de acesso ao banco de dados para o GitHub.

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

## Documentação acadêmica

A documentação completa do projeto inclui:

- 28 requisitos funcionais.
- 26 requisitos não funcionais.
- 26 regras de negócio.
- Diagrama de casos de uso.
- Descrição dos 15 casos de uso.
- Diagramas de sequência.
- Diagramas de classe.
- Diagramas de atividades.
- Diagramas de objetos.

## Status do projeto

- [x] Levantamento dos requisitos funcionais e não funcionais.
- [x] Definição das regras de negócio.
- [x] Diagrama de casos de uso.
- [x] Diagramas de sequência.
- [x] Desenvolvimento da interface inicial.
- [x] Implementação inicial do backend com Node.js e Express.
- [x] Criação da estrutura do banco de dados MySQL.
- [x] Configuração da conexão com o banco de dados Aiven.
- [x] Teste de conexão entre backend e banco de dados.
- [x] Implementação inicial do login.
- [x] Implementação inicial do cadastro de medicamentos.
- [ ] Finalização e integração das funcionalidades.
- [ ] Implementação dos demais casos de uso.
- [ ] Diagramas de classe, atividades e objetos.
- [ ] Testes completos do sistema.

## Equipe

| Nome | Matrícula |
|---|---|
| Érika Nunes Noleto | 44294450 |
| Maria Eduarda Gonçalves Rodrigues | 44012055 |
| Pedro Ruan de Oliveira Moura | 43985106 |
| Victor Hugo Teles Carvalho | 44013078 |

**Professor:** Gabriel de Oliveira Alves

## Licença

Projeto acadêmico, sem fins comerciais.
