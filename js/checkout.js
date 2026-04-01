console.log("CHECKOUT JS CARREGADO");
const SUPABASE_URL = "https://rjiydewkobfbevzfrxbz.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaXlkZXdrb2JmYmV2emZyeGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODEyOTksImV4cCI6MjA4OTA1NzI5OX0.QvooykPpjtAptqIYG2cIsnTv7yZeNyNFQ5QirgaKeQ8";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🔥 CAPTURAR VENDEDOR DA URL
const params = new URLSearchParams(window.location.search);
const vendedorUrl = params.get("vendedor");

if (vendedorUrl) {
  localStorage.setItem("vendedor", vendedorUrl);
}

window.gerarPagamento = function () {
  return window._gerarPagamento();
};

window._gerarPagamento = async function () {
  const nome = document.getElementById("nome").value;
  const cpf = document.getElementById("cpf").value;
  const email = document.getElementById("email").value;
  const whatsapp = document.getElementById("whatsapp").value;
  const plano = document.getElementById("plano").value;
  let valor = 0;

  if (plano === "mensal") {
    valor = 39.9;
  } else if (plano === "anual") {
    valor = 297;
  }
  const cupom = document.getElementById("cupom").value;
  const aceite = document.getElementById("aceite").checked;

  if (!nome || !cpf || !email || !whatsapp || !plano) {
    alert("Preencha todos os campos");
    return;
  }

  if (!aceite) {
    alert("Aceite os termos");
    return;
  }

  const vendedor = localStorage.getItem("vendedor");
  const vendedorFinal = vendedor || "direto";

  const hoje = new Date();
  let proxima = new Date();

  if (plano === "mensal") {
    proxima.setMonth(proxima.getMonth() + 1);
  } else {
    proxima.setFullYear(proxima.getFullYear() + 1);
  }

  const { error } = await supabase.from("leads_vendas").insert([
    {
      nome,
      cpf,
      email,
      whatsapp,
      vendedor: vendedorFinal,
      cupom,
      status_pagamento: "pendente",
      aceitou_termos: true,
      data: hoje,
      plano,
      valor: valor,
      proxima_cobranca: proxima,
    },
  ]);

  if (error) {
    alert("Erro ao salvar");
    console.error(error);
    return;
  }

  document.getElementById("pix-area").style.display = "block";
};

/* ============================= */
/* CONFIRMAÇÃO DE PAGAMENTO */
/* ============================= */

window.confirmarPagamento = function () {
  return window._confirmarPagamento();
};

window._confirmarPagamento = async function () {
  const email = document.getElementById("email").value;

  if (!email) {
    alert("Erro ao localizar seu cadastro.");
    return;
  }

  const { error } = await supabase
    .from("leads_vendas")
    .update({ status_pagamento: "aguardando_confirmacao" })
    .eq("email", email);

  if (error) {
    alert("Erro ao confirmar pagamento.");
    console.error(error);
    return;
  }

  alert("Pagamento informado com sucesso! Em breve você receberá acesso.");
};
