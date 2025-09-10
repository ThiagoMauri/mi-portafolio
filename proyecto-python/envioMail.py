from tkinter import *
import tkinter
from tkinter import Label, ttk
# Esta importacion es para manejar el filesystem. en este proyecto la usamos para verificar
# si existen los archivos .json y el logo para mostrar en la primera pestaña
import os
# Libretria para trabajar con archivos Json
# usamos dos metodos dump (grabar a archivo) y load (cargar desde archivo)
import json

# Esta importacion es para formar el header del mail
from email.mime.multipart import MIMEMultipart
# Esta importacion es para formar el body del mail
from email.mime.text import MIMEText
# Esta importacion es para establecer la comunicacion SMTP
import smtplib
# Solo para manejar error de conexion al servidor (dns mail ingresado No existe)
from socket import gaierror

# Esta libreria nos permite trabajar con fecha, en este proyecto la usamos para obtener la fecha actual
# y usamos el metodo strftime que nos permite pasar la fecha de formato datetime a string y darle un formato
# para luego grabarlo en el Json de enviados.json
from datetime import datetime

# Lista que contendran informacion de Contactos y correos enviados, estas listas se llenaran lineas mas abajos
# Cargando toda la informacion que tendran los Json.
libreta = []
enviados = []

## Tratado de persistencia de Libreta de Direcciones
# Verificamos si el archivo libreta.json existe, si no existe lo creamos
# con los datos incial en vacio
file_libreta = "libreta.json"
if (os.path.exists(file_libreta) == False):
    file = open("libreta.json", "w")
    file.write("{\"libreta\" : []}")
    file.close()

# Leo todo el contenido del Json y lo almaceno en la lista libreta
# Libreta es una variable que contiene una lista de diccionarios, cada indice 
# es un diccionario que contiene los datos de cada contacto
def cargarLibretaMemoria():
    with open("libreta.json", "r") as file:
        data = json.load(file)
        # Verifico que el archivo contenta al menos un contacto grabado
        if (len(data['libreta']) > 0):
            for contacto in data['libreta']:
                libreta.append(contacto)
            # Funcion para ordenar la lista libreta utilizando como criterio
            # el atributo nombre de cada diccionario
            libreta.sort(key=lambda x: x["nombre"])
cargarLibretaMemoria()

# Grabo lo que contiene la lista libreta en el Json
# Este proceso corre cada vez que modifico la lista
# Ya sea por agregar un contacto nuevo, modificar o eliminar
def graboLibretaFile():
    with open('libreta.json', 'w') as fp:
        json.dump({"libreta" : libreta}, fp)

## Tratado de persistencia de Correos Enviados
# Verificamos si el archivo enviados.json existe, si no existe lo creamos
# con los datos incial en vacio
file_libreta = "enviados.json"
if (os.path.exists(file_libreta) == False):
    file = open("enviados.json", "w")#encoding='utf-8'
    file.write("{\"enviados\" : []}")
    file.close()

# Leo todo el contenido del Json y lo almaceno en la lista enviados
# Enviados es una variable que contiene una lista de correos enviados, cada indice 
# es un diccionario que contiene los datos de cada envio
def cargarEnviadosMemoria():
    with open("enviados.json", "r") as file:
        data = json.load(file)
        # Leo si el archivo tiene al menos un correo enviado guardado
        if (len(data['enviados']) > 0):
            for enviado in data['enviados']:
                enviados.append(enviado)
cargarEnviadosMemoria()

# Grabo lo que contiene la lista enviados en el Json
# Este proceso corre cada vez que se envia un correo nuevo
# o se borra uno ya enviado desde la pestaña "Correos enviados"
def graboEnviadosFile():
    with open('enviados.json', 'w') as fp:
        json.dump({"enviados" : enviados}, fp)

# Creo el Frame principal
root = tkinter.Tk()
# Le seteo el nombre en la barra de tarea
root.title("Envio Correo")
# Especifico la resolucion del frame
root.geometry("600x400")
# Especificamos que no se pueda cambiar el tamaño del Frame es decir siempre va a tener
# el tamaño especificado en la linea anterior
root.resizable(False, False)

# Definimos las variables asignadas a los Entry
## Variables usadas para el Form de envio de correo
smtp_servidor = StringVar()
smtp_puerto = StringVar()
smtp_from = StringVar()
smtp_password = StringVar()
smtp_destinatario = StringVar()
smtp_asunto = StringVar()
resultado_envio = StringVar()
## Variables usadas para el Form de libretas de contactos
libreta_nombre = StringVar()
libreta_telefono = StringVar()
libreta_direccion = StringVar()
libreta_correo = StringVar()
resultado_operacion_contactos = StringVar()
## Variables usadas para el Form de correos enviados
enviados_de = StringVar()
enviados_para = StringVar()
enviados_asunto = StringVar()
resultado_operacion_correos_enviados = StringVar()

# FUNCION QUE ENVIA MAIL
def envioMail():
    try:
        # Formo la variable servidor en formato String
        # pero en este formato (direccion_servidor_smtp: puerto)
        servidor = smtp_servidor.get() + ":" + smtp_puerto.get()

        #Creamos la instancia que contendra los cabezales del mensaje como
        #From, To, Subject, attach
        msg = MIMEMultipart()
        
        # Body del correo capturado desde el Entry_msj
        message = smtp_mensaje.get(1.0, "end-1c")

        # Capturamos los datos ingresados en los Entry y los asignamos en las variables
        # MIMEMultipart que contiene el header del correo.
        password = smtp_password.get()
        msg['From'] = smtp_from.get()
        msg['To'] = smtp_destinatario.get()
        msg['Subject'] = smtp_asunto.get()
        
        # Asjunto el cuerpo del mensaje en el Attacj y los definimos como texto plano
        # Se puede tambien agregar el mensaje en formato HTML
        msg.attach(MIMEText(message, 'plain'))
        
        # Creamos la instanacia server y le pasamos como parametro el servidor y puerto utilizado
        server = smtplib.SMTP(servidor)
        # Declaramos que utilizara StartTLS como metodo de cifrado
        server.starttls()
        # Otras variantes (depende de la implementacion del IT del servidor de correo)
        # TLS
        # SSL
        # StartTLS
        # StartSSL

        # Hacemos el login de la cuenta ingresada
        server.login(msg['From'], password)
        
        # Enviamos el mensaje
        resultado = server.sendmail(msg['From'], msg['To'], msg.as_string())

        # Cerramos la conexion
        server.quit()

        # Obtenemos la fecha actual
        now = datetime.now()
        # Formateamos la fecha y guardamos en memoria en formato string para
        # no tenes problemas a la hora de grabar en el json
        date_time = now.strftime("%d-%m-%Y %H:%M:%S")

        # Agrego el correo enviado a la lista enviados
        enviados.append({
            'fecha' : date_time,
            'desde' : smtp_from.get(),
            'destinatario' : smtp_destinatario.get(),
            'asunto' : smtp_asunto.get(),
            'mensaje' : message
        })
        # Actualizado el Json de correos enviados
        graboEnviadosFile()
        # Actualizo el Listbox en pantalla
        cargarEnviosListbox()
        resultado_envio.set("Correo enviado correctamente.")
    except gaierror as e:
        print("Erro de socket, no existe servidor de correo verificar DNS: ", e)
        resultado_envio.set("Erro de socket, no existe servidor de correo verificar DNS o conexion a internet")
    except TimeoutError as e:
        print("Tiempo de espera agotado, revise conexion o parametro de servidor: ", e)
        resultado_envio.set("Tiempo de espera agotado, revise conexion o parametro de servidor")
    except smtplib.SMTPAuthenticationError as e:
        print("Error de autenticion: ", e)
        resultado_envio.set("Error de autenticion")
    except smtplib.SMTPConnectError as e:
        print("Error de conexion verifique datos de conexion: ", e)
        resultado_envio.set("Error de conexion verifique datos de conexion")
    except Exception as e:
        print("Error generico: ", e)
        resultado_envio.set(e)

# FUNCION PARA ELIMINAR TODOS LOS CAMPOS INGRESADOS EN EL FORMULARIO DE ENVIO
def limpiarCamposSMTP():
    smtp_servidor.set("")
    smtp_puerto.set("")
    smtp_from.set("")
    smtp_password.set("")
    smtp_destinatario.set("")
    smtp_asunto.set("")
    smtp_mensaje.delete(1.0, "end")

# FUNCION QUE GUARDA O MODIFICA CONTACTO
# SI EL CONTACTO YA EXISTE LO ACTUALIZA
# SI NO EXISTE EL NOMBRE CREA UNO NUEVO
def guardarContacto():
    # Capturo los datos del Entry y los guardo en las siguientes variables locales
    nombre = libreta_nombre.get()
    telefono = libreta_telefono.get()
    direccion = libreta_direccion.get()
    correo = libreta_correo.get()

    if (nombre != ""):
        try:
            # Buscamos si ya existe el contacto, si existe lo actualizamos sino lo agreamos
            indice = 0
            find = False
            # La idea de este for es ver si existe el contacto dentro de la Lista, si existe
            # ponemos en True la bandera find y capturamos el indice dentro de la Lista en la que esta
            # ubicado el diccionario que contiene la informacion del contacto
            for contactos in libreta:
                for k,v in contactos.items():
                    if (k == "nombre" and v == nombre):
                        find = True
                    elif (k == "nombre" and v != nombre):
                        indice = indice + 1
                    if (find == True):
                        break
                if (find == True):
                    break
            
            mensaje = ""
            # Si encontre el contacto lo actualizo sino lo agreamos
            if (find == True):
                # Modifico datos de contacto existente
                # usando el indice que capturamos en el for anterior
                libreta[indice]['nombre'] = nombre
                libreta[indice]['telefono'] = telefono
                libreta[indice]['direccion'] = direccion
                libreta[indice]['correo'] = correo
                mensaje = "Contacto modificado correctamente"
            else:
                # Agrego un nuevo contacto a la lista contactos
                libreta.append({
                    'nombre' : nombre,
                    'telefono' : telefono,
                    'direccion' : direccion,
                    'correo' : correo
                })
                mensaje = "Contacto guardado correctamente"                
            # Funcion para ordenar la lista libreta utilizando como criterio
            # el atributo nombre de cada diccionario
            libreta.sort(key=lambda x: x["nombre"])
            # Actualizo el archivo JSON que contiene los datos de contacto
            graboLibretaFile()
            # Actualizo el Listbox de contactos en pantalla
            cargarLibretaListbox()

            libreta_nombre.set("")
            libreta_telefono.set("")
            libreta_direccion.set("")
            libreta_correo.set("")
            resultado_operacion_contactos.set(mensaje)
        except:
            resultado_operacion_contactos.set("Error al guardar contacto")
    else:
        resultado_operacion_contactos.set("Ingrese al menos el nombre del contacto")

## FUNCION QUE ELIMINA UN CONTACTO
def eliminarContacto():
    if (len(listbox_Contactos.curselection()) > 0):
        for i in listbox_Contactos.curselection():
            # Obtenemos el contacto seleccionado en el Listbox
            selecciondo = listbox_Contactos.get(i)
            # Buscamos el contacto para determinar el indice que tiene dentro de la lista
            # para luego eliminarlo
            indice = 0
            find = False
            # La idea de este for es ver si existe el contacto dentro de la Lista, si existe
            # ponemos en True la bandera find y capturamos el indice dentro de la Lista en la que esta
            # ubicado el diccionario que contiene la informacion del contacto
            for contactos in libreta:
                for k,v in contactos.items():
                    if (k == "nombre" and v == selecciondo):
                        find = True
                    elif (k == "nombre" and v != selecciondo):
                        indice = indice + 1
                    if (find == True):
                        break
                if (find == True):
                    break
        
            # Si encontre el contacto lo eliminamos
            if (find == True):
                try:
                    # Elimino el contacto de la lista con el indice que capturamos en el contacto anterior
                    libreta.pop(indice)
                    # Actualizo el JSON que contiene datos de contacto
                    graboLibretaFile()
                    # Actualizo el Listbox en pantalla
                    cargarLibretaListbox()

                    libreta_nombre.set("")
                    libreta_telefono.set("")
                    libreta_direccion.set("")
                    libreta_correo.set("")
                    resultado_operacion_contactos.set("Contacto eliminado correctamente")
                except:
                    resultado_operacion_contactos.set("Error al eliminar contacto")
    else:
        resultado_operacion_contactos.set("Seleccione un contacto a eliminar")

## FUNCION PARA EXPORTAR CONTACTOS A ARCHIVO CSV
def exportarContacto():
    try:
        print("Exporto a CSV")
        archivo_csv = "contactos.csv"
        # Abro el archivo en modo escritoria en forma w, en este caso pasara por arriba
        # todo lo que ya tiene grabado el archivo
        with open(archivo_csv, "w", encoding='utf-8') as file:
            # Grabo los encabezados en la primera linea
            file.write("nombre,telefono,direccion,correo")
            # Verifico si tengo contactos para grabar sino el CSV solo quedara con los encabezados
            if (len(libreta) > 0):
                # Recorro la lista libreta para capturar cada diccionario de contactos
                for contacto in libreta:
                    # Creo una variable auxiliar para ir concatentando los atributos del contactos
                    # separado por coma, para luego escribir en el archivo
                    texto = ""
                    # Recorro los datos (atributos del diccionario) del contacto que estamos paresando
                    for k,v in contacto.items():
                        # Concatengo la variable auxiliar (texto) con los datos de contacto
                        if (k == "nombre"):
                            texto = texto + v
                        if (k == "telefono"):
                            texto = texto + "," + v
                        if (k == "direccion"):
                            texto = texto + "," + v
                        if (k == "correo"):
                            texto = texto + "," + v
                    # Grabo el texto formado
                    file.write("\n" + texto)
            else:
                print("No hay contactos")
        # Cierro el archivo
        file.close()
        resultado_operacion_contactos.set("Exportacion a CSV ejecutada correctamente")
    except:
        resultado_operacion_contactos.set("Error al exportar contactos a csv")

## FUNCION PARA ELIMINAR CORREOS ENVIADOS
def eliminarCorreo():
    if (len(listbox_Correos_Enviados.curselection()) > 0):
        # Obtengo el correo selccionado en el Listbox
        for i in listbox_Correos_Enviados.curselection():
            # Obtenemos el contacto seleccionado en el Listbox
            selecciondo = listbox_Correos_Enviados.get(i)
            # Buscamos el contacto para determinar el indice que tiene dentro de la lista
            # para luego eliminarlo
            indice = 0
            find = False
            # La idea de este for es ver si existe el correo dentro de la Lista, si existe
            # ponemos en True la bandera find y capturamos el indice dentro de la Lista en la que esta
            # ubicado el diccionario que contiene la informacion del correo enviado
            for enviado in enviados:
                for k,v in enviado.items():
                    if (k == "fecha" and v == selecciondo):
                        find = True
                    elif (k == "fecha" and v != selecciondo):
                        indice = indice + 1
                    if (find == True):
                        break
                if (find == True):
                    break
            
            # Si encontre el contacto lo actualizo sino lo agreamos
            if (find == True):
                try:
                    # Elimino de la lista enviados el correo
                    enviados.pop(indice)
                    enviados_de.set("")
                    enviados_para.set("")
                    enviados_asunto.set("")
                    # Habilito para que el Text sea editable
                    enviados_mensaje.configure(state='normal')
                    # Vacio todo el contenido del Text
                    enviados_mensaje.delete(1.0, "end")
                    # Vuelvo a deshabilitar el Text para que no pueda ser modificado
                    enviados_mensaje.configure(state='disabled')
                    # Actualizo el JSON que contiene los correos enviados
                    graboEnviadosFile()
                    # Actualizo el listbox de correos enviados en pantalla
                    cargarEnviosListbox()
                    resultado_operacion_correos_enviados.set("Correo eliminado correctamente")
                except:
                    resultado_operacion_correos_enviados.set("Error al eliminar el correo")
    else:
        resultado_operacion_correos_enviados.set("Seleccione un correo a eliminar")




# Incluimos panel para las pestañas
nb = ttk.Notebook(root)
nb.pack(fill='both', expand='yes')

# Creamos pestañas (aca las creamos en memoria pero aun no las visualizamos en pantalla)
p_enviar_correo = ttk.Frame(nb)
p_libreta_contacto = ttk.Frame(nb)
p_correos_enviados = ttk.Frame(nb)

###########################################################################################################
###########################################################################################################
# Creamos los elementos de pestaña 1 (Form de enviar correo) ##############################################
Label(p_enviar_correo, text="Servidor:").place(x=10, y=10)
Entry(p_enviar_correo, textvariable=smtp_servidor, width=40).place(x=120, y=10)

Label(p_enviar_correo, text="Puerto:").place(x=10, y=35)
Entry(p_enviar_correo, textvariable=smtp_puerto, width=40).place(x=120, y=35)

Label(p_enviar_correo, text="From:").place(x=10, y=60)
Entry(p_enviar_correo, textvariable=smtp_from, width=40).place(x=120, y=60)

Label(p_enviar_correo, text="Contraseña:").place(x=10, y=85)
Entry(p_enviar_correo, textvariable=smtp_password, width=40, show="*").place(x=120, y=85)

Label(p_enviar_correo, text="Destinatario:").place(x=10, y=110)
Entry(p_enviar_correo, textvariable=smtp_destinatario, width=40).place(x=120, y=110)

Label(p_enviar_correo, text="Asunto:").place(x=10, y=135)
Entry(p_enviar_correo, textvariable=smtp_asunto, width=40).place(x=120, y=135)

Label(p_enviar_correo, text="Mensaje:").place(x=10, y=160)
smtp_mensaje = Text(p_enviar_correo,width=37,height=10)
smtp_mensaje.place(x=120, y=160)

Button(p_enviar_correo, text="Limpiar", bg="light blue", command=limpiarCamposSMTP, width=10).place(x=430, y=270)
Button(p_enviar_correo, text="Enviar correo", bg="light blue", command=envioMail, width=10).place(x=430, y=300)
Label(p_enviar_correo, textvariable=resultado_envio).place(x=10, y=340)

### Incorpotamos un logo si existe el archivo logo.png
if (os.path.exists("logo.png") == True):
    # Creo una imagen de instancia PhotoImagen y cargo en ella logo.png
    logo = PhotoImage(file="logo.png")
    # Agrego la imagen instanciada al Label
    Label(p_enviar_correo, image=logo).place(x=420, y=10)


###########################################################################################################
###########################################################################################################
# Creamos los elementos de pestaña 2 (Form libreta de direcciones) ##############################################
listbox_Contactos = Listbox(p_libreta_contacto, width=32, height=22)

# Funcion para cargar el contenido de la lista libreta en el listbox
def cargarLibretaListbox():
    # Vaciamos el listbox de contactos para posteriormente cargar todo lo que este dentro de la lista
    # contactos
    listbox_Contactos.delete(0,'end')
    contador = 1
    for contacto in libreta:
        for k,v in contacto.items():
            if (k == "nombre"):
                # Insertamos el contacto en el listbox lo cual va a tener una key y el valor
                # el valor es lo que se ver en pantalla y sera el nombre del contacto
                listbox_Contactos.insert(contador, v)
                contador = contador + 1
# Ejecuto la funcion
cargarLibretaListbox()

# Funcion que captura el evento cuando se seleccion un item del Listbox
def contacto_selected(evt):
    # Obtengo el elemento de tkinter que hizo disparar este evento (en este caso va a ser el objeto
    # Listbox de contacto)
    w = evt.widget
    selecciondo = ""
    # Obtengo el contacto seleccionado
    selecciondo = listbox_Contactos.curselection()

    # verifico que se selecciono un contacto
    if (selecciondo != "" and len(w.curselection()) > 0):
        # Obtengo el indice de la lista
        indice = int(w.curselection()[0])
        # Obtengo el nombre del item selccionado
        nombre = w.get(indice)
        # Hago un busqueda en la lista y la retorno a la lista busqueda
        # en esta funcion lambda le pido que busque el atributo nombre en cada contacto
        # dentro de libreta cuyo nombre coincida con el selccionado en el listbox
        busqueda = list(filter(lambda item: item['nombre'] == nombre, libreta))
        # Si se encontro el contacto, el largo de la lista obtenida es mayor a 0
        if(len(busqueda) > 0):
            # recorro los atributos del diccionario del indice 0 del resultado de la busqueda
            # y cada valor de estos atributos los cargo en pantalla
            for k,v in busqueda[0].items():
                if(k == "nombre"):
                    libreta_nombre.set(v)
                if(k == "telefono"):
                    libreta_telefono.set(v)
                if(k == "direccion"):
                    libreta_direccion.set(v)
                if(k == "correo"):
                    libreta_correo.set(v)

listbox_Contactos.place(x=10, y=10)
# Espicifico que funcion va a ejecutar cuando selecciono un item del Listbox
listbox_Contactos.bind('<<ListboxSelect>>', contacto_selected)

Label(p_libreta_contacto, text="Nombre:").place(x=220, y=10)
Entry(p_libreta_contacto, textvariable=libreta_nombre, width=40).place(x=280, y=10)

Label(p_libreta_contacto, text="Telefono:").place(x=220, y=35)
Entry(p_libreta_contacto, textvariable=libreta_telefono, width=40).place(x=280, y=35)

Label(p_libreta_contacto, text="Direccion:").place(x=220, y=60)
Entry(p_libreta_contacto, textvariable=libreta_direccion, width=40).place(x=280, y=60)

Label(p_libreta_contacto, text="Correo:").place(x=220, y=85)
Entry(p_libreta_contacto, textvariable=libreta_correo, width=40).place(x=280, y=85)

Button(p_libreta_contacto, text="Guardar", bg="green", command=guardarContacto).place(x=220, y=120)
Button(p_libreta_contacto, text="Eliminar", bg="red", command=eliminarContacto).place(x=290, y=120)
Button(p_libreta_contacto, text="Exportar CSV", bg="green", command=exportarContacto).place(x=360, y=120)

Label(p_libreta_contacto, textvariable=resultado_operacion_contactos).place(x=220, y=180)



###########################################################################################################
###########################################################################################################
# Creamos los elementos de pestaña 3 (Form correos enviados) ##############################################
listbox_Correos_Enviados = Listbox(p_correos_enviados, width=32, height=22)

# Funcion para cargar el contenido de la lista enviados en el listbox
def cargarEnviosListbox():
    # Vacio el listbox de enviados
    listbox_Correos_Enviados.delete(0,'end')
    contador = 1
    for envio in enviados:
        for k,v in envio.items():
            if (k == "fecha"):
                # Insertamos el correo enviado en el Listbox lo cual va a tener una key y el valor
                # el valor es lo que se ver en pantalla y sera la fecha de envio
                listbox_Correos_Enviados.insert(contador, v)
                contador = contador + 1
# Ejecuto la funcion
cargarEnviosListbox()

# Funcion que captura el evento cuando se seleccion un item del Listbox
def envios_selected(evt):
    # Primero vaciamos los campos para rellenarlos posteriromente
    # Esto no es muy necesario pero simplemente lo hacemos para asegurarnos de que nos
    # Muestre informacion distinta a la referida del correo seleccionado.
    enviados_de.set("")
    enviados_para.set("")
    enviados_asunto.set("")
    # Habilito para que el Text sea editable
    enviados_mensaje.configure(state='normal')
    # Vacio todo el contenido del Text que contiene el body del correo
    enviados_mensaje.delete(1.0, "end")
    # Vuelvo a deshabilitar el Text para que no pueda ser modificado
    enviados_mensaje.configure(state='disabled')
    
    # Obtengo el elemento de tkinter que hizo disparar este evento (en este caso va a ser el objeto
    # Listbox de correos enviados) 
    w = evt.widget
    selecciondo = ""
    # Obtengo el correo seleccionado
    selecciondo = listbox_Correos_Enviados.curselection()
    # verifico que se selecciono un correo
    if (selecciondo != "" and len(w.curselection()) > 0):
        # Obtengo el indice de la lista
        indice = int(w.curselection()[0])
        # Obtengo la fecha del item selccionado
        fecha = w.get(indice)
        # Hago un busqueda en la lista y la retorno a la lista busqueda
        # en esta funcion lambda le pido que busque el atributo fecha en cada correo enviado
        # dentro de libreta cuyo fecha coincida con el selccionado en el listbox
        busqueda = list(filter(lambda item: item['fecha'] == fecha, enviados))
        # Si se encontro el correo, el largo de la lista obtenida es mayor a 0
        if(len(busqueda) > 0):
            # recorro los atributos del diccionario del indice 0 del resultado de la busqueda
            # y cada valor de estos atributos los cargo en pantalla
            for k,v in busqueda[0].items():
                if(k == "desde"):
                    enviados_de.set(v)
                if(k == "destinatario"):
                    enviados_para.set(v)
                if(k == "asunto"):
                    enviados_asunto.set(v)
                if(k == "mensaje"):
                    # Habilito para que el Text sea editable
                    enviados_mensaje.configure(state='normal')
                    # Vacio todo el contenido del Text
                    enviados_mensaje.delete(1.0, "end")
                    # Inserto el mensaje enviado en el Text
                    enviados_mensaje.insert("end-1c", v)
                    # Vuelvo a deshabilitar el Text para que no pueda ser modificado
                    enviados_mensaje.configure(state='disabled')

listbox_Correos_Enviados.place(x=10, y=10)

# Espicifico que funcion va a ejecutar cuando selecciono un item del Listbox
listbox_Correos_Enviados.bind('<<ListboxSelect>>', envios_selected)

Label(p_correos_enviados, text="De:").place(x=220, y=10)
Label(p_correos_enviados, textvariable=enviados_de, width=40, anchor="w").place(x=300, y=10)

Label(p_correos_enviados, text="Destinatario:").place(x=220, y=35)
Label(p_correos_enviados, textvariable=enviados_para, width=40, anchor="w").place(x=300, y=35)

Label(p_correos_enviados, text="Asunto:").place(x=220, y=60)
Label(p_correos_enviados, textvariable=enviados_asunto, width=40, anchor="w").place(x=300, y=60)

Label(p_correos_enviados, text="Mensaje:").place(x=220, y=85)
enviados_mensaje = Text(p_correos_enviados,width=37,height=10, state='disabled')
enviados_mensaje.place(x=280, y=85)

Button(p_correos_enviados, text="Eliminar", bg="red", command=eliminarCorreo).place(x=220, y=280)

Label(p_correos_enviados, textvariable=resultado_operacion_correos_enviados).place(x=220, y=320)
##resultado_operacion_correos_enviados

# Agregamos las pestañas creadas al panel y le asigno el Texto que se vera en pantalla
nb.add(p_enviar_correo, text='Envio de Correo')
nb.add(p_libreta_contacto, text='Libreta de Contactos')
nb.add(p_correos_enviados, text='Correos enviados')


# Inicio el mainloop de Tkinter
# Al ejecutar este metodo la aplicacion entra en un bucle infinto
# Donde controla todos los eventos que se van generando desde los componentes
# En este caso puntualmente del proyecto va a estar monioterando los eventos de los botones (click)
# y de los listbox (seleccion de un item)
root.mainloop()


