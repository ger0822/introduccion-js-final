class entidadesDeSalud {
    constructor(nombre){
        this.nombre = nombre;
    }

    mostrarInfo(){
        console.log(`Nombre: ${this.nombre}`);
    }
}


let entidadesDisponibles = [];

// Llenar el dropdown al cargar la página
poblarDropdown();

// Recuperar datos guardados en LocalStorage
let iterador = parseInt(localStorage.getItem('iterador')) || 0; 

const buttonHtml = document.querySelector(".send");

// Opciones de registro para agendar cita médica
function getOptions() {
    let Name = document.getElementById("name");
    let email = document.getElementById("email");
    let number = document.getElementById("number");
    const dropdown = document.getElementById("entidadesDropdown");
    const success = document.getElementById("success");
    const danger = document.getElementById("danger");

    const usuariosRegistrados = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];

    //  Imprimir el array de usuarios registrados
    // console.log("Usuarios registrados en memoria:", usuariosRegistrados);
    // console.log("Email a verificar:", email.value.trim());

    // Verificar si todos los campos están completos, incluyendo la selección del dropdown
    if (Name.value.trim() === "" || email.value.trim() === "" || number.value.trim() === "" || dropdown.value === "") {
        Swal.fire({
            icon: "warning",
            title: "Campos no Completados",
            text: "Por favor completa todos los campps",
            confirmButtonText: "Ok"
        });
        return; // Salir de la función si no se cumple
    }

    const usuarioExistente = usuariosRegistrados.find(usuario => usuario.email === email.value.trim());

    if (usuarioExistente) {
        Swal.fire({
            icon: "error",
            title: "Usuario ya registrado",
            text: "Este usuario ya ha registrado una cita antes",
            confirmButtonText: "Ok"
        });
    } else {
        // Si todos los campos están completos y el usuario no existe, registramos el usuario
        usuariosRegistrados.push({
            name: Name.value.trim(),
            email: email.value.trim(),
            number: number.value.trim(),
            entidad: dropdown.options[dropdown.selectedIndex].text
        });

        // Guardamos los datos en LocalStorage
        localStorage.setItem('usuariosRegistrados', JSON.stringify(usuariosRegistrados));

        // Incrementar contador y guardar en LocalStorage
        iterador++;
        localStorage.setItem('iterador', iterador);

        Swal.fire({
            icon: "success",
            title: "Cita agendada",
            text: "Tú cita ha sido agendada con éxito!",
            confirmButtonText: "Ok"
        });

        setTimeout(() => {
            Name.value = "";
            email.value = "";
            number.value = "";
            dropdown.value = ""; // Reseteamos el dropdown
        }, 4000);

        mostrarEnlaceHistorialCitas();
    }

    // Ocultarmos el mensaje de error
    setTimeout(() => {
        danger.style.display = 'none';
    }, 2000);
}

// Añadir eventos input para ocultar el mensaje de éxito cuando el usuario empiece a escribir
document.getElementById("name").addEventListener('input', () => {
    document.getElementById("success").style.display = 'none';
});
document.getElementById("email").addEventListener('input', () => {
    document.getElementById("success").style.display = 'none';
});
document.getElementById("number").addEventListener('input', () => {
    document.getElementById("success").style.display = 'none';
});
document.getElementById("entidadesDropdown").addEventListener('change', () => {
    document.getElementById("success").style.display = 'none';
});

// Función para mostrar el historial de citas usando SweetAlert (async)
async function mostrarHistorialCitas() {
    const usuariosRegistrados = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];

    if (usuariosRegistrados.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Sin historial',
            text: 'No se ha encontrado ningún historial de citas.',
            confirmButtonText: 'Ok'
        });
        return;
    }

    try {
        const response = await fetch('./data/entidadesinfo.json');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const detallesEntidades = await response.json();

        // Obtener el último usuario registrado
        const ultimoUsuario = usuariosRegistrados[usuariosRegistrados.length - 1];

        // Buscar los detalles de la entidad para el último usuario
        const detallesEntidad = detallesEntidades.find(entidad => entidad.nombre === ultimoUsuario.entidad);

        // Construir el HTML con la información adicional del ultimo usuario
        let historialHTML = `<li style="color: #ffffff;"><strong>Nombre:</strong> ${ultimoUsuario.name}, <strong>Email:</strong> ${ultimoUsuario.email}, <strong>Entidad:</strong> ${ultimoUsuario.entidad}`;

        // Añadir la información adicional de la entidad si está disponible
        if (detallesEntidad) {
            historialHTML += `<br><strong>Dirección:</strong> ${detallesEntidad.direccion}, <strong>Teléfono:</strong> ${detallesEntidad.telefono}, <strong>Especialidades:</strong> ${detallesEntidad.especialidades.join(', ')}`;
        }
        historialHTML += `</li>`;
        
        historialHTML += '</ul>';

        Swal.fire({
            title: 'Historial de citas',
            html: historialHTML, // Mostramos el historial con formato HTML
            confirmButtonText: 'Cerrar'
        });

    } catch (error) {
        console.error('Error al cargar los detalles de las entidades:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la información adicional de las entidades.',
            confirmButtonText: 'Ok'
        });
    }
}




function mostrarEnlaceHistorialCitas(){
    if(!document.getElementById("LinkHistorialCitas")){
        const linkHistorial = document.createElement("a");
        linkHistorial.id = "LinkHistorialCitas";
        linkHistorial.href = "#";
        linkHistorial.innerText = "Historial citas";
        linkHistorial.style.display = "block";
        linkHistorial.style.marginTop = "20px";

        linkHistorial.addEventListener("click", mostrarHistorialCitas);

        const container = document.querySelector(".container");
        container.appendChild(linkHistorial);
    }

}

// Poblamos el dropdown
async function poblarDropdown(){
    const dropdown = document.getElementById("entidadesDropdown");
    // const entidadesLista = document.getElementById("entidadesLista");
    dropdown.innerHTML = `<option value="">Seleccione una entidad</option>`;
    // entidadesLista.innerHTML = "";

    try {
        const respuesta =  await fetch('./data/entidades.json');
        if(!respuesta.ok){
            throw new Error(`Error HTTP: ${response.status}`)
        }


        const data = await respuesta.json();

        data.forEach((entidad, index) => {
            let option = document.createElement("option");
            option.text = entidad.nombre;
            option.value = index;
            dropdown.add(option);
    });

    dropdown.addEventListener('change', () =>{
        if (dropdown.value != ""){
            console.log("Entidades seleccionadas:", data[dropdown.value].nombre);
        }
    });

} catch(error){
    console.error("Error al cargar las entidades", error);
    }
}

// Asignamos el evento click al botón para poblar el dropdown
buttonHtml.addEventListener('click', getOptions);