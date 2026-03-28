// 🔥 CONFIGURAÇÃO DO SUPABASE
const supabaseUrl = "https://rjiydewkobfbevzfrxbz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaXlkZXdrb2JmYmV2emZyeGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODEyOTksImV4cCI6MjA4OTA1NzI5OX0.QvooykPpjtAptqIYG2cIsnTv7yZeNyNFQ5QirgaKeQ8";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 🔐 GERAR SENHA
function gerarSenha() {
  return Math.floor(1000 + Math.random() * 9000).toString();
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

  document.getElementById("resultado").innerHTML =
    `Usuário criado!<br>Email: ${email}<br>Senha: ${senha}`;
}
