function gerarRelatorioMov() {
  let contaFiltro = document.getElementById("filtroContaMov")?.value || "";

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
  <div id="relatorioConteudo">
    <h2>📊 Relatório - Livro Caixa</h2>

    <p><b>Período:</b> ${filtroInicio || "Início"} até ${filtroFim || "Hoje"}</p>
    <p><b>Conta:</b> ${contaFiltro || "Todas"}</p>

    <table border="1" width="100%" cellspacing="0" cellpadding="5">
      <thead style="background:#16a34a;color:white">
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

    <h3 style="color:#16a34a">Entradas: ${formatarMoeda(entradas)}</h3>
    <h3 style="color:#dc2626">Saídas: ${formatarMoeda(saidas)}</h3>
    <h2>Saldo: ${formatarMoeda(saldo)}</h2>
  </div>

  <br><br>

  <button onclick="exportarPDF()">📄 Baixar PDF</button>
  <button onclick="compartilharWhatsApp()">📲 WhatsApp</button>
  `;

  let win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
}
function exportarPDF() {
  let elemento = document.getElementById("relatorioConteudo");

  html2pdf()
    .set({
      margin: 10,
      filename: "relatorio.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(elemento)
    .save();
}
function compartilharWhatsApp() {
  let texto = "📊 Relatório Financeiro\n\n";

  let contaFiltro = document.getElementById("filtroContaMov")?.value || "";

  texto += "Conta: " + (contaFiltro || "Todas") + "\n";
  texto +=
    "Período: " + (filtroInicio || "-") + " até " + (filtroFim || "-") + "\n\n";

  let entradas = document.getElementById("subtotalEntradas").innerText;
  let saidas = document.getElementById("subtotalSaidas").innerText;

  texto += "Entradas: " + entradas + "\n";
  texto += "Saídas: " + saidas + "\n";

  let url = "https://wa.me/?text=" + encodeURIComponent(texto);

  window.open(url, "_blank");
}
