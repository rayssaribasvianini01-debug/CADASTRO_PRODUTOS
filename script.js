class Produto {
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {
        nome = nome.trim();
        preco = parseFloat(preco);
        quantidade = parseInt(quantidade);

        if (nome === "") {
            throw new Error("O nome do produto não pode ficar em branco.");
        }

        if (isNaN(preco) || preco <= 0) {
            throw new Error("O preço deve ser maior que zero.");
        }

        if (isNaN(quantidade) || quantidade <= 0) {
            throw new Error("A quantidade deve ser maior que zero.");
        }

        this.nome = nome;
        this.#preco = preco;
        this.#quantidade = quantidade;
    }

    get preco() {
        return this.#preco;
    }

    get quantidade() {
        return this.#quantidade;
    }

    calcularSubtotal() {
        return this.#preco * this.#quantidade;
    }
}

const listaDeProdutos = [];

const formProduto = document.getElementById("produto-form");

formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    try {
        const novoProduto = new Produto(
            nomeInput,
            precoInput,
            quantidadeInput
        );

        listaDeProdutos.push(novoProduto);

        renderizarTabela();
        atualizarTotalEstoque();

        formProduto.reset();

    } catch (erro) {
        alert(erro.message);
    }
});

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    tabelaBody.innerHTML = "";

    listaDeProdutos.forEach((produto, index) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button onclick="removerProduto(${index})">
                    Remover
                </button>
            </td>
        `;

        tabelaBody.appendChild(linha);
    });
}

function atualizarTotalEstoque() {
    const total = listaDeProdutos.reduce((acumulador, produto) => {
        return acumulador + produto.calcularSubtotal();
    }, 0);

    const elementoTotal = document.getElementById("total-estoque");

    elementoTotal.textContent = `Total em estoque: ${total.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    )}`;
}

function removerProduto(index) {
    listaDeProdutos.splice(index, 1);

    renderizarTabela();
    atualizarTotalEstoque();
}

const botaoLimpar = document.getElementById("limpar-tabela");

botaoLimpar.addEventListener("click", function () {
    listaDeProdutos.length = 0;

    renderizarTabela();
    atualizarTotalEstoque();
});
