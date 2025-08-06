// CLASE SISTEMA (EJECUCIÓN)

class Sistema {
  constructor(nombreAplicacion) {
    this.nombreAplicacion = nombreAplicacion;
    this.usuarios = [];
    this.contrataciones = [];
  }

  // FUNCIONES EN SISTEMA

  // Recorre el array de usuarios para compararlo con el
  // nombre puesto(los nombres son únicos y case sensitive) y lo devuelve.

  buscarUnUsuarioPorNombre(nombre) {
    for (let i = 0; i < this.usuarios.length; i++) {
      if (this.usuarios[i].nombre.toUpperCase() === nombre.toUpperCase()) {
        return this.usuarios[i];
      }
    }
    return null;
  }

  // FUNCION DEL LOGIN
  // Valida si el usuario ingresado coincide con la contraseña guardada del mismo usuario.

  elUsuarioEsCorrecto(nombre, pass) {
    const item = this.buscarUnUsuarioPorNombre(nombre);
    if (item !== null && item.password === pass) {
      return true;
    } else {
      return false;
    }
  }

  // Chequea si el usuario es paseador con la propiedad de la clase,
  // solo puede ser true o false.

  esPaseador(nombre) {
    const item = this.buscarUnUsuarioPorNombre(nombre);
    if (item !== null && item.esPaseador === true) {
      return true;
    } else {
      return false;
    }
  }

  // Recorre el array de usuarios para compararlo con el
  // mail puesto y lo devuelve.

  buscarUnUsuarioPorMail(mail) {
    for (let i = 0; i < this.usuarios.length; i++) {
      if (this.usuarios[i].mail.toUpperCase() === mail.toUpperCase()) {
        return this.usuarios[i];
      }
    }
    return null;
  }

  // Convoca la función anterior y devuelve true o false
  // dependiendo de si existe un usuario con ese mail.

  existeUsuario(mail) {
    return this.buscarUnUsuarioPorMail(mail) !== null;
  }

  // FUNCION REGISTER
  // Valida si el password cumple todas las condiciones exigidas.

  esUnPasswordValido(pPass) {
    let tieneNumero = false;
    let tieneMayuscula = false;
    let tieneMinuscula = false;
    for (let i = 0; i < pPass.length; i++) {
      const item = pPass.charCodeAt(i);
      if (item >= 48 && item <= 57) {
        tieneNumero = true;
      } else if (item >= 65 && item <= 90) {
        tieneMayuscula = true;
      } else if (item >= 97 && item <= 122) {
        tieneMinuscula = true;
      }
    }
    if (tieneNumero && tieneMayuscula && tieneMinuscula && pPass.length >= 5) {
      return true;
    } else {
      return false;
    }
  }

  // FUNCION REGISTER
  // Valida que el usuario cumpla todas las condiciones exigidas
  // y no haya coincidencias.
  // En caso de error te lo menciona.

  validarDatosDeUsuario(nombre, mail, pass) {
    let errores = "";

    // Nombre vacío o solo espacios
    let soloEspacios = true;
    for (let i = 0; i < nombre.length; i++) {
      if (nombre[i] !== " ") {
        soloEspacios = false;
        break;
      }
    }
    if (nombre.length === 0 || soloEspacios) {
      errores += "<br>Debe ingresar un nombre de usuario";
    }

    // Usuario ya existe (clientes o paseadores)
    if (this.buscarUnUsuarioPorNombre(nombre)) {
      errores += "<br>El nombre de usuario ya existe";
    }

    // Nombre con espacios
    if (nombre.indexOf(" ") >= 0) {
      errores += "<br>El nombre no puede tener espacios";
    }

    // Mail inválido
    if (mail.indexOf("@") < 0 || mail.indexOf("@") !== mail.lastIndexOf("@")) {
      errores += "<br>El mail debe tener exactamente un '@'";
    }

    // Mail duplicado
    if (this.existeUsuario(mail)) {
      errores += "<br>El mail ya existe";
    }

    // Password inseguro
    if (!this.esUnPasswordValido(pass)) {
      errores +=
        "<br>El Password debe tener al menos 1 número, 1 mayúscula, 1 minúscula y 5+ caracteres";
    }

    return errores;
  }

  // FUNCION REGISTER
  // Valida que no haya errores, si no los hay, agrega el usuario al array.

  agregarUsuario(nombre, mail, pass, esPaseador, nombrePerro, tamanioPerro) {
    let errores = "";

    // Validaciones del perro
    if (!nombrePerro || nombrePerro.trim() === "") {
      errores += "<br>Debe ingresar el nombre del perro";
    }
    if (!tamanioPerro || tamanioPerro === "x") {
      errores += "<br>Debe seleccionar el tamaño del perro";
    }

    // Validaciones del usuario
    errores += this.validarDatosDeUsuario(nombre, mail, pass);

    // Si no hay errores, agrego el usuario
    if (errores === "") {
      this.usuarios.push(
        new Usuario(nombre, mail, pass, esPaseador, nombrePerro, tamanioPerro)
      );
    }

    return errores;
  }

  // FUNCIONES CONTRATACION
  // Retorna cuántos “espacios” ocupa un perro según su tamaño.
  obtenerCupoPorTamanio(tamanio) {
    if (tamanio === "chico") return 1; // pequeño → 1
    if (tamanio === "mediano") return 2; // medianoiano → 2
    if (tamanio === "grande") return 4; // grande → 4
    return 0; // otro → 0
  }

  // Suma los espacios ocupados de un array de asignaciones.
  obtenerCuposOcupados(nombrePaseador, asignaciones) {
    let total = 0;
    for (let i = 0; i < asignaciones.length; i++) {
      total += this.obtenerCupoPorTamanio(asignaciones[i].tamanio);
    }
    return total;
  }

  // Resta los espacios ocupados al cupo máximo del paseador.
  obtenerCuposDisponibles(nombrePaseador, asignaciones) {
    let paseador = this.buscarUnUsuarioPorNombre(nombrePaseador);
    return (
      paseador.cupoMaximo -
      this.obtenerCuposOcupados(nombrePaseador, asignaciones)
    );
  }

  // Verifica que todos los perros asignados sean del mismo tamaño.
  esCompatibleCon(nombrePaseador, tamanioNuevo, asignaciones) {
    if (asignaciones.length === 0) return true; // sin asignaciones → ok
    return asignaciones[0].tamanio === tamanioNuevo; // mismo tamaño que el primero
  }

  // Devuelve un array de paseadores que pueden aceptar al perro del usuario.
  VerPaseadoresDisponibles(usuarioLogueado) {
    let lista = []; // aquí acumulo los paseadores válidos
    let tamanioP = usuarioLogueado.tamanioPerro; // tamaño del perro del cliente

    for (let i = 0; i < this.usuarios.length; i++) {
      let usuario = this.usuarios[i];

      if (!usuario.esPaseador) continue; // filtra a los paseadores

      let perrosAsignados = this.obtenerPerrosAsignados(usuario.nombre); // perros ya asignados
      let cuposDisponibles = this.obtenerCuposDisponibles(
        usuario.nombre,
        perrosAsignados
      ); // cupos libres
      let cupoPorTamanio = this.obtenerCupoPorTamanio(tamanioP); // cupos que ocupa mi perro

      // si tiene espacio y es compatible de tamaño, lo agrego
      if (
        cuposDisponibles >= cupoPorTamanio &&
        this.esCompatibleCon(usuario.nombre, tamanioP, perrosAsignados)
      ) {
        lista.push(usuario);
      }
    }

    return lista; // retorno todos los paseadores que cumplen las condiciones
  }

  // Devuelve false si ya había una aceptación, true si creó la nueva solicitud.
  contratarPaseador(cliente, paseadorNombre) {
    for (let item of this.contrataciones) {
      if (item.cliente === cliente && item.estado === "Aceptada") {
        return false;
      }
    }

    for (let item of this.contrataciones) {
      if (item.cliente === cliente && item.estado === "pendiente") {
        item.estado = "cancelada";
        break;
      }
    }

    let nueva = new Contratacion(cliente, paseadorNombre, "pendiente");
    this.contrataciones.push(nueva);
    return true;
  }

  // Cancela la primera solicitud “pendiente” de un cliente.
  // Devuelve true si la canceló, false si no encontró ninguna.
  cancelarContratacionPendiente(cliente) {
    for (let i = 0; i < this.contrataciones.length; i++) {
      let item = this.contrataciones[i];
      if (item.cliente === cliente && item.estado === "pendiente") {
        item.estado = "cancelada";
        return true;
      }
    }
    return false;
  }

  // Devuelve el estado de la última contratación de
  // un cliente o "sin contratación" si no hay ninguna.
  obtenerEstadoContratacion(cliente) {
    for (let i = this.contrataciones.length - 1; i >= 0; i--) {
      const item = this.contrataciones[item];
      if (item.cliente === cliente) {
        return item.estado;
      }
    }
    return "sin contratación";
  }

  // Devuelve todas las contrataciones de un paseador con el estado indicado.
  obtenerContratacionesPorEstado(paseadorNombre, estado) {
    let resultado = [];
    for (let i = 0; i < this.contrataciones.length; i++) {
      let item = this.contrataciones[i];
      if (item.paseador === paseadorNombre && item.estado === estado) {
        resultado.push(item);
      }
    }
    return resultado;
  }

  // Intenta aceptar la contratación con el id dado.
  // Si no cumple reglas de tamaño o cupo, la rechaza y devuelve false;
  // si la acepta, limpia solicitudes incompatibles y devuelve true.
  aceptarContratacion(id) {
    for (let i = 0; i < this.contrataciones.length; i++) {
      let item = this.contrataciones[i];
      if (item.id === id) {
        let paseador = item.paseador;
        let cliente = this.buscarUnUsuarioPorNombre(item.cliente);
        let tamanio = cliente.tamanioPerro;

        if (
          !this.puedeAceptarContratacionDeTamanio(id, tamanio, paseador) ||
          !this.tieneCupoSuficiente(tamanio, paseador)
        ) {
          item.rechazar();
          return false;
        }

        item.aceptar();
        this.cancelacionAutomaticaDeReservasIncompatibles(
          paseador,
          item,
          tamanio
        );
        return true;
      }
    }
    return false;
  }

  // Rechaza otras solicitudes pendientes que no encajan (tamaño o cupo) tras aceptar una.
  cancelacionAutomaticaDeReservasIncompatibles(
    paseador,
    item,
    tamanioAceptado
  ) {
    let cupoMax = this.buscarUnUsuarioPorNombre(paseador).cupoMaximo;

    // sumamos solo las contrataciones ya aceptadas, SIN contar la actual
    let ocupados = this.obtenerCuposOcupados(
      paseador,
      this.obtenerPerrosAsignados(paseador)
    );

    // le sumamos el cupo del perro recién aceptado
    ocupados += this.obtenerEspaciosDeTamanio(tamanioAceptado);

    for (let otra of this.contrataciones) {
      if (
        otra.estado === "pendiente" &&
        otra.paseador === paseador &&
        otra.id !== item.id
      ) {
        let clientePendiente = this.buscarUnUsuarioPorNombre(otra.cliente);
        let tamanioPendiente = clientePendiente.tamanioPerro;
        let cupoNecesario = this.obtenerEspaciosDeTamanio(tamanioPendiente);

        // si los tamaños son incompatibles, rechazo
        if (
          tamanioAceptado !== "mediano" &&
          tamanioPendiente !== "mediano" &&
          !this.tamanioCompatible(tamanioAceptado, tamanioPendiente)
        ) {
          otra.rechazar(
            "Rechazado automáticamente por incompatibilidad de tamaño o falta de cupo."
          );
        }

        // si hay espacio y son compatibles, simulo aceptarlo
        else if (ocupados + cupoNecesario <= cupoMax) {
          ocupados += cupoNecesario;
        }

        // si no hay lugar, rechazo por cupo
        else {
          otra.rechazar();
        }
      }
    }
  }
  // recorre el array de contrataciones y devuelve la última contratacion del cliente
  obtenerUltimaContratacion(cliente) {
    for (let i = this.contrataciones.length - 1; i >= 0; i--) {
      if (this.contrataciones[i].cliente === cliente) {
        return this.contrataciones[i];
      }
    }
    return null;
  }

  // Devuelve true si el paseador tiene espacio para un perro de ese tamaño.
  tieneCupoSuficiente(tamanio, nombrePaseador) {
    let paseador = this.buscarUnUsuarioPorNombre(nombrePaseador);
    let cupoNecesario = this.obtenerEspaciosDeTamanio(tamanio);
    return paseador.cupoMaximo >= cupoNecesario;
  }

  // devuelve true cuando la comparacion es compatible, o sea se pueden mezclar
  tamanioCompatible(perroA, perroB) {
    if (perroA === "mediano" || perroB === "mediano") return true;
    return (
      !(perroA === "chico" && perroB === "grande") &&
      !(perroA === "grande" && perroB === "chico")
    );
  }

  // Convierte tamaño de perro en unidades de cupo.
  obtenerEspaciosDeTamanio(tamanio) {
    switch (tamanio) {
      case "chico":
        return 1;
      case "mediano":
        return 2;
      case "grande":
        return 4;
      default:
        return 0;
    }
  }

  // Comprueba que una nueva solicitud no choque con aceptadas (solo chico↔grande es incompatible).
  puedeAceptarContratacionDeTamanio(idContratacion, tamanio, nombrePaseador) {
    let aceptadas = this.obtenerContratacionesPorEstado(
      nombrePaseador,
      "Aceptada"
    );
    for (let item of aceptadas) {
      let tamanioPerro = this.buscarUnUsuarioPorNombre(
        item.cliente
      ).tamanioPerro;
      if (
        item.id !== idContratacion &&
        !this.tamanioCompatible(tamanio, tamanioPerro) // ← acá está el cambio
      ) {
        return false;
      }
    }
    return true;
  }

  // Marca una contratación como rechazada según su id. Devuelve true si la encontró.
  rechazarContratacion(id) {
    for (let item of this.contrataciones) {
      if (item.id === id) {
        item.rechazar();
        return true;
      }
    }
    return false;
  }

  // Devuelve lista de {nombre, tamanio} de perros de contrataciones aceptadas.
  obtenerPerrosAsignados(paseadorNombre) {
    const perros = [];
    for (let item of this.contrataciones) {
      if (item.paseador === paseadorNombre && item.estado === "Aceptada") {
        const cliente = this.buscarUnUsuarioPorNombre(item.cliente);
        if (cliente.nombrePerro) {
          perros.push({
            nombre: cliente.nombrePerro,
            tamanio: cliente.tamanioPerro,
          });
        }
      }
    }
    return perros;
  }

  // PRECARGA DE DATOS DE PASEADORES

  precargarDatos() {
    this.usuarios.push(
      new Paseador("Pedro-Paseador", "pedro@paseo.com", "!Pedro123")
    );
    this.buscarUnUsuarioPorNombre("Pedro-Paseador").cupoMaximo = 4;

    this.usuarios.push(
      new Paseador("Laura-Paseadora", "laura@paseo.com", "!Laura123")
    );
    this.buscarUnUsuarioPorNombre("Laura-Paseadora").cupoMaximo = 10;

    this.usuarios.push(
      new Paseador("Miguel-Paseador", "miguel@paseo.com", "!Miguel123")
    );
    this.buscarUnUsuarioPorNombre("Miguel-Paseador").cupoMaximo = 10;

    this.usuarios.push(
      new Paseador("Ana-Paseadora", "ana@paseo.com", "!Ana123")
    );
    this.buscarUnUsuarioPorNombre("Ana-Paseadora").cupoMaximo = 10;

    this.usuarios.push(
      new Paseador("Carlos-Paseador", "carlos@paseo.com", "!Carlos123")
    );
    this.buscarUnUsuarioPorNombre("Carlos-Paseador").cupoMaximo = 10;

    this.usuarios.push(
      new Paseador("Pablo-Ramirez", "pablo@paseo.com", "!Pablo123")
    );
    this.buscarUnUsuarioPorNombre("Pablo-Ramirez").cupoMaximo = 10;

    // PRECARGA DE DATOS DE USUARIOS

    this.agregarUsuario(
      "max90",
      "max90@mail.com",
      "Max90word",
      false,
      "Lolo",
      "chico"
    );
    this.agregarUsuario(
      "emili_21",
      "emili_21@mail.com",
      "Emili21word",
      false,
      "Tina",
      "mediano"
    );
    this.agregarUsuario(
      "robyX",
      "robyx@mail.com",
      "RobyX123",
      false,
      "Kira",
      "grande"
    );
    this.agregarUsuario(
      "valeZz",
      "valez@mail.com",
      "Vale1234",
      false,
      "Nina",
      "chico"
    );
    this.agregarUsuario(
      "lucho08",
      "lucho08@mail.com",
      "Lucho88",
      false,
      "Rex",
      "mediano"
    );
    this.agregarUsuario(
      "cam_03",
      "cam03@mail.com",
      "CamCam3",
      false,
      "Fido",
      "grande"
    );
    this.agregarUsuario(
      "dani_P",
      "danip@mail.com",
      "DaniP2024",
      false,
      "Toby",
      "chico"
    );
    this.agregarUsuario(
      "sofi1998",
      "sofi98@mail.com",
      "Sofi1998",
      false,
      "Milo",
      "mediano"
    );
    this.agregarUsuario(
      "agusL",
      "agusl@mail.com",
      "AgusL1",
      false,
      "Nala",
      "grande"
    );
    this.agregarUsuario(
      "leo_ur",
      "leour@mail.com",
      "LeoUr33",
      false,
      "Luna",
      "chico"
    );
    this.agregarUsuario(
      "julietaM",
      "julim@mail.com",
      "JuliM22",
      false,
      "Rocky",
      "mediano"
    );
    this.agregarUsuario(
      "nicoo",
      "nicoo@mail.com",
      "NicoO77",
      false,
      "Coco",
      "grande"
    );
    this.agregarUsuario(
      "ari123",
      "ari123@mail.com",
      "Ari1234",
      false,
      "Lupi",
      "chico"
    );
    this.agregarUsuario(
      "fer_fer",
      "ferfer@mail.com",
      "FerFer11",
      false,
      "Maxi",
      "mediano"
    );
    this.agregarUsuario(
      "bauti7",
      "bauti7@mail.com",
      "Bauti77",
      false,
      "Zeus",
      "grande"
    );
    this.agregarUsuario(
      "meliii",
      "meliii@mail.com",
      "Meliii8",
      false,
      "Simba",
      "chico"
    );
    this.agregarUsuario(
      "martuC",
      "martuc@mail.com",
      "MartuC99",
      false,
      "Leia",
      "mediano"
    );
    this.agregarUsuario(
      "santi.ort",
      "santi@mail.com",
      "Santi00",
      false,
      "Ragnar",
      "grande"
    );
    this.agregarUsuario(
      "florLop",
      "florl@mail.com",
      "FlorLop2",
      false,
      "Kovu",
      "chico"
    );
    this.agregarUsuario(
      "tomiZ",
      "tomiz@mail.com",
      "TomiZee3",
      false,
      "Arwen",
      "mediano"
    );
    // Contratación aceptada para probar alert de nuevas solicitudes
    // PRECARGA DE DATOS DE CONTRATACIONES

    this.contratarPaseador("max90", "Pedro-Paseador");
    this.contratarPaseador("emili_21", "Laura-Paseadora");
    this.contratarPaseador("robyX", "Carlos-Paseador");
    this.contratarPaseador("valeZz", "Miguel-Paseador");
    this.contratarPaseador("lucho08", "Ana-Paseadora");
    this.contratarPaseador("cam_03", "Carlos-Paseador");
    this.contratarPaseador("dani_P", "Miguel-Paseador");
    this.contratarPaseador("sofi1998", "Ana-Paseadora");
    this.contratarPaseador("agusL", "Pedro-Paseador");
    this.contratarPaseador("leo_ur", "Laura-Paseadora");
  }
}
