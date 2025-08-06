// Variables globales para controlar el usuario actual y clases CSS.
let usuarioLogueado = null;
const CLASE_USUARIO = "pagina-usuario";
const CLASE_PASEADOR = "pagina-paseador";

// Creo el sistema, cargo datos de ejemplo e inicio la interfaz.
const SISTEMA = new Sistema("Plataforma Paseadores");
SISTEMA.precargarDatos();
iniciarAplicacion();

// Asigno los eventos de los botones a sus funciones correspondientes.
document.querySelector("#btnLogin").addEventListener("click", login); // al hacer click en “Login”
document.querySelector("#btnLogout").addEventListener("click", logout); // al hacer click en “Logout”
document
  .querySelector("#btnRegistrase")
  .addEventListener("click", mostrarRegistro); // mostrar formulario de registro
document
  .querySelector("#btnCancelarRegistro")
  .addEventListener("click", volverALogin); // volver a login desde registro
document
  .querySelector("#btnRegistro")
  .addEventListener("click", registrarUsuario); // procesar registro de nuevo usuario
document
  .querySelector("#btnVerPaseadoresDisponibles")
  .addEventListener("click", verPaseadoresDisponibles); // mostrar lista completa de paseadores
document
  .querySelector("#btnCancelarContratacionPendiente")
  .addEventListener("click", cancelarContratacionPendiente); // cancelar solicitud pendiente
document
  .querySelector("#btnVerResumenPaseadores")
  .addEventListener("click", verResumenPaseadores); //Ver cantidad de perros por paseador   
  
  document.querySelector("#btnVerPaseadoresDisponiblePorTamanio")
  .addEventListener("click", filtrarPaseadoresPorTamanioPerro);



document
  .querySelector("#btnVerEstadoContratacion")
  .addEventListener("click", verEstadoContratacion); // ver estado de mi solicitud
document
  .querySelector("#btnVerContratacionesPendientesClientes")
  .addEventListener("click", PaseadorVerContratacionesPendientes); // paseador ve solicitudes pendientes
document
  .querySelector("#btnVerPerrosAsignados")
  .addEventListener("click", verPerrosAsignados); // paseador ve sus perros asignados

document
  .querySelector("#btnVerRechazadas")
  .addEventListener("click", PaseadorVerContratacionesRechazadas); // paseador ve sus perros asignados

// Inicializa la vista: oculta todo excepto el login.
function iniciarAplicacion() {
  ocultarElementosPorClase(CLASE_USUARIO);
  ocultarElementosPorClase(CLASE_PASEADOR);
  document.querySelector("#divLogin").style.display = "block"; // muestro Login
  document.querySelector("#divRegistro").style.display = "none"; // oculto Registro
  document.querySelector("#divPaginaUsuario").style.display = "none"; // oculto Página Usuario
  document.querySelector("#divPaginaPaseador").style.display = "none"; // oculto Página Paseador
  document.querySelector("#btnLogout").parentElement.style.display = "none"; // oculto Logout
}

// Intenta hacer login; muestra error o carga la página principal.
function login() {
  document.querySelector("#pErroresLogin").innerHTML = ""; // limpio mensajes
  let user = document.querySelector("#txtLoginUsuario").value.trim();
  let pass = document.querySelector("#txtLoginPassword").value;
  if (SISTEMA.elUsuarioEsCorrecto(user, pass)) {
    usuarioLogueado = SISTEMA.buscarUnUsuarioPorNombre(user); // guardo usuario
    mostrarPaginaPrincipal();
  } else {
    document.querySelector("#pErroresLogin").innerHTML =
      "Usuario o contraseña incorrectos";
  }
  document.querySelector("#txtLoginPassword").value = ""; // borro contraseña
}

// Toma datos del formulario y registra un nuevo usuario.
function registrarUsuario() {
  let nombre = document.querySelector("#txtRegistroUsuarioNombre").value;
  let mail = document.querySelector("#txtRegistroUsuarioMail").value;
  let password = document.querySelector("#txtRegistroUsuarioPass").value;
  let nombrePerro = document.querySelector("#txtRegistroNombrePerro").value;
  let tamanio = document.querySelector("#slcTamanioPerro").value;
  let errores = SISTEMA.agregarUsuario(
    nombre,
    mail,
    password,
    false,
    nombrePerro,
    tamanio
  );
  if (errores === "") {
    volverALogin(); // sin errores, vuelvo al login
  } else {
    document.querySelector("#pErroresRegistro").innerHTML = errores; // muestro errores
  }
}

// Desloguea y vuelve al inicio.
function logout() {
  usuarioLogueado = null;
  iniciarAplicacion();
}

// Muestra el formulario de registro.
function mostrarRegistro() {
  document.querySelector("#divLogin").style.display = "none";
  document.querySelector("#divRegistro").style.display = "block";
}

// Vuelve a la pantalla de login.
function volverALogin() {
  iniciarAplicacion();
}

// Decide qué pantalla mostrar según si es paseador o cliente.
function mostrarPaginaPrincipal() {
  document.querySelector("#btnLogout").parentElement.style.display =
    "list-item"; // muestro Logout
  document.querySelector("#divLogin").style.display = "none";
  document.querySelector("#divRegistro").style.display = "none";
  if (SISTEMA.esPaseador(usuarioLogueado.nombre)) {
    mostrarElementosPorClase(CLASE_PASEADOR);
    ocultarElementosPorClase(CLASE_USUARIO);
    document.querySelector("#divPaginaPaseador").style.display = "block";
  } else {
    mostrarElementosPorClase(CLASE_USUARIO);
    ocultarElementosPorClase(CLASE_PASEADOR);
    document.querySelector("#divPaginaUsuario").style.display = "block";
  }
}

// Oculta todos los elementos de una clase dada.
function ocultarElementosPorClase(clase) {
  let elemento = document.querySelectorAll("." + clase);
  elemento.forEach((element) => (element.style.display = "none"));
}

// Muestra todos los elementos de una clase dada.
function mostrarElementosPorClase(clase) {
  let elemento = document.querySelectorAll("." + clase);
  elemento.forEach((element) => (element.style.display = ""));
}

// Lista en tabla los paseadores con cupo disponible.
function verPaseadoresDisponibles() {
  let lista = SISTEMA.usuarios;
  let bodyTabla = document.querySelector("#tablaPaseadores tbody");
  let rows = "";

  for (let usuario of lista) {
    if (!usuario.esPaseador) continue; // solo paseadores
    let perrosAsignados = SISTEMA.obtenerPerrosAsignados(usuario.nombre);
    let cupoTamanio = SISTEMA.obtenerCupoPorTamanio(
      usuarioLogueado.tamanioPerro
    );
    let cupoDisponible = SISTEMA.obtenerCuposDisponibles(
      usuario.nombre,
      perrosAsignados
    );
    if (cupoDisponible <= 0) continue; // sin cupo, salto
    rows += `<tr>
      <td>${usuario.nombre}</td>
      <td>${cupoDisponible}</td>
      <td>
        <button data-nombre-paseador="${usuario.nombre}" class="btnContratar">
          Contratar
        </button>
      </td>
    </tr>`;
  }

  bodyTabla.innerHTML = rows;
  document.querySelector("#tablaPaseadores").style.display = "table";
  darFuncionalidadBotonesContratar();
}

// Asigna el evento de contratación a cada botón.
function darFuncionalidadBotonesContratar() {
  document
    .querySelectorAll(".btnContratar")
    .forEach((btn) => btn.addEventListener("click", uiContratarPaseador));
}
// Muestra la cantidad de perros por cada paseador
function verResumenPaseadores() {
  const body = document.querySelector("#tablaResumenPaseadores tbody");
  let rows = "";

  for (let i = 0; i < SISTEMA.usuarios.length; i++) {
    let usuario = SISTEMA.usuarios[i];
    if (usuario.esPaseador) {
      let perros = SISTEMA.obtenerPerrosAsignados(usuario.nombre);
      rows += `<tr>
        <td>${usuario.nombre}</td>
        <td>${perros.length}</td>
      </tr>`;
    }
  }

  body.innerHTML = rows;
  document.querySelector("#tablaResumenPaseadores").style.display = "table";
}


// Muestra solo los paseadores que aceptan el tamaño de tu perro.
function filtrarPaseadoresPorTamanioPerro() {
  let tamanio = usuarioLogueado.tamanioPerro;
  let lista = SISTEMA.usuarios;
  let bodyTabla = document.querySelector("#tablaPaseadores tbody");
  let rows = "";

  for (let i = 0; i < lista.length; i++) {
    let usuario = lista[i];
    if (!usuario.esPaseador) continue;

    let asignaciones = SISTEMA.obtenerPerrosAsignados(usuario.nombre);
    let cupoDisponible = SISTEMA.obtenerCuposDisponibles(usuario.nombre, asignaciones);
    let cupoTamanio = SISTEMA.obtenerCupoPorTamanio(tamanio);
    let compatible = SISTEMA.esCompatibleCon(usuario.nombre, tamanio, asignaciones);

    if (cupoDisponible >= cupoTamanio && compatible) {
      rows += `<tr>
        <td>${usuario.nombre}</td>
        <td>${cupoDisponible}</td>
        <td>
          <button data-nombre-paseador="${usuario.nombre}" class="btnContratar">Contratar</button>
        </td>
      </tr>`;
    }
  }

  bodyTabla.innerHTML = rows;
  document.querySelector("#tablaPaseadores").style.display = "table";
  darFuncionalidadBotonesContratar();
}

// Envía la petición de paseo para el paseador seleccionado.
// En caso de ya haber una contratación aceptada,
// avisa y ofrece la cancelación de la misma
function uiContratarPaseador() {
  let cliente = usuarioLogueado.nombre;
  let paseador = this.getAttribute("data-nombre-paseador");

  let aceptada = SISTEMA.contratarPaseador(cliente, paseador);

  if (!aceptada) {
    document.querySelector("#pEstadoContratacion").textContent =
      "Ya tienes una contratación aceptada.";
    document.querySelector("#btnCancelarContratacionPendiente").style.display =
      "none";
    return;
  }

  document.querySelector("#pEstadoContratacion").textContent =
    "Solicitud enviada. Estado: pendiente";
  document.querySelector("#btnCancelarContratacionPendiente").style.display =
    "block";
}

// Cancela tu solicitud pendiente si existe y muestra mensaje.
function cancelarContratacionPendiente() {
  let seCancelo = SISTEMA.cancelarContratacionPendiente(usuarioLogueado.nombre);
  let estadoContratacion = document.querySelector("#pEstadoContratacion");

  if (seCancelo) {
    estadoContratacion.textContent = "Contratación pendiente cancelada.";
  } else {
    estadoContratacion.textContent = "No hay contratación pendiente.";
  }
}

// Muestra el estado de tu última solicitud (o mensaje si fue rechazada).
function verEstadoContratacion() {
  let contratacion = SISTEMA.obtenerUltimaContratacion(usuarioLogueado.nombre);
  let mensaje = "";

  if (!contratacion) {
    mensaje = "No hay contratación registrada.";
  } else if (contratacion.estado === "Rechazada") {
    mensaje =
      "Solicitud rechazada: " +
      (contratacion.motivoRechazo || "Sin motivo especificado.");
  } else {
    mensaje = `Estado: ${contratacion.estado}`;
  }
  document.querySelector("#pEstadoContratacion").textContent = mensaje;
}

// Lista en la tabla todas las solicitudes pendientes que te hicieron.
function PaseadorVerContratacionesPendientes() {
  let listaOriginal = SISTEMA.obtenerContratacionesPorEstado(
    usuarioLogueado.nombre,
    "pendiente"
  );

  let lista = [];
  for (let item of listaOriginal) {
    let tamanio = SISTEMA.buscarUnUsuarioPorNombre(item.cliente).tamanioPerro;
    if (
      SISTEMA.puedeAceptarContratacionDeTamanio(
        item.id,
        tamanio,
        usuarioLogueado.nombre
      )
    ) {
      lista.push(item);
    }
  }

  let tablaSolicitudes = document.querySelector("#tablaSolicitudes tbody");
  let rows = "";

  for (let item of lista) {
    rows += `<tr>
      <td>${item.cliente}</td>
      <td>${item.estado}</td>
      <td>
        <button data-id="${item.id}" class="btnAceptar">ACEPTAR</button>
        <button data-id="${item.id}" class="btnRechazar">RECHAZAR</button>
      </td>
    </tr>`;
  }

  tablaSolicitudes.innerHTML = rows;
  document.querySelector("#tablaSolicitudes").style.display = "table";
  darFuncionalidadBotonesProcesarContratacion();
}

// Procesa el clic en “Aceptar” de una solicitud.
function aceptarClick() {
  let id = parseInt(this.getAttribute("data-id"), 10);
  SISTEMA.aceptarContratacion(id);
  PaseadorVerContratacionesPendientes(); // actualiza la lista
}

// Procesa el clic en “Rechazar” de una solicitud.
function rechazarClick() {
  let id = parseInt(this.getAttribute("data-id"), 10);
  SISTEMA.rechazarContratacion(id);
  PaseadorVerContratacionesPendientes(); // actualiza la lista
}

// Añade eventos a los botones Aceptar y Rechazar.
function darFuncionalidadBotonesProcesarContratacion() {
  document
    .querySelectorAll(".btnAceptar")
    .forEach((btn) => btn.addEventListener("click", aceptarClick));
  document
    .querySelectorAll(".btnRechazar")
    .forEach((btn) => btn.addEventListener("click", rechazarClick));
}

//Mustra los motivos de los perros rechazados
function PaseadorVerContratacionesRechazadas() {
  let lista = SISTEMA.obtenerContratacionesPorEstado(
    usuarioLogueado.nombre,
    "Rechazada"
  );

  let tablaSolicitudes = document.querySelector("#tablaSolicitudes tbody");
  let rows = "";

  for (let item of lista) {
    rows += `<tr>
      <td>${item.cliente}</td>
      <td>${item.estado}</td>
      <td>${item.motivoRechazo}</td>
    </tr>`;
  }

  tablaSolicitudes.innerHTML = rows;
  document.querySelector("#tablaSolicitudes").style.display = "table";
}

// Muestra en tabla los perros asignados y el porcentaje de cupo ocupado.
function verPerrosAsignados() {
  let perros = SISTEMA.obtenerPerrosAsignados(usuarioLogueado.nombre);
  let tablaPerros = document.querySelector("#tablaPerrosAsignados tbody");
  let cupos = document.querySelector("#infoCupos");
  let sinPerros = document.querySelector("#sinPerrosAsignados");

  if (perros.length === 0) {
    document.querySelector("#tablaPerrosAsignados").style.display = "none";
    cupos.textContent = "";
    sinPerros.style.display = "block";
    return;
  }

  let rows = "",
    ocupados = 0;
  for (let perro of perros) {
    rows += `<tr><td>${perro.nombre}</td><td>${perro.tamanio}</td></tr>`;
    ocupados += SISTEMA.obtenerCupoPorTamanio(perro.tamanio);
  }

  let total = usuarioLogueado.cupoMaximo;
  let porcentaje = ((ocupados / total) * 100).toFixed(2);
  tablaPerros.innerHTML = rows;
  document.querySelector("#tablaPerrosAsignados").style.display = "table";
  sinPerros.style.display = "none";
  cupos.textContent = `Cupos ocupados: ${ocupados} / ${total} (${porcentaje}%)`;
}
