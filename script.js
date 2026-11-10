
//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: Gerenciamento de Estado (Memória)
//
const listaDeProdutos = [];

//
// FASE 2.1: Persistência com localStorage
//
const CHAVE_STORAGE = "sistema_estoque_produtos";

function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos) {
        const produtosObjetos = JSON.parse(dadosSalvos);

        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(
                prod.nome,
                prod.preco,
                prod.quantidade
            );

            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

//
// FASE 3: Captura de Elementos do DOM
//
const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const campoBusca = document.getElementById("campo-busca");

// Elementos V5
const mensagemErro = document.getElementById("mensagem-erro");

const modalConfirmacao = document.getElementById("modal-confirmacao");
const textoConfirmacao = document.getElementById("texto-confirmacao");
const btnConfirmar = document.getElementById("btn-confirmar");
const btnCancelar = document.getElementById("btn-cancelar");

const modalBootstrap = document.getElementById("modal-bootstrap");
const btnBootstrap = document.getElementById("btn-bootstrap");
const fecharBootstrap = document.getElementById("fechar-bootstrap");

let acaoConfirmacao = null;

//
// FASE 4: Mensagens e Modais V5
//

// Mostrar mensagem na página
function mostrarErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.style.display = "block";
}

// Limpar mensagem
function limparErro() {
    mensagemErro.textContent = "";
    mensagemErro.style.display = "none";
}

// Abrir modal de confirmação
function abrirModal(mensagem, acao) {
    textoConfirmacao.textContent = mensagem;
    acaoConfirmacao = acao;
    modalConfirmacao.style.display = "flex";
}

// Fechar modal
function fecharModal() {
    modalConfirmacao.style.display = "none";
    acaoConfirmacao = null;
}

// Botão confirmar
btnConfirmar.addEventListener("click", function () {
    if (acaoConfirmacao) {
        const acao = acaoConfirmacao;
        fecharModal();
        acao();
    }
});

// Botão cancelar
btnCancelar.addEventListener("click", fecharModal);

// Abrir conceito Bootstrap
btnBootstrap.addEventListener("click", function () {
    modalBootstrap.style.display = "flex";
});

// Fechar conceito Bootstrap
fecharBootstrap.addEventListener("click", function () {
    modalBootstrap.style.display = "none";
});

//
// FASE 5: Escuta de Eventos
//

// 1. Adicionar Produto
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    limparErro();

    const nomeInput = document.getElementById("nome").value.trim();
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    // Validação dos dados
    if (nomeInput === "") {
        mostrarErro("Digite o nome do produto!");
        return;
    }

    if (precoInput === "" || parseFloat(precoInput) <= 0) {
        mostrarErro("Digite um preço maior que zero!");
        return;
    }

    if (quantidadeInput === "" || parseInt(quantidadeInput) <= 0) {
        mostrarErro("Digite uma quantidade maior que zero!");
        return;
    }

    const novoProduto = new Produto(
        nomeInput,
        precoInput,
        quantidadeInput
    );

    listaDeProdutos.push(novoProduto);

    salvarNoLocalStorage();

    atualizarInterface();
    formProduto.reset();
});

// 2. Limpar toda a tabela com modal
btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        mostrarErro("A tabela já está vazia!");
        return;
    }

    abrirModal(
        "Tem certeza que deseja remover todos os produtos?",
        function () {
            listaDeProdutos.length = 0;

            localStorage.removeItem(CHAVE_STORAGE);

            atualizarInterface();
            limparErro();
        }
    );
});

// 3. Pesquisa em tempo real
campoBusca.addEventListener("input", function () {
    atualizarInterface();
});

//
// FASE 6: Funções de Atualização e Renderização
//

// Filtrar produtos
function obterProdutosFiltrados() {
    const termo = campoBusca.value.toLowerCase().trim();

    return listaDeProdutos.filter((produto) => {
        return produto.nome.toLowerCase().includes(termo);
    });
}

// Remover produto com modal
function removerProduto(index) {
    abrirModal(
        "Deseja realmente excluir este produto?",
        function () {
            listaDeProdutos.splice(index, 1);

            salvarNoLocalStorage();
            atualizarInterface();
        }
    );
}

// Calcular total dos produtos visíveis
function atualizarTotalEstoque(produtosVisiveis) {
    const total = produtosVisiveis.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent =
        `Total em Estoque: R$ ${total.toFixed(2)}`;
}

// Renderizar tabela
function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    tabelaBody.innerHTML = "";

    const produtosVisiveis = obterProdutosFiltrados();

    if (produtosVisiveis.length === 0) {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td colspan="5" class="mensagem-vazia">
                Nenhum produto encontrado.
            </td>
        `;

        tabelaBody.appendChild(linha);

        atualizarTotalEstoque(produtosVisiveis);
        return;
    }

    produtosVisiveis.forEach((produto) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        const indexOriginal = listaDeProdutos.indexOf(produto);

        const btnRemover = linha.querySelector(".btn-remover");

        btnRemover.addEventListener("click", function () {
            removerProduto(indexOriginal);
        });

        tabelaBody.appendChild(linha);
    });

    atualizarTotalEstoque(produtosVisiveis);
}

// Atualizar interface
function atualizarInterface() {
    renderizarTabela();
}

//
// FASE 7: Inicialização
//
carregarDoLocalStorage();
atualizarInterface();
