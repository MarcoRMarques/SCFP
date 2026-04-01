let listaUsuariosGlobal = [];
// 🔥 CONFIGURAÇÃO DO SUPABASE
const supabaseUrl = "https://rjiydewkobfbevzfrxbz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaXlkZXdrb2JmYmV2emZyeGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODEyOTksImV4cCI6MjA4OTA1NzI5OX0.QvooykPpjtAptqIYG2cIsnTv7yZeNyNFQ5QirgaKeQ8";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 🔐 GERAR SENHA
function gerarSenha() {
  const tamanho = Math.floor(Math.random() * 3) + 6; // 6, 7 ou 8
  let senha = "";

  for (let i = 0; i < tamanho; i++) {
    senha += Math.floor(Math.random() * 10);
  }

  return senha;
}

// 🚀 CRIAR USUÁRIO
// 🚀 CRIAR USUÁRIO
async function criarUsuario() {
  const email = document.getElementById("novoEmail").value.trim();

  if (!email) {
    mostrarAviso("Digite o email");
    return;
  }

  const senha = gerarSenha();

  // 🔥 cria no AUTH
  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: senha,
  });

  if (error) {
    mostrarAviso("Erro ao criar usuário: " + error.message);
    return;
  }

  // 🔥 GARANTE QUE PEGAMOS O ID REAL
  const userId = data?.user?.id;

  if (!userId) {
    mostrarAviso("Erro: ID do usuário não retornado");
    return;
  }

  // 🔥 MOSTRA RESULTADO
  resultado.innerHTML = `
    <strong>✅ Acesso criado com sucesso</strong><br><br>
    📧 Email: ${email}<br>
    🔑 Senha: ${senha}
    <button onclick="copiarAcesso('${email}', '${senha}')">
      📋 Copiar acesso
    </button>
  `;

  // 🔥 SALVA NO BANCO COM ID CORRETO
  const { error: errorInsert } = await supabaseClient
    .from("usuarios_admin")
    .insert([
      {
        id: userId,
        email: email,
        senha: senha,
      },
    ]);

  if (errorInsert) {
    mostrarAviso("Erro ao salvar no banco: " + errorInsert.message);
    return;
  }

  carregarUsuarios();

  document.getElementById("novoEmail").value = "";
  document.getElementById("novoEmail").focus();
}
function copiarAcesso(email, senha) {
  const texto = `Acesso ao sistema SCFP:

Email: ${email}
Senha: ${senha}`;

  navigator.clipboard.writeText(texto);

  mostrarAviso("Acesso copiado!");
}
async function carregarUsuarios() {
  const { data, error } = await supabaseClient
    .from("usuarios_admin")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.log("Erro ao carregar usuários");
    return;
  }

  const lista = document.getElementById("listaUsuarios");
  const total = document.getElementById("totalUsuarios");
  if (total) total.textContent = data.length;

  if (!lista) return;

  lista.innerHTML = "";

  listaUsuariosGlobal = data;

  renderizarLista(data);
}

async function excluirUsuario(id) {
  abrirConfirmacao("Tem certeza que deseja excluir este usuário?", async () => {
    const { error } = await supabaseClient
      .from("usuarios_admin")
      .delete()
      .eq("id", id);

    if (error) {
      mostrarAviso("Erro ao excluir: " + error.message);
      return;
    }

    mostrarAviso("Usuário excluído com sucesso!", "sucesso");

    carregarUsuarios();
  });
}

async function toggleStatus(id, statusAtual) {
  const novoStatus = statusAtual === "ativo" ? "inativo" : "ativo";

  const { error } = await supabaseClient
    .from("usuarios_admin")
    .update({ status: novoStatus })
    .eq("id", id);

  if (error) {
    mostrarAviso("Erro ao atualizar status");
    return;
  }

  mostrarAviso("Status atualizado com sucesso!", "sucesso");

  carregarUsuarios();
}

function renderizarLista(usuarios) {
  const lista = document.getElementById("listaUsuarios");

  if (!lista) return;

  let html = "";

  usuarios.forEach((user) => {
    html += `
      <div class="linha">
        <div>👤 ${user.email}</div>

        <div>
          <span class="status ${user.status}">
            ${user.status}
          </span>
        </div>

        <div class="acoes">
          <button 
  class="btn-toggle ${user.status}" 
  onclick="toggleStatus('${user.id}', '${user.status}')"
>
  ${user.status === "ativo" ? "Desativar" : "Ativar"}
</button>

          <button class="btn-editar" onclick="editarUsuario('${user.id}')">
            Editar
          </button>

          <button class="btn-excluir" onclick="excluirUsuario('${user.id}')">
            Excluir
          </button>
        </div>
      </div>
    `;
  });

  lista.innerHTML = html;
}

function filtrarUsuarios() {
  const termo = document.getElementById("buscaUsuario").value.toLowerCase();

  const filtrados = listaUsuariosGlobal.filter((user) =>
    user.email.toLowerCase().includes(termo),
  );

  renderizarLista(filtrados);
}

window.onload = () => {
  carregarUsuarios();
  carregarLeads();
};
let acaoConfirmada = null;

function abrirConfirmacao(mensagem, callback) {
  document.getElementById("mensagemConfirmar").innerText = mensagem;
  document.getElementById("popupConfirmar").style.display = "flex";

  acaoConfirmada = callback;
}

function confirmarAcao() {
  if (!acaoConfirmada) return;

  const callback = acaoConfirmada;

  fecharConfirmacao();

  callback();
}

function fecharConfirmacao() {
  document.getElementById("popupConfirmar").style.display = "none";
  acaoConfirmada = null;
}

let usuarioEditandoId = null;

function editarUsuario(id) {
  usuarioEditandoId = id;

  const usuario = listaUsuariosGlobal.find((u) => u.id === id);

  document.getElementById("inputEditarEmail").value = usuario.email;

  document.getElementById("popupEditar").style.display = "flex";
}

function fecharEditar() {
  document.getElementById("popupEditar").style.display = "none";
  usuarioEditandoId = null;
}

async function salvarEdicao() {
  const novoEmail = document.getElementById("inputEditarEmail").value.trim();

  if (!novoEmail) {
    mostrarAviso("Digite um email válido");
    return;
  }

  const { error } = await supabaseClient
    .from("usuarios_admin")
    .update({ email: novoEmail })
    .eq("id", usuarioEditandoId);

  if (error) {
    mostrarAviso("Erro ao atualizar: " + error.message);
    return;
  }

  mostrarAviso("Usuário atualizado com sucesso!", "sucesso");

  fecharEditar();
  carregarUsuarios();
}
document.getElementById("novoEmail").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault(); // evita comportamento estranho
    criarUsuario();
  }
});

/* ============================= */
/* LISTAR LEADS DE VENDAS */
/* ============================= */

async function carregarLeads() {
  const { data, error } = await supabaseClient
    .from("leads_vendas")
    .select("*")
    .order("data", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  console.log("Leads:", data);
}
