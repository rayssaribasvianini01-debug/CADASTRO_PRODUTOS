//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    // Método que calcula o subtotal do produto
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

// 1. Salvar os dados no navegador
function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

// 2. Carregar os dados salvos
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

// 🆕 Campo de pesquisa V4
const campoBusca = document.getElementById("campo-busca");

//
// FASE 4: Escuta de Eventos
//

// 1. Adicionar Produto pelo Formulário
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    const novoProduto = new Produto(nomeInput, precoInput, quantidadeInput);

    listaDeProdutos.push(novoProduto);

    salvarNoLocalStorage();

    atualizarInterface();
    formProduto.reset();
});

// 2. Limpar toda a tabela
btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        alert("A tabela já está vazia!");
        return;
    }

    if (confirm("Tem certeza que deseja remover todos os produtos?")) {
        listaDeProdutos.length = 0;

        localStorage.removeItem(CHAVE_STORAGE);

        atualizarInterface();
    }
});

// 🆕 3. Pesquisa em tempo real
campoBusca.addEventListener("input", function () {
    atualizarInterface();
});

//
// FASE 5: Funções de Atualização e Renderização da Interface
//

// 🆕 1. Função para filtrar os produtos
function obterProdutosFiltrados() {
    const termo = campoBusca.value.toLowerCase().trim();

    return listaDeProdutos.filter((produto) => {
        return produto.nome.toLowerCase().includes(termo);
    });
}

// 2. Remover um único produto pelo índice
function removerProduto(index) {
    listaDeProdutos.splice(index, 1);

    salvarNoLocalStorage();

    atualizarInterface();
}

// 🆕 3. Calcular o total apenas dos produtos visíveis
function atualizarTotalEstoque(produtosVisiveis) {
    const total = produtosVisiveis.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

// 4. Renderizar a tabela
function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    tabelaBody.innerHTML = "";

    // Obtém somente os produtos que correspondem à pesquisa
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

        // Encontra o índice original do produto na lista
        const indexOriginal = listaDeProdutos.indexOf(produto);

        const btnRemover = linha.querySelector(".btn-remover");

        btnRemover.addEventListener("click", () => {
            removerProduto(indexOriginal);
        });

        tabelaBody.appendChild(linha);
    });

    // Atualiza o total considerando somente os produtos encontrados
    atualizarTotalEstoque(produtosVisiveis);
}

// 5. Função principal que sincroniza a tela
function atualizarInterface() {
    renderizarTabela();
}

//
// FASE 6: Inicialização da Aplicação
//

carregarDoLocalStorage();
atualizarInterface();
