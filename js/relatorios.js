function gerarRelatorioMov() {
  let contaFiltro = document.getElementById("filtroContaMov")?.value || "";
  let inicio = document.getElementById("filtroInicio")?.value || "";
  let fim = document.getElementById("filtroFim")?.value || "";

  let dados = mov.filter((m) => {
    if (contaFiltro && m.banco !== contaFiltro) return false;

    let dataMov = new Date(m.data);

    if (filtroInicio && dataMov < new Date(filtroInicio)) return false;
    if (filtroFim && dataMov > new Date(filtroFim)) return false;

    return true;
  });

  let entradas = 0;
  let saidas = 0;
  let saldo = 0;

  let linhas = "";

  dados.forEach((m) => {
    let valor = converterValor(m.valor);

    let entrada = "";
    let saida = "";

    if (m.tipo === "Entrada") {
      entradas += valor;
      saldo += valor;
      entrada = formatarMoeda(valor);
    } else {
      saidas += valor;
      saldo -= valor;
      saida = formatarMoeda(valor);
    }

    linhas += `
      <tr>
        <td>${formatarDataBR(m.data)}</td>
        <td>${m.banco}</td>
        <td>${m.descricao}</td>
        <td style="color:#16a34a">${entrada}</td>
        <td style="color:#dc2626">${saida}</td>
        <td>${formatarMoeda(saldo)}</td>
      </tr>
    `;
  });

  let html = `
<html>
<head>
  <title>SCFP - Relatório</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 30px;
      background: #f9fafb;
      color: #1f2937;
    }

    h1 {
      text-align: center;
      color: #16a34a;
      margin-bottom: 5px;
    }

    h2 {
      text-align: center;
      margin-bottom: 20px;
      color: #374151;
    }

    .info {
      margin-bottom: 15px;
      font-size: 14px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 14px;
    }

    th {
      background: linear-gradient(90deg, #16a34a, #22c55e);
      color: white;
      padding: 10px;
      text-align: left;
    }

    td {
      padding: 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    tr:nth-child(even) {
      background: #f3f4f6;
    }

    .entrada {
      color: #16a34a;
      font-weight: 600;
    }

    .saida {
      color: #dc2626;
      font-weight: 600;
    }

    .totais {
      margin-top: 20px;
      font-size: 16px;
    }

    .btn {
      background: #16a34a;
      color: white;
      border: none;
      padding: 10px 15px;
      margin-right: 10px;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn:hover {
      background: #15803d;
    }
  </style>
</head>

<body>

  <div style="text-align:center; margin-bottom:20px;">
  <div style="
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    color:#16a34a;
    font-size:22px;
    font-weight:700;
  ">
    <i data-lucide="landmark" style="color:#16a34a;width:26px;height:26px;"></i>
    <span>SCFP - Sistema de Controle Financeiro Pessoal</span>
  </div>

  <div style="
    margin-top:5px;
    font-size:18px;
    color:#374151;
    font-weight:500;
  ">
    Relatório - Livro Caixa
  </div>
</div>

  <div class="info">
    <b>Período:</b> ${filtroInicio || "-"} até ${filtroFim || "-"}<br>
    <b>Conta:</b> ${contaFiltro || "Todas as contas"}
  </div>

  <div id="relatorioConteudo">
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Banco</th>
          <th>Descrição</th>
          <th>Entrada</th>
          <th>Saída</th>
          <th>Saldo</th>
        </tr>
      </thead>
      <tbody>
        ${linhas}
      </tbody>
    </table>

    <div class="totais">
      <p class="entrada">Entradas: ${formatarMoeda(entradas)}</p>
      <p class="saida">Saídas: ${formatarMoeda(saidas)}</p>
      <h3>Saldo Final: ${formatarMoeda(saldo)}</h3>
    </div>
  </div>

  <br>

  <button class="btn" onclick="exportarPDF()">📄 Baixar PDF</button>
  <button class="btn" onclick="compartilharWhatsApp()">📲 WhatsApp</button>

</body>
</html>
`;

  let win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();

  setTimeout(() => {
    if (win.lucide) {
      win.lucide.createIcons();
    }
  }, 200);
}
function exportarPDF() {
  let elemento = document.getElementById("relatorioConteudo");

  if (!elemento) {
    mostrarAviso("Erro ao gerar PDF");
    return;
  }

  html2pdf()
    .set({
      margin: 10,
      filename: "SCFP_relatorio.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(elemento)
    .save();
}
function compartilharWhatsApp() {
  let contaFiltro = document.getElementById("filtroContaMov")?.value || "";

  let texto = "📊 SCFP - Relatório Financeiro\n\n";

  texto +=
    "Período: " + (filtroInicio || "-") + " até " + (filtroFim || "-") + "\n";
  texto += "Conta: " + (contaFiltro || "Todas") + "\n\n";

  texto += "Resumo:\n";

  texto +=
    "Entradas: " + document.getElementById("subtotalEntradas").innerText + "\n";
  texto +=
    "Saídas: " + document.getElementById("subtotalSaidas").innerText + "\n";

  let url = "https://wa.me/?text=" + encodeURIComponent(texto);

  window.open(url, "_blank");
}
function mostrarAviso(mensagem) {
  let aviso = document.createElement("div");

  aviso.innerText = mensagem;

  aviso.style.position = "fixed";
  aviso.style.top = "20px";
  aviso.style.right = "20px";
  aviso.style.background = "#16a34a"; // verde do sistema
  aviso.style.color = "white";
  aviso.style.padding = "12px 18px";
  aviso.style.borderRadius = "8px";
  aviso.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  aviso.style.zIndex = "9999";
  aviso.style.fontSize = "14px";

  document.body.appendChild(aviso);

  setTimeout(() => {
    aviso.remove();
  }, 3000);
}
