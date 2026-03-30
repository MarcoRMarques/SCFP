// 🔥 CAPTURA INDICADOR
const urlParams = new URLSearchParams(window.location.search);
const vendedor = urlParams.get("vendedor");

if (vendedor) {
  localStorage.setItem("vendedor", vendedor);
}

// 🔥 BOTÃO DE COMPRA
function irParaCompra() {
  const vendedor = localStorage.getItem("vendedor");

  let url = "login.html";

  if (vendedor) {
    url += "?vendedor=" + vendedor;
  }

  window.location.href = url;
}
