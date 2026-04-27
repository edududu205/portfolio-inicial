let dados = JSON.parse(localStorage.getItem("portfolio")) || [];
let filtroAtual = "todas";

function salvar(){
    let file = document.getElementById("imagem").files[0];
    let desc = document.getElementById("descricao").value;
    let categoria = document.getElementById("categoria").value;

    if(!file){
        alert("Selecione uma imagem!");
        return;
    }

    let reader = new FileReader();

    reader.onload = function(e){
        dados.push({
    img: e.target.result,
    descricao: desc,
    categoria: categoria
});

        localStorage.setItem("portfolio", JSON.stringify(dados));

        carregar();

        // limpar campos
        document.getElementById("imagem").value = "";
        document.getElementById("descricao").value = "";
    }

    reader.readAsDataURL(file);
}

function filtrar(cat){
    filtroAtual = cat;
    carregar();
}

function toggleTema(){
    document.body.classList.toggle("light-mode");

    // salvar preferência
    if(document.body.classList.contains("light-mode")){
        localStorage.setItem("tema", "light");
    } else {
        localStorage.setItem("tema", "dark");
    }
}

function carregar(){
    let galeria = document.getElementById("galeria");
    galeria.innerHTML = "";

    dados.forEach((item, index) => {

        if(
            filtroAtual === "todas" ||
            item.categoria === filtroAtual
        ){
            galeria.innerHTML += `
                <div class="card">
                    <img src="${item.img}">
                    
                    <div class="overlay">
                        <button onclick="excluir(${index})">🗑</button>
                        <p>${item.descricao}</p>
                    </div>
                </div>
            `;
        }

    });
}

function excluir(index){
    if(confirm("Tem certeza que deseja excluir?")){
        dados.splice(index, 1); // remove do array
        localStorage.setItem("portfolio", JSON.stringify(dados)); // atualiza
        carregar(); // recarrega a galeria
    }
}

// carregar tema salvo
let temaSalvo = localStorage.getItem("tema");

if(temaSalvo === "light"){
    document.body.classList.add("light-mode");
}

// carregar ao abrir o site
carregar();