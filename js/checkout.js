window.addEventListener("load", function () {
  /* ============================= */
  /* 🔥 MÁSCARA CPF */
  /* ============================= */

  document.getElementById("cpf").addEventListener("input", function (e) {
    let v = e.target.value.replace(/\D/g, "");

    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    e.target.value = v;
  });

  /* ============================= */
  /* 🔥 MÁSCARA WHATSAPP */
  /* ============================= */

  document.getElementById("whatsapp").addEventListener("input", function (e) {
    let v = e.target.value.replace(/\D/g, "");

    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");

    e.target.value = v;
  });
  console.log("VERSAO NOVA CHECKOUT 123");

  const SUPABASE_URL = "https://rjiydewkobfbevzfrxbz.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaXlkZXdrb2JmYmV2emZyeGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODEyOTksImV4cCI6MjA4OTA1NzI5OX0.QvooykPpjtAptqIYG2cIsnTv7yZeNyNFQ5QirgaKeQ8";

  const { createClient } = window.supabase;
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  /* ============================= */
  /* 🔥 INICIAR CARREGAMENTO PLANOS */
  /* ============================= */

  carregarPlanos();

  // 🔥 CAPTURAR VENDEDOR DA URL
  const params = new URLSearchParams(window.location.search);
  const vendedorUrl = params.get("vendedor");

  /* ============================= */
  /* 🔥 BLOQUEIO DO BOTÃO ATÉ ACEITE */
  /* ============================= */

  const btn = document.getElementById("btn-gerar");
  const check = document.getElementById("aceite");

  btn.disabled = true;
  btn.style.opacity = "0.5";
  btn.style.cursor = "not-allowed";

  check.addEventListener("change", function () {
    if (check.checked) {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    } else {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    }
  });

  /* ============================= */
  /* 🔥 CARREGAR PLANOS DINÂMICOS */
  /* ============================= */

  async function carregarPlanos() {
    const { data, error } = await supabase
      .from("planos")
      .select("*")
      .eq("ativo", true);

    if (error) {
      console.error("Erro ao carregar planos:", error);
      return;
    }

    const select = document.getElementById("plano");
    select.innerHTML = '<option value="">Selecione o plano</option>';

    data.forEach((plano) => {
      const option = document.createElement("option");
      option.value = plano.nome;
      option.textContent = `${plano.nome} - R$ ${plano.valor}`;
      option.dataset.valor = plano.valor;

      select.appendChild(option);
    });
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

    /* ============================= */
    /* 🔥 VALOR DINÂMICO DO PLANO */
    /* ============================= */

    const selectPlano = document.getElementById("plano");

    const valor = parseFloat(
      selectPlano.options[selectPlano.selectedIndex].dataset.valor,
    );

    const cupom = document.getElementById("cupom").value;
    const aceite = document.getElementById("aceite").checked;

    /* ============================= */
    /* 🔥 VALIDAÇÃO PROFISSIONAL */
    /* ============================= */

    if (!nome) {
      alert("Digite seu nome completo");
      return;
    }

    if (cpf.length < 14) {
      alert("Digite um CPF válido");
      return;
    }

    if (!email.includes("@")) {
      alert("Digite um e-mail válido");
      return;
    }

    if (whatsapp.length < 14) {
      alert("Digite um WhatsApp válido");
      return;
    }

    if (!plano) {
      alert("Selecione um plano");
      return;
    }

    if (!aceite) {
      alert("Aceite os termos");
      return;
    }

    const vendedorFinal = vendedorUrl ? vendedorUrl : "direto";

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
        /* ============================= */
        /* 🔥 REGISTRO DE ACEITE */
        /* ============================= */
        data_aceite: new Date(),
      },
    ]);

    if (error) {
      alert("Erro ao salvar: " + error.message);
      console.error(error);
      return;
    }

    console.log("CHEGOU NO FINAL");
    /* ============================= */
    /* 🔥 TRANSIÇÃO PARA PAGAMENTO */
    /* ============================= */

    document.getElementById("form-card").style.display = "none"; // esconde formulário
    document.getElementById("pix-area").style.display = "block"; // mostra PIX
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
});
