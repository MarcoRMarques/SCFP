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
async function criarUsuario() {
  const email = document.getElementById("novoEmail").value.trim();

  if (!email) {
    alert("Digite o email");
    return;
  }

  const senha = gerarSenha();

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: senha,
  });

  if (error) {
    alert("Erro ao criar usuário: " + error.message);
    return;
  }

  resultado.innerHTML = `
  <strong>✅ Acesso criado com sucesso</strong><br><br>
  📧 Email: ${email}<br>
  🔑 Senha: ${senha}

<button onclick="copiarAcesso('${email}', '${senha}')">
    📋 Copiar acesso
  </button>

`;

  await supabaseClient.from("usuarios_admin").insert([
    {
      email: email,
      senha: senha,
    },
  ]);

  carregarUsuarios();
}

function copiarAcesso(email, senha) {
  const texto = `Acesso ao sistema SCFP:

Email: ${email}
Senha: ${senha}`;

  navigator.clipboard.writeText(texto);

  alert("Acesso copiado!");
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

  if (!lista) return;

  lista.innerHTML = "";

  data.forEach((user) => {
    lista.innerHTML += `
      <div style="margin-top:10px; padding:10px; background:#f1f5f9; border-radius:6px;">
        📧 ${user.email} <br>
        🔑 ${user.senha}
      </div>
    `;
  });
}
window.onload = () => {
  carregarUsuarios();
};
