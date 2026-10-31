
function entrar(tipo) {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        alert("Preencha o e-mail e a senha!");
        return;
    }

    if (senha !== "12345678") {
        alert("Senha incorreta!");
        return;
    }

    alert("Login realizado como " + tipo + "!");
}
