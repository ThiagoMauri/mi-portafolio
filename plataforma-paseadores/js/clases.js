// CLASE USUARIO

class Usuario {
  constructor(nombre, mail, password, esPaseador, nombrePerro, tamanioPerro) {
    this.nombre = nombre;
    this.mail = mail;
    this.password = password;
    this.esPaseador = esPaseador;
    this.nombrePerro = nombrePerro;
    this.tamanioPerro = tamanioPerro;
    this.cupoMaximo = 10; // Valor por defecto de los paseadores
  }
}

// CLASE PASEADOR
class Paseador {
  constructor(nombre, mail, password) {
    this.nombre = nombre;
    this.mail = mail;
    this.password = password;
    this.esPaseador = true;
    this.nombrePerro = "";
    this.tamanioPerro = "";
    this.cupoMaximo = 10;
    this.motivoRechazo = "";
  }
}

// CLASE CONTRATACION

let ultimoIDContratacion = 0;

class Contratacion {
  constructor(cliente, paseador, estado = "pendiente") {
    this.id = ++ultimoIDContratacion;
    this.cliente = cliente;
    this.paseador = paseador;
    this.estado = estado; // "pendiente" ; "Aceptada" ; "Rechazada" , "cancelada"
  }

  aceptar() {
    if (this.estado === "pendiente") {
      this.estado = "Aceptada";
    }
  }

  rechazar(motivo = "") {
    if (this.estado === "pendiente") {
      this.estado = "Rechazada";
      this.motivoRechazo = motivo;
    }
  }

  cancelar() {
    if (this.estado === "pendiente") {
      this.estado = "cancelada";
    }
  }
}
