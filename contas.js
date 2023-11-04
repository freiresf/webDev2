
function CF(np,t){
    // t= t/100
    return t/(1-(1+t)**(-np))
}


// Função para encontrar a taxa de juros com pagamento inicial
function calcularTaxaComEntrada(valorPrazo, valorVista, numPrestacoes) {
    let taxaEstimada = valorPrazo / valorVista; // taxa
    const maximoIteracoes = 100; // max

    // Loop para ajustar a taxa usando o método de Newton
    for (let i = 0; i < maximoIteracoes; i++) {
        const baseJurosA = Math.pow(1 + taxaEstimada, numPrestacoes - 2);
        const baseJurosB = Math.pow(1 + taxaEstimada, numPrestacoes - 1);
        const baseJurosC = Math.pow(1 + taxaEstimada, numPrestacoes);

        // Calculando o valor da função f(t) para a taxa atual
        const funcaoTaxa = valorVista * taxaEstimada * baseJurosB - (valorPrazo / numPrestacoes) * (baseJurosC - 1);

        // Calculando a derivada f'(t) para a taxa atual
        const derivadaFuncaoTaxa = valorVista * (baseJurosB + taxaEstimada * (numPrestacoes - 1) * baseJurosA) - valorPrazo * baseJurosB;

        // Atualizando a taxa usando o método de Newton
        const novaTaxa = taxaEstimada - funcaoTaxa / derivadaFuncaoTaxa;

        taxaEstimada = novaTaxa;
    }

    return taxaEstimada;
}

function calcularTaxa(valorPrazo, valorVista, numPrestacoes) {
    // Inicializa a taxa estimada (t0) como o preço a prazo dividido pelo preço à vista
    let taxaEstimada = valorPrazo / valorVista;
    // Define a precisão desejada para a taxa
    const precisao = 1e-4;
    let diferenca = 1;

    // Loop do método de Newton para ajustar a taxa estimada
    while (diferenca > precisao) {
        // Calcula 'a' e 'b' com base na taxa estimada atual
        let a = Math.pow(1 + taxaEstimada, -numPrestacoes);
        let b = Math.pow(1 + taxaEstimada, -(numPrestacoes + 1));
        // Calcula f(t) e f'(t)
        let f_t = valorVista * taxaEstimada - (valorPrazo / numPrestacoes) * (1 - a);
        let f_prime_t = valorVista - valorPrazo * b;
        // Atualiza a taxa estimada
        let novaTaxa = taxaEstimada - f_t / f_prime_t;
        // Calcula a diferença entre a nova e a antiga taxa estimada
        diferenca = Math.abs(novaTaxa - taxaEstimada);
        taxaEstimada = novaTaxa;
    }

    // Retorna a taxa estimada com a precisão desejada
    return taxaEstimada;
}


function myfunc() {
    const pp = parseFloat($("#ipp").val()); // Preço a prazo
    let t = parseFloat($("#itax").val()) / 100; // Taxa de juros
    let pv = parseFloat($("#ipv").val()); // Preço à vista
    let pb = parseFloat($("#ipb").val()); // Inicialziado
    const np = parseInt($("#parc").val(), 10); // Número de prestações

    // pb = 50; // Valor da entrada ou primeira parcela

    // Calcular valor financiado após entrada
    let valorFinanciado = pv - pb;

    let cf = CF(np, t); // np - 1 pois a primeira parcela é a entrada
    let pmt = valorFinanciado * cf; // Prestação após a entrada

    let meses = {};
    let sd = valorFinanciado; // Saldo devedor inicia após a entrada

    if ((pp)!=0.0) {
        if((pb)!=0.0){
            t = calcularTaxaComEntrada(pp, pv, np);  
            cf = CF(np - 1, t);          
        } // Recalcular taxa se preço a prazo foi fornecido
        else{
            t = calcularTaxa(pp, pv, np);  
            cf = CF(np, t);                    
        }
        pmt = valorFinanciado * cf;
    }
    let somaPrestacao = 0;
    let somaJuros = 0;
    let somaAmortizacao = 0;

// Inicializa o HTML da tabela
let tabelaHTML = "<table border='1'><tr><th>Mês</th><th>Prestação</th><th>Juros</th><th>Amortização</th><th>Saldo Devedor</th></tr>";

    for (let i = 0; i <= np; i++) {
        if (i === 0) {
            meses[i] = [pb, 0, pb, sd]; // Primeira parcela é a entrada
        } else {
            let juros = sd * t;
            let u = pmt - juros; // Amortização
            sd = sd - u;

            meses[i] = [pmt, juros, u, sd];

            let msg = `Mês: ${i} - PMT: ${pmt}, Juros: ${juros}, Amort: ${u}, SD: ${sd}`;  
        }
        somaPrestacao += meses[i][0];
        somaJuros += meses[i][1];
        somaAmortizacao += meses[i][2];

        // Adiciona a linha na tabela
        tabelaHTML += `<tr>
            <td>${i}</td>
            <td>${meses[i][0].toFixed(2)}</td>
            <td>${meses[i][1].toFixed(2)}</td>
            <td>${meses[i][2].toFixed(2)}</td>
            <td>${meses[i][3].toFixed(2)}</td>
        </tr>`;
    }
    tabelaHTML += `<tr>
        <th>Total</th>
        <th>${somaPrestacao.toFixed(2)}</th>
        <th>${somaJuros.toFixed(2)}</th>
        <th>${somaAmortizacao.toFixed(2)}</th>
        <th>0.00</th>
    </tr>`;

    // Fecha a tabela
    tabelaHTML += "</table>";

    // Atualiza o conteúdo da div 'tabelaAmortizacao' com a tabela HTML
    document.getElementById("tabelaAmortizacao").innerHTML = tabelaHTML;
}