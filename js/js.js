window.onload = function() {
        openTrivia();
        Cookies.set('resp', 0);
        RespCor = 0;
    }
    //funcion Ayax
function objetoAjax() {
    var xmlhttp = false;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
}
/* Función implementada con AJAX (se llama al recargar la página y al darle a: Volver a jugar!) */
function openTrivia() {
    numQuestion = 0;
    results = {}; // Parte del JSON devuelto que contiene las preguntas...
    /* Inicializar un objeto AJAX */
    var ajax = objetoAjax();
    ajax.open("GET", "https://opentdb.com/api.php?amount=10&category=18", true);
    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4 && ajax.status == 200) {
            var respuesta = JSON.parse(this.responseText);
            /* Leerá la respuesta que es devuelta por el controlador: */
            results = respuesta.results;
            // Usa la funcion para "setear" la pregunta 
            question();
        }
    }
    ajax.send();
}

function question() {
    //container de la pregunta
    var containerq = document.getElementById('container-q');
    //container de las respuestas
    var containerAns = document.getElementById('container-ans');
    //que respuesta es la correcta
    let correcta;
    respuestas = [];
    // guardamos la respuesta correcta
    correcta = results[numQuestion].correct_answer;
    // guardamos las respuestas incorrectas
    respuestas = results[numQuestion].incorrect_answers;
    //concatena las respuestas (correctas e incorrectas)
    respuestas = respuestas.concat(results[numQuestion].correct_answer);
    //Mezcla las respuestas
    respuestas = respuestas.sort(() => Math.random() - 0.5);
    //En que indice se encuentra la respuesta correcta
    indexCorrect = respuestas.indexOf(correcta);
    //Variable donde guardaremos la variable de las respuestas
    var recargaAns = "";
    // Variable donde guardaremos la pregunta
    var recargaq = `
    <p>${results[numQuestion].question}<p>`;
    //añadimos las respuestas a la variable anteriormente creada
    for (i = 0; i < respuestas.length; i++) {
        recargaAns += `<button type="button " id="respuesta-${i}" class="btn-lg btn-primary p-2 col-md-8 p-2 mt-3">${respuestas[i]}</button>`;
    };
    // { /* <button type="button " class="btn-lg btn-primary p-2 col-md-8 p-2 mt-3">${results[numQuestion].correct_answer}</button> */ }
    //Insertamos en el HTML la pregunta 
    containerq.innerHTML = recargaq;
    //Insertamos en el HTML las respuestas
    containerAns.innerHTML = recargaAns;
    //Seleccionamos los botones con la classe primary de la classe primary (los azules)
    document.querySelectorAll('.btn-primary').forEach(item => {
        //Ponemos el eventlistener a los items (botones azules seleccionados anteriormente)
        item.addEventListener('click', event => {
            //Comprovamos si la respuesta seleccionada es la correcta
            if (item.id == "respuesta-" + indexCorrect) {
                //le añadimos el color verde
                item.classList.add("btn-success");
                // miramos si la cookie existe
                if (Cookies.get('resp') != 1) {
                    // en la variable global de correct answers le sumamos 1
                    RespCor++;
                }
            } else {
                //si no es correcta ponemos la respuesta en color rojo
                item.classList.add("btn-danger");
            }
            //Setemaos la cookie de respuesta en uno, que quiere decir que se ha respondido
            Cookies.set('resp', 1);
            //seleccionamos todos los botones azules otra vez
            document.querySelectorAll('.btn-primary').forEach(item => {
                //les quitamos la clase de azul
                item.classList.remove("btn-primary");
                //condicional que comprueba si era una respuesta correcta o no
                if (item.id == "respuesta-" + indexCorrect) {
                    //boton de color verde
                    item.classList.add("btn-success");
                } else {
                    //boton de color rojo
                    item.classList.add("btn-danger");
                };
                //ACLARACION: hacemos dos veces lo de los colores para asegurar que en todos los casos los coloreas cambien
            });
        });
    });
    //añadimos un eventlistener al boton de "next question" (con id next-q)
    document.getElementById('next-q').addEventListener('click', passarQ)
}
//funcion que se activa al pulsr al next-q
function passarQ() {
    //Condicional que comprueba si la cookie de pregunta respodida es 1 y si quedan mas preguntas
    if ((numQuestion < results.length - 1) && Cookies.get('resp') == 1) {
        // Si hay más preguntas, hace lo siguiente: le suma 1 a la variable global numQuestion, ejecuta la funcion question
        numQuestion++;
        question();
        //reiniciamos la cookie que comprueba si hemos respondido
        Cookies.set('resp', 0);
        //Si no quedan más respuestas...
    } else if ((numQuestion >= results.length - 1)) {
        //container juego
        var containerG = document.getElementById('container-game');
        //container despues
        var containerAll = document.getElementById('container-all');
        //ponemos las estadisticas
        var contenidoAll = `
        <h3><i class="fad fa-check-circle"></i>  Has respondido bien a<span id="resp-Good">&nbsp${RespCor}&nbsp</span>preguntas</h3>
        <h3><i class="fad fa-times-circle"></i>  Has respondido mal a<span id="resp-Bad"> &nbsp${results.length - RespCor}&nbsp</span>preguntas</h3>
        <button id="btn-repeat" type="button" class="btn p-4 btn-info col-sm-1 mt-3"><i class="fad fa-repeat"></i></button>
        `;
        //Le ponemos la classe de bootstrap de display none
        containerG.classList.add("d-none");
        //le ponemos el contenido 
        containerAll.innerHTML = contenidoAll;
        //cuando pulsamos al boton de repetir....
        document.getElementById('btn-repeat').addEventListener('click', event => {
            // Abre un sweetAlert el cual nos pregunta si estamos seguros que queremos reiniciar el juego
            swal({
                    title: "Estas seguro?",
                    text: "Vas a reiniciar el juego... tus puntuaciones se van a perder si continuas!!!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                })
                .then((willDelete) => {
                    if (willDelete) {
                        swal("Has reiniciado la partida", {
                            icon: "success",
                        });
                        containerAll.innerHTML = "";
                        containerG.classList.remove("d-none");
                        openTrivia();
                        Cookies.set('resp', 0);
                        RespCor = 0;
                    } else {
                        swal("No has reiniciado la partida", "Tus estadisticas siguen seguras");
                    }
                });
        })
    } else {
        //lo que sucede si no has respondido
        swal("Ieeeeepa", "Tienes que seleccionar una respuesta", "error");
    }
}