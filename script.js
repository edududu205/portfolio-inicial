const SUPABASE_URL = "https://friosuxybjmchgfhlcwk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaW9zdXh5YmptY2hnZmhsY3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODY1MzgsImV4cCI6MjA5Mjg2MjUzOH0.ghmEI9sxmtoiMhU_04n70VgotYRPVt6Ruxr_JpGFIqI"; // mantém a sua

// ✅ inicialização correta
const { createClient } = supabase;
const client = createClient(SUPABASE_URL, SUPABASE_KEY);
let imagemAtualId = null;
let imagemAtualUrl = null;
let filtroAtual = "todas";

document.getElementById("imagem").addEventListener("change", function(){
    let file = this.files[0];
    document.getElementById("nomeArquivo").innerText = file ? file.name : "";
});

document.getElementById("descricao").addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        e.preventDefault(); // evita comportamento padrão
        salvar();
    }
});

// ================= SALVAR =================
async function salvar(){
    try {
        let file = document.getElementById("imagem").files[0];
        let desc = document.getElementById("descricao").value;

        if(!file) return alert("Selecione uma imagem!");

        let nome = Date.now() + "_" + file.name;

        // 📦 upload da imagem
        let upload = await client.storage
            .from("imagens")
            .upload(nome, file);

        if(upload.error){
            console.log("Erro upload:", upload.error);
            return;
        }

        // 🔗 pegar URL pública
        let { data } = client.storage
            .from("imagens")
            .getPublicUrl(nome);

        let url = data.publicUrl;

        console.log("URL:", url);

        // 💾 salvar no banco
        let insert = await client.from("portfolio").insert([
            {
                img: url,
                descricao: desc
            }
        ]);

        console.log("INSERT:", insert);

        if(insert.error){
            console.log("Erro insert:", insert.error);
            return;
        }

        carregar();

    } catch (err) {
        console.log("Erro geral:", err);
    }

    document.getElementById("imagem").value = "";
document.getElementById("nomeArquivo").innerText = "";
document.getElementById("descricao").value = "";

}

// ================= FILTRO ===============

function filtrar(cat, btn){
    filtroAtual = cat;
    carregar();

    // remove ativo de todos
    document.querySelectorAll(".filtros button")
        .forEach(b => b.classList.remove("ativo"));

    // adiciona no clicado
    if(btn){
        btn.classList.add("ativo");
    }
}

// ================= TEMA =================
function toggleTema(){
    document.body.classList.toggle("light-mode");

    if(document.body.classList.contains("light-mode")){
        localStorage.setItem("tema", "light");
    } else {
        localStorage.setItem("tema", "dark");
    }
}

// ================= CARREGAR =================
async function carregar(){
    let galeria = document.getElementById("galeria");
    galeria.innerHTML = "";

    let { data, error } = await client.from("portfolio").select("*");

    if(error){
        console.log("Erro ao carregar:", error);
        return;
    }

    (data || []).forEach((item) => {

        if (
    filtroAtual === "todas" ||
    (item.descricao || "")
        .toLowerCase()
        .includes(filtroAtual)
         ) {
            galeria.innerHTML += `
                <div class="card">
                   <img src="${item.img}" onclick="abrirModal('${item.img}', '${item.descricao || ""}', '${item.id}')">
                   <button onclick="excluir('${item.id}', '${item.img}')">X</button>
                    <div class="overlay">
                        <p>${item.descricao || ""}</p>
                    </div>
                </div>
            `;
        }

    });
}

function iniciarApp(){

    document.getElementById("imagem").addEventListener("change", function(){
        let file = this.files[0];
        document.getElementById("nomeArquivo").innerText = file ? file.name : "";
    });

    document.getElementById("descricao").addEventListener("keydown", function(e){
        if(e.key === "Enter"){
            e.preventDefault();
            salvar();
        }
    });

    document.getElementById("btnExcluir").onclick = function(){
        if(imagemAtualId){
            excluir(imagemAtualId, imagemAtualUrl);
            fecharModal();
        }
    };

    
    document.getElementById("btnExcluir").onclick = function(){
        if(imagemAtualId){
            excluir(imagemAtualId, imagemAtualUrl);
            fecharModal();
         }
    };

    // fechar botão X
    document.getElementById("fechar").onclick = function(){
        fecharModal();
    };

    // clicar fora fecha
    document.getElementById("modal").onclick = function(e){
        if(e.target.id === "modal"){
            fecharModal();
        }
    };

    filtroAtual = "todas";

    carregar(); // 🚀 ESSA LINHA É O QUE VOCÊ QUER
}

// ================ ABRIR IMAGEM ==============
function abrirModal(img, desc, id){
    let modal = document.getElementById("modal");

    document.getElementById("modal-img").src = img;
    document.getElementById("modal-desc").innerText = desc;

    imagemAtualId = id;
    imagemAtualUrl = img;

    modal.classList.add("ativo");
}

// ================ FECHAR IMAGEM ==============
function fecharModal(){
    document.getElementById("modal").classList.remove("ativo");
}

// ================ EXCLUIR =================
async function excluir(id, url){
    if(!confirm("Excluir imagem?")) return;

    console.log("ID:", id);
    console.log("URL:", url);

    // 🔥 DELETE NO BANCO
    let { error: erroDB } = await client
        .from("portfolio")
        .delete()
        .eq("id", id);

    if(erroDB){
        console.log("Erro ao deletar no banco:", erroDB);
        alert("Erro ao deletar no banco");
        return;
    }

    // 🔥 PEGAR NOME DO ARQUIVO
    if(url){
        let nomeArquivo = url.split("/").pop();
    
        await client.storage
            .from("imagens")
            .remove([nomeArquivo]);
    }

    console.log("Deletado com sucesso");

    carregar();
}
// ================= TEMA SALVO =================
let temaSalvo = localStorage.getItem("tema");

if(temaSalvo === "light"){
    document.body.classList.add("light-mode");
}

document.addEventListener("DOMContentLoaded", iniciarApp);
