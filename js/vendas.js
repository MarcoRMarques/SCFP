// =============================
// 🔥 CAPTURA DO INDICADOR
// =============================
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const vendedorURL = urlParams.get("vendedor");

  const vendedorSalvo = localStorage.getItem("vendedor");

  // Só salva se vier da URL e ainda não existir
  if (vendedorURL && !vendedorSalvo) {
    localStorage.setItem("vendedor", vendedorURL);
  }
});

// =============================
// 🔥 REDIRECIONAMENTO PARA LOGIN
// =============================
function irParaCompra() {
  const vendedor = localStorage.getItem("vendedor");

  let url = "checkout.html";

  if (vendedor) {
    url += "?vendedor=" + encodeURIComponent(vendedor);
  }

  window.location.href = url;
}
