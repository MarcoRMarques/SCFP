const supabaseUrl = "https://rjiydewkobfbevzfrxbz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaXlkZXdrb2JmYmV2emZyeGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODEyOTksImV4cCI6MjA4OTA1NzI5OX0.QvooykPpjtAptqIYG2cIsnTv7yZeNyNFQ5QirgaKeQ8";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
async function carregarLeads() {
  const { data, error } = await supabaseClient
    .from("leads_vendas")
    .select("*")
    .order("data", { ascending: false });

  if (error) {
    console.error("Erro ao carregar leads:", error);
    return;
  }

  const lista = document.getElementById("lista-leads");
  lista.innerHTML = "";

  let total = data.length;
  let pagos = 0;
  let pendentes = 0;

  data.forEach((lead) => {
    if ((lead.status_pagamento || "").toLowerCase() === "pago") {
      pagos++;
    } else {
      pendentes++;
    }

    const linha = document.createElement("div");
    linha.className = "linha-lead";

    linha.innerHTML = `
  <div>${lead.nome}</div>
  <div>${lead.email}</div>
  <div>${lead.whatsapp}</div>
  <div>${lead.plano}</div>
  <div>R$ ${lead.valor}</div>
  <div>${lead.vendedor}</div>
  <div>
    <button class="btn-status ${lead.status_pagamento.toLowerCase() === "pago" ? "pago" : "pendente"}" 
onclick="alternarStatus('${lead.id}', '${lead.status_pagamento}')">
  ${lead.status_pagamento}
</button>
  </div>
  <div>
  <button class="btn-acesso ${lead.acesso_criado ? "ok" : "pendente"}"
    onclick="alternarAcesso('${lead.id}', ${lead.acesso_criado})">
    ${lead.acesso_criado ? "criado" : "pendente"}
  </button>
</div>
`;

    lista.appendChild(linha);
  });

  document.getElementById("total-leads").textContent = total;
  document.getElementById("total-pagos").textContent = pagos;
  document.getElementById("total-pendentes").textContent = pendentes;
}

carregarLeads();

async function alternarStatus(id, statusAtual) {
  const novoStatus =
    statusAtual.toLowerCase() === "pendente" ? "pago" : "pendente";

  const { error } = await supabaseClient
    .from("leads_vendas")
    .update({ status_pagamento: novoStatus })
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar status");
    console.error(error);
    return;
  }

  carregarLeads();
}
async function alternarAcesso(id, statusAtual) {
  const novoStatus = !statusAtual;

  const { error } = await supabaseClient
    .from("leads_vendas")
    .update({ acesso_criado: novoStatus })
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar acesso");
    console.error(error);
    return;
  }

  carregarLeads();
}
