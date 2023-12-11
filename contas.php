<?php

function CF($np, $t) {
    return $t / (1 - pow((1 + $t), -$np));
}

function calcularTaxaComEntrada($valorPrazo, $valorVista, $numPrestacoes) {
    $taxaEstimada = $valorPrazo / $valorVista;
    $maximoIteracoes = 100;

    for ($i = 0; $i < $maximoIteracoes; $i++) {
        $baseJurosA = pow(1 + $taxaEstimada, $numPrestacoes - 2);
        $baseJurosB = pow(1 + $taxaEstimada, $numPrestacoes - 1);
        $baseJurosC = pow(1 + $taxaEstimada, $numPrestacoes);

        $funcaoTaxa = $valorVista * $taxaEstimada * $baseJurosB - ($valorPrazo / $numPrestacoes) * ($baseJurosC - 1);
        $derivadaFuncaoTaxa = $valorVista * ($baseJurosB + $taxaEstimada * ($numPrestacoes - 1) * $baseJurosA) - $valorPrazo * $baseJurosB;

        $novaTaxa = $taxaEstimada - $funcaoTaxa / $derivadaFuncaoTaxa;
        $taxaEstimada = $novaTaxa;
    }

    return $taxaEstimada;
}

function calcularTaxa($valorPrazo, $valorVista, $numPrestacoes) {
    $taxaEstimada = $valorPrazo / $valorVista;
    $precisao = 1e-4;
    $diferenca = 1;

    while ($diferenca > $precisao) {
        $a = pow(1 + $taxaEstimada, -$numPrestacoes);
        $b = pow(1 + $taxaEstimada, -($numPrestacoes + 1));

        $f_t = $valorVista * $taxaEstimada - ($valorPrazo / $numPrestacoes) * (1 - $a);
        $f_prime_t = $valorVista - $valorPrazo * $b;

        $novaTaxa = $taxaEstimada - $f_t / $f_prime_t;
        $diferenca = abs($novaTaxa - $taxaEstimada);
        $taxaEstimada = $novaTaxa;
    }

    return $taxaEstimada;
}



if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Coleta os dados do formulário
    $np = $_POST['np'];
    $t = $_POST['tax'] / 100; // Convertendo a taxa para formato decimal
    $pv = $_POST['pv'];
    $pb = $_POST['pb'];
    $pp = $_POST['pp'];

    // Calcula o valor financiado
    $valorFinanciado = $pv - $pb;
    
    // Determina a taxa e o fator de financiamento
    if ($pp != 0.0) {
        if ($pb != 0.0) {
            $t = calcularTaxaComEntrada($pp, $pv, $np);
            $cf = CF($np - 1, $t);
        } else {
            $t = calcularTaxa($pp, $pv, $np);
            $cf = CF($np, $t);
        }
        $pmt = $valorFinanciado * $cf;
    } else {
        $cf = CF($np, $t);
        $pmt = $valorFinanciado * $cf;
    }

    // Inicializa as variáveis para a tabela
    $somaPrestacao = $somaJuros = $somaAmortizacao = 0;
    $sd = $valorFinanciado;
    
    // echo '<!DOCTYPE html>';
    // echo '<html lang="pt">';
    // echo '<head>';
    // echo '    <meta charset="UTF-8">';
    // echo '    <meta name="viewport" content="width=device-width, initial-scale=1.0">';
    // echo '    <title>Seu Título Aqui</title>';
    // echo '    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">';
    // echo '</head>';
    // echo '<body>';
    
    $tabelaHTML = "<div class='container mt-4'><h2 class='mb-3'>Tabela de Amortização</h2><table class='table table-striped'>";
$tabelaHTML .= "<thead class='thead-dark'><tr><th>Mês</th><th>Prestação</th><th>Juros</th><th>Amortização</th><th>Saldo Devedor</th></tr></thead><tbody>";

$meses = array(); // Inicializa 'meses' como um array vazio
$somaPrestacao = $somaJuros = $somaAmortizacao = 0;
$sd = $valorFinanciado; // Inicializa o saldo devedor

for ($i = 0; $i <= $np; $i++) {
    if ($i === 0) {
        // Primeira parcela é a entrada
        $meses[$i] = array($pb, 0, $pb, $sd);
    } else {
        $juros = $sd * $t;
        $amortizacao = $pmt - $juros;
        $sd -= $amortizacao;

        $meses[$i] = array($pmt, $juros, $amortizacao, $sd);
    }

    $somaPrestacao += $meses[$i][0];
    $somaJuros += $meses[$i][1];
    $somaAmortizacao += $meses[$i][2];

    // ... cálculos ...
    
    // Adiciona linha na tabela HTML
    $tabelaHTML .= "<tr>
        <td>{$i}</td>
        <td>" . number_format($meses[$i][0], 2) . "</td>
        <td>" . number_format($meses[$i][1], 2) . "</td>
        <td>" . number_format($meses[$i][2], 2) . "</td>
        <td>" . number_format($meses[$i][3], 2) . "</td>
    </tr>";
}

// Adiciona o total na tabela
$tabelaHTML .= "</tbody><tfoot><tr>
    <th>Total</th>
    <th>" . number_format($somaPrestacao, 2) . "</th>
    <th>" . number_format($somaJuros, 2) . "</th>
    <th>" . number_format($somaAmortizacao, 2) . "</th>
    <th>0.00</th>
</tr></tfoot></table></div>";

// Exemplo de uso
// $taxa = calcularTaxa(1000, 900, 12);
echo $tabelaHTML;
}
?>
