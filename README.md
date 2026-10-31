# VitaMed

Aplicativo para organizar a rotina de medicamentos de idosos, com acompanhamento por cuidadores e familiares. O app avisa no horário de cada dose, mostrando o nome, a dosagem e a **foto da caixa** do remédio, para que a pessoa o reconheça pela imagem.

Projeto da disciplina **Análise e Projeto de Sistemas**, Engenharia de Software, UDF – Centro Universitário do Distrito Federal (2025.2).

> Este repositório contém o **protótipo navegável** do VitaMed. A documentação de requisitos e a modelagem UML estão no documento do trabalho.

## Problema

Muitos idosos têm dificuldade para lembrar os horários dos remédios e para distinguir um medicamento do outro, e quem toma vários por dia está mais sujeito a esquecer ou errar uma dose. O VitaMed reúne tudo em um só lugar e dá ao cuidador a visão do que foi tomado. O app não substitui a orientação dos profissionais de saúde: ele organiza a rotina e ajuda a seguir a prescrição médica.

Alinhado ao **ODS 3 – Saúde e Bem-Estar**.

## Atores

| Ator | Papel |
|---|---|
| Idoso | Cadastra seus remédios, recebe os lembretes e confirma as doses |
| Cuidador | Acompanha as doses do idoso vinculado e recebe alertas |
| Relógio do Sistema | Dispara os lembretes e controla os prazos |

## Funcionalidades (casos de uso)

| UC | Funcionalidade |
|---|---|
| UC01 | Efetuar login |
| UC02 | Recuperar senha |
| UC03 | Gerenciar perfis e conta (idoso, cuidador, alergias, vínculos e fuso horário) |
| UC04 | Cadastrar medicamento |
| UC05 | Anexar foto do medicamento |
| UC06 | Gerenciar medicamento (editar, pausar, reativar e excluir) |
| UC07 | Disparar lembrete |
| UC08 | Confirmar uso do remédio |
| UC09 | Adiar lembrete (soneca) |
| UC10 | Registrar dose não tomada |
| UC11 | Receber alerta de dose não tomada |
| UC12 | Emitir histórico e relatórios |
| UC13 | Cadastrar contato de emergência |
| UC14 | Verificar registros de dose |
| UC15 | Alertar estoque baixo |

## Regras de negócio em destaque

- Uma dose não confirmada em **15 minutos** é marcada como "não confirmada" e o cuidador é alertado, uma única vez por dose (RN03, RN23).
- Cada dose pode ser adiada no máximo **2 vezes** (RN04).
- O alerta de estoque baixo dispara quando restam doses para no máximo **3 dias** (RN12).
- Após **5 tentativas** de login incorretas, o acesso é bloqueado por 15 minutos (RN14).
- Um medicamento só pode ser excluído se não houver dose pendente no dia (RN09).
- A senha deve ter no mínimo 8 caracteres, com letras e números (RN25).

## Acessibilidade

O público é idoso, então a interface segue os requisitos de usabilidade do projeto: fonte grande, alto contraste, poucos elementos por tela, botões grandes e ações principais em até 3 toques (RNF01, RNF06 e RNF22).

## Tecnologias

- HTML5
- CSS3
- JavaScript

## Como executar

1. Baixe ou clone o repositório:
   ```bash
   git clone <URL-DO-REPOSITORIO>
   ```
2. Abra a pasta do projeto.
3. Dê dois cliques em `index.html` para abrir no navegador (não precisa instalar nada).

## Estrutura do projeto

```
VitaMed/
├── index.html
├── style.css
├── app.js
└── README.md
```

> Ajuste esta seção para refletir os arquivos reais do seu projeto.

## Documentação

A documentação completa do trabalho inclui:

- Requisitos funcionais (28), requisitos não funcionais (26) e regras de negócio (26)
- Diagrama de casos de uso e descrição dos 15 casos de uso
- Diagramas de sequência (um por funcionalidade principal)
- Diagramas de classe, de atividades e de objetos

## Status do projeto

- [x] Requisitos e regras de negócio
- [x] Diagrama de casos de uso
- [x] Diagramas de sequência
- [ ] Protótipo: tela de login em andamento
- [ ] Demais telas do protótipo
- [ ] Diagramas de classe, atividades e objetos

> Atualize esta lista conforme o trabalho avançar.

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
