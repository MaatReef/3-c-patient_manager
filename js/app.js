let DB;
const mascotaInput = document.querySelector('#mascota');
const propietarioInput = document.querySelector('#propietario');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const sintomasInput = document.querySelector('#sintomas');

const contenedorCitas = document.querySelector('#citas');
// UI
const formulario = document.querySelector('#nueva-cita');
formulario.addEventListener('submit', nuevaCita);

const heading = document.querySelector('#administra');

let editando = false;

window.onload = () => {
    eventListeners();

    crearDB();
}

// Registrar eventos
function eventListeners() {
    mascotaInput.addEventListener('input', datosCita);
    propietarioInput.addEventListener('input', datosCita);
    telefonoInput.addEventListener('input', datosCita);
    fechaInput.addEventListener('input', datosCita);
    horaInput.addEventListener('input', datosCita);
    sintomasInput.addEventListener('input', datosCita);
}

// Objeto con la información de la cita
const citaObj = {
    mascota: '',
    propietario: '',
    telefono: '',
    fecha: '',
    hora: '',
    sintomas: '',
}

class Citas {
    constructor(){
        this.citas = [];
    }

    agregarCita(cita) {
        this.citas = [...this.citas, cita];
    }

    eliminarCita(id){
        this.citas = this.citas.filter( cita => cita.id !== id)
    }

    editarCita(citaActualizada){
        this.citas = this.citas.map( cita => cita.id === citaActualizada.id ? citaActualizada : cita )
    }
}

class UI {

    imprimirAlerta(mensaje, tipo){
        // Crear el div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12');

        // Agregar clase en base al tipo de error
        if(tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        }else{
            divMensaje.classList.add('alert-sucess');
        }

        // Mensaje de error
        divMensaje.textContent = mensaje;

        // Agregar al Dom
        document.querySelector('#contenido').insertBefore(divMensaje, document.querySelector('.agregar-cita'));
        
        // Quitar la alerta después de 5 segundos
        setTimeout (() => {
            divMensaje.remove();
        }, 5000);
    }

    imprimirCitas(){
        
        this.limpiarHTML();
        
        this.textoHeading(citas);

        // Leer el contenido de la base de datos
        const objectStore = DB.transaction('citas').objectStore('citas');

        const fnTextoHeading = this.textoHeading;

        const total = objectStore.count();
        total.onsuccess = function() {
            fnTextoHeading(total.result)
        }

        objectStore.openCursor().onsuccess = function(e) {
            
            const cursor = e.target.result;

            if(cursor) {
                const { mascota, propietario, telefono, fecha, hora, sintomas, id} = cursor.value;
        
                const divCita = document.createElement('div');
                divCita.classList.add('cita', 'p-3');
                divCita.dataset.id = id;
            
                // Scripting de los elementos de la cita
                const mascotaParrafo = document.createElement('h2');
                mascotaParrafo.classList.add('card-title', 'font-weight-bolder');
                mascotaParrafo.textContent = mascota;

                const propietarioParrafo = document.createElement('p');
                propietarioParrafo.innerHTML = `
                    <span class="font-weight-bolder">Propietario: </span> ${propietario}
                `;

                const telefonoParrafo = document.createElement('p');
                telefonoParrafo.innerHTML = `
                    <span class="font-weight-bolder">Teléfono: </span> ${telefono}
                `;

                const fechaParrafo = document.createElement('p');
                fechaParrafo.innerHTML = `
                    <span class="font-weight-bolder">Fecha: </span> ${fecha}
                `;

                const horaParrafo = document.createElement('p');
                horaParrafo.innerHTML = `
                    <span class="font-weight-bolder">Hora: </span> ${hora}
                `;

                const sintomasParrafo = document.createElement('p');
                sintomasParrafo.innerHTML = `
                    <span class="font-weight-bolder">Sintomas: </span> ${sintomas}
                `;

                // Botón para eliminar esta cita
                const btnEliminar = document.createElement('button');
                btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
                btnEliminar.innerHTML = 'Eliminar <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
                btnEliminar.onclick = () => eliminarCita (id);

                // Añade un botón para editar
                const btnEditar = document.createElement('button');
                const cita = cursor.value;
                btnEditar.onclick = () => cargarEdicion(cita);

                btnEditar.classList.add('btn', 'btn-info');
                btnEditar.innerHTML = 'Editar <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>'
                

                // Agregar los parrafos al divCita
                divCita.appendChild(mascotaParrafo);
                divCita.appendChild(propietarioParrafo);
                divCita.appendChild(telefonoParrafo);
                divCita.appendChild(fechaParrafo);
                divCita.appendChild(horaParrafo);
                divCita.appendChild(sintomasParrafo);
                divCita.appendChild(btnEliminar);
                divCita.appendChild(btnEditar);

                // Agregar las citas al Html
                contenedorCitas.appendChild(divCita);

                // Ve al Siguiente elemento
                cursor.continue();
            }
        }
    }

    textoHeading(resultado) {
        if(resultado > 0 ) {
            heading.textContent = 'Administra tus Citas'
        } else {
            heading.textContent = 'No hay citas, comienza creando una..'
        }
    }

    limpiarHTML() {
        while(contenedorCitas.firstChild){
            contenedorCitas.removeChild (contenedorCitas.firstChild)
        }
    }
}


const administrarCitas = new Citas();
const ui = new UI(administrarCitas);



// Agrega datos al objeto de cita
function datosCita(e){
    citaObj[e.target.name] = e.target.value;
}


// Valida y agrega una nueva cita a la clase de citas
function nuevaCita(e){
    e.preventDefault();

    // Extraer la información del objeto de cita
    const { mascota, propietario, telefono, fecha, hora, sintomas} = citaObj;

    // validar
    if( mascota === '' || propietario === '' || telefono === '' || fecha === '' || hora === '' || sintomas === '' ) {
        ui.imprimirAlerta('Todos los campos son obligatorios', 'error');

        return;
    }

    if(editando) {
        // Estamos Editando
        administrarCitas.editarCita({...citaObj});

        // Edita en IndexDb
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas');

        objectStore.put(citaObj);

        transaction.oncomplete = () => {
            ui.imprimirAlerta('Guardado correctamente');

            formulario.querySelector('button[type="submit"]').textContent = 'Crear Cita';

            editando = false;
        }

        transaction.onerror = () => {
            console.log('Hubo un error');
        }




        // Regresar el texto del botón a su estado original
        formulario.querySelector('button[type="submit"]').textContent = 'Crear Cita';

        // QUitar modo edición 
        editando = false;
    } else {
        // generar un id único
        citaObj.id = Date.now();

        // Creando una nueva cita
        administrarCitas.agregarCita({...citaObj}); // Le pasamos una copia, no el valor completo. SPREAD

        // Insertar Registro en IndexedDB
        const transaction = DB.transaction(['citas'], 'readwrite');

        const objectStore = transaction.objectStore('citas');

        objectStore.add(citaObj);

        transaction.oncomplete = function() {
            // Mensaje de Agregado correctamente
            ui.imprimirAlerta('Se agregó correctamente');
        }

    }

    

    // Reiniciar el objeto para la validación
    reiniciarObjeto();

    // Reiniciar el formulario
    formulario.reset();

    // Mostrar el HTML de las 
    ui.imprimirCitas();

}

function reiniciarObjeto(){
    citaObj.mascota = '';
    citaObj.propietario = '';
    citaObj.telefono = '';
    citaObj.fecha = '';
    citaObj.hora = '';
    citaObj.sintomas = '';
}


function eliminarCita(id){
    
    const transaction = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaction.objectStore('citas');

    objectStore.delete(id);

    transaction.oncomplete = () => {
        console.log('Cita ${id} elminada..')
        ui.imprimirCitas();
    }

    transaction.onerror = () => {
        console.log('Hubo un error');
    }
    
}

// Carga los datos y el modo edición
function cargarEdicion(cita){
    const { mascota, propietario, telefono, fecha, hora, sintomas, id } = cita;



    // Llenar el objeto
    citaObj.mascota = mascota;
    citaObj.propietario = propietario;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha;
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id; 

    // Llenar los inputs
    mascotaInput.value = mascota;
    propietarioInput.value = propietario;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    // Cambiar el texto del botón
    formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';

    editando = true;
}

function crearDB(){
    // Crear la base de datos en version 1.0
    const crearDB = window.indexedDB.open('citas', 1);

    // Si hay un error
    crearDB.onerror = function() {
        console.log('Hubo un eror');
    }

    // Si todo sale bien
    crearDB.onsuccess = function() {
        console.log('BD Creada');

        DB = crearDB.result;

        // Mostrar citas al cargar (Pero IndexexDb ya esta listo)
        ui.imprimirCitas();
    }

    // Definir el schema
    crearDB.onupgradeneeded = function(e) {
        const db = e.target.result;

        const objectStore = db.createObjectStore('citas', {
            keyPath: 'id',
            autoIncrement: true
        });

        // Definir todas las columnas
        objectStore.createIndex('mascota', 'mascota', { unique: false} );
        objectStore.createIndex('propietario', 'propietario', { unique: false} );
        objectStore.createIndex('telefono', 'telefono', { unique: false} );
        objectStore.createIndex('fecha', 'fecha', { unique: false} );
        objectStore.createIndex('hora', 'hora', { unique: false} );
        objectStore.createIndex('sintomas', 'sintomas', { unique: false} );
        objectStore.createIndex('id', 'id', { unique: true} );

        console.log('DB Creada y lista');
    }
}