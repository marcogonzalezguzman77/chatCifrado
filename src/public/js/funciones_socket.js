//ESTAS FUNCIONES SON DEL LADO DEL CLIENTE
var socket = ""; //defino variable socket global
let socketActual = "";
let banderaIniciaChatSocketEnviarMensaje = 0;


let A=""; //llave publica sesion del usuario conectado solo es una 
let a=""; //llave privada sesion del usuario conectado solo es una
let contactoEnviar=""; //ocupo esta variable en la funcion iniciar_chat(usuario,contacto)
let usuarioEnvia=""; //ocupo esta varialbe en la funcion iniciar_chat(usuario,contacto)
let SK = {}; //llave de sesion de los usuarios por eso es una array
let R = {}; //Root key de los usuarios por eso es un array
//let ratPrivDH = {} //Llaves privadas Ratchet Diffie Hellman
//let ratPubDH = {} //Llaves publicas Ratchet Diffie Hellman
let ratPubDHenvioRatchet0 = "";
let ratPrivDHenvio = [] //Llaves privadas Ratchet Diffie Hellman
let ratPubDHenvio = [] //Llaves publicas Ratchet Diffie Hellman
let ratPrivDHrecibo = [] //Llaves privadas Ratchet Diffie Hellman
let ratPubDHrecibo = [] //Llaves publicas Ratchet Diffie Hellman
let C = {}; //Chain Key
let Mk = {}; //Message key

let contadorMensajesSesion = {} //contador de mensajes entre emisor y receptor
//la variable contadorMensajesSesion la empleo porque es lque tomo como base para contar los mensajes
// y ademas poner los indices de las llaves
let contadorMensajesEnviadosSesion = {}
let contadorMensajesRecibidosSesion = {}
let mensajesSesion = {} //variable para almacenar mensajes y saber quien fue el que envio el ultimo mensaje, para poder renovar las ratche keys
let emisorAnterior = {}; //variable empleada para almacenar los ultimos emisores del mensajes, para saber si envio o no el ratchet key
let mensajesSesionActual = [];
let mensajesSesionActualPareja = [];
let ultimoEmisor = "";
let ultimoSecretoCompartido = "";

function generarLlavePublicaSesion(){
  n=11;
  Zn = [1,2,3,4,5,6,7,8,9,10];
  g=[2,6,7,8];

  a = Zn[Math.floor(Math.random() * Zn.length)]; //SELECCIONO UN VALOR a, ESTA ES MI LLAVE PRIVADA
  g = parseInt(g[2]); //seleccion la posicion 2 de g
  A = (Math.pow(g, a))%11;
  console.log('Datos Diffie Hellman:' + ' g ' +  g + ' a ' + a + ' g^a mod 11: ' + A);
  return A;
}

function generarLlavePublicaRatchet(){
  n=11;
  Zn = [1,2,3,4,5,6,7,8,9,10];
  g=[2,6,7,8];

  rat_a = Zn[Math.floor(Math.random() * Zn.length)]; //SELECCIONO UN VALOR rat_a, ESTA ES MI LLAVE PRIVADA
  rat_g = parseInt(g[2]); //seleccion la posicion 2 de g

  //llave publica
  RAT_A = (Math.pow(rat_g, rat_a))%11;
  //console.log('Llave Ratchet publica generada ' + RAT_A);
  return {RAT_A, rat_a};
}

function generarSecretoCompartido(llavePrivadaEmisor,llavePublicaReceptor){
  
  llavePrivada=llavePrivadaEmisor;

  secretoCompartidoGenerar = (Math.pow(llavePublicaReceptor, llavePrivada))%11;

  return secretoCompartidoGenerar;
  
}

function buscarLlavePrivadaIdentidadUsuario(usuario){
  const llavePrivadaIdentidad = {};
  llavePrivadaIdentidad['marcoglz'] = 6;
  llavePrivadaIdentidad['jess'] = 10;
  llavePrivadaIdentidad['bruno'] = 7;
  llavePrivadaIdentidad['mateo'] = 2;
  llavePrivadaIdentidad['gael'] = 9;
  llavePrivadaIdentidad['Lil'] = 3;
  llavePrivadaIdentidad['enriquecruz'] = 7;

  return llavePrivadaIdentidad[usuario];

}

//inicio sesion cuando entro a la ventana de CONTACTOS contactos.hbs
function iniciarSesionServidor(usuario){
 
  socket = io(); //inicio la conexion al socket del servidor

  socket.on('connect', function() {
    const socketID = socket.id; //
    console.log("Cliente on(connect): mi socket.id es",socketID);
    socketActual = socketID;

    llavePubSesion = generarLlavePublicaSesion();
    socket.emit('nueva_conexionUsuario',{usuario: usuario, llavePubSesion: A });
    console.log("Cliente: " + usuario + " inicia chat");

    //EL USUARIO CONECTADO ESCUCHA EL AVISO DE SUS CONTACTOS CONECTADOS
    //el usuario que entra es el que busca sus usuarios conectados
    //EL USUARIO BUSCA PARA SI MISMO, NO AVISA A OTROS CONTACTOS
    socket.on('avisoContactosConectados', function (datos){
      
      const contactosConectados = datos.contactosConectados;
      const llavePublicaIdentidadUsuario = parseInt(datos.llavePublicaIdentidadUsuario);
      cantidadUsuariosConectados = contactosConectados.length;
      
      //este for es para que en la ventana de CONTACTOS se coloque Online si es que los contactos del usuario estan conectados
      //tambien lo empleo para verificar las sesiones cifradas de cada usuario, para verificar si existen en la base de datos del dispositivo
      //o bien para establecer sesiones cifradas con quienes se encuentran en linea
      for (let index = 0; index < contactosConectados.length; index++) {
        const element = contactosConectados[index];
        document.getElementById('situacionConexion_'+element.fk_user_contacto).innerHTML="Online";
        document.getElementById('llavePubSesion_'+element.fk_user_contacto).innerHTML= element.llavePublicaSesion; //la llave publica de sesion del contacto
        document.getElementById('llavePubIdentidad_'+element.fk_user_contacto).innerHTML= element.llavePublicaIdentidad;  //la llave publica de identidad del contacto
        
        userContacto=element.fk_user_contacto; //contactos que estan conectados
        //userContacto son los contactos que estan conectados cuando yo me conecto
        //CALCULO LOS SECRECTOS COMPARTIDOS SK
        //SK=DH1(I'A, IB)||DH2(E'A, EB)    I es llave de identeidad E es llave efimera(sesion), A usuario y B contacto, ' es llave privada sin ' es llave publica
        //recuerda funcion siguiente el orden es llavePrivada, llavePublica
        //usuario es el usuario que se conecta
        DH1 = generarSecretoCompartido(buscarLlavePrivadaIdentidadUsuario(usuario),element.llavePublicaIdentidad);
        DH2 = generarSecretoCompartido(a,element.llavePublicaSesion); //a la llave privada del usuario
        
        //mensaje AD para enviar como primer mensaje cifrado
        mensajeSesionCifrada=usuario+element.fk_user_contacto;
        //secreto compartido
        SK[userContacto] = (DH1+DH2)%11;
        //cifro mensaje AD
        mensajeADcifrado = cifradoSustitucion(mensajeSesionCifrada,SK[userContacto]);
        //actualizo datos de contacto con su SK        
        document.getElementById('secretoCompartido_'+element.fk_user_contacto).innerHTML = SK[userContacto];

        //CALCULO LA Root key 0
        RootKey = (SK[userContacto]+3)%11; //esto hace la funcion de una hash
        R[userContacto,0] = RootKey;
        //console.log('Llave Root Key 0 ',R[userContacto,0],' userContacto ',userContacto);

        //GENERO llaves RATCHET Diffie Hellman
        valoresLlavesRatchet = generarLlavePublicaRatchet();
        ratPrivDHenvio.push({emisor:usuario, receptor:userContacto, indice:0, ratchet:valoresLlavesRatchet.rat_a});
        ratPubDHenvio.push({emisor:usuario, receptor:userContacto, indice:0, ratchet:valoresLlavesRatchet.RAT_A})      
        
        document.getElementById('llaveRatchDH0_'+element.fk_user_contacto).innerHTML = valoresLlavesRatchet.RAT_A;   
        console.log('Llave Ratchet 0 privada ', valoresLlavesRatchet.rat_a, ' con userContacto ', userContacto);
        console.log('Llave Ratchet 0 publica ', valoresLlavesRatchet.RAT_A, ' con userContacto ', userContacto);
        
        






        // el siguiente codigo que tengo comentado lo emplee para hacer una sesion mediante socket
        //lo deje en standby para despues
        //solicito una sesion cifrada con los contactos Y REMITO EL MENSAJE CIFRADO, LAS LLAVES, USUARIO Y CONTACTO
       /* socket.emit('solicitudHaciaServidorSesionCifradaUsuario-Contacto', {mensajeADcifrado: mensajeADcifrado, llavePublicaIdentidadUsuario: llavePublicaIdentidadUsuario, llaveEfimeraPublicaSesion: A, userUsuario: usuario, userContacto: element.fk_user_contacto}, function(respuestaCallback){
         
        });//fin emit*/

      }//fin del for
     
      
    }); //fin socket.on('avisoContactosConectados')


    //ESTOY A LA ESCUCHA CUANDO UN USUARIO SE CONECTA Y AVISA QUE SE CONECTO
    //ESTO SUCEDE CUANDO DESPUES DE BUSCAR EL USUARIO SUS CONTACTOS CONECTADOS EL TIENE QUE AVISAR QUE SE CONECTO TAMBIEN
    //AQUI EL CONTACTO ESCUCHA QUE EL USUARIO SE CONECTO
    socket.on('avisoUsuarioConectado', function(datos){
      usuarioConectado = datos.usuarioConectado; //contacto que se conecta
      //usuarioConcecado es el usuario que avisa que se acaba de conectar
      
      document.getElementById('situacionConexion_'+usuarioConectado).innerHTML="Online";
      document.getElementById('llavePubSesion_'+usuarioConectado).innerHTML= datos.llavePubUsuarioSesion; //llave Publica de sesion del usaurio que se acaba de conectar
      document.getElementById('llavePubIdentidad_'+usuarioConectado).innerHTML= datos.llavePubUsuarioIdentidad; //llave Publica de identidad del usuario que se acaba de conectar
      
      //CALCULO LOS SECRECTOS COMPARTIDOS SK
        //SK=DH1(I'A, IB)||DH2(E'A, EB)    I es llave de identeidad E es llave efimera(sesion), A usuario y B contacto, ' es llave privada sin ' es llave publica
      usuarioRecibeAviso = usuario; //usuarioRecibeAviso es al usuario que le llega la notificacion que un usuario se acaba de conectar
      DH1 = generarSecretoCompartido(buscarLlavePrivadaIdentidadUsuario(usuarioRecibeAviso),datos.llavePubUsuarioIdentidad);
      DH2 = generarSecretoCompartido(a,datos.llavePubUsuarioSesion); //a es la llave privada de quien recibe el aviso
      
      //MENSAJE AD para cifrar como primer mensaje
      mensajeSesionCifrada=usuarioRecibeAviso+usuarioConectado;
      //Secreto compartido
      SK[usuarioConectado] = (DH1+DH2)%11;
      //cifro mensaje AD
      mensajeADcifrado = cifradoSustitucion(mensajeSesionCifrada,SK[usuarioConectado]);      
      //actualizo datos del contacto con su SK
      document.getElementById('secretoCompartido_'+usuarioConectado).innerHTML = SK[usuarioConectado]; 
      
      //CALCULO LA Root key 0
      RootKey = (SK[usuarioConectado]+3)%11; //esto hace la funcion de una hash
      R[usuarioConectado,0] = RootKey;
      //console.log('Llave Root Key 0 ',R[usuarioConectado,0],' usuarioConectado ',usuarioConectado,);      

      //GENERO llaves RATCHET Diffie Hellman     
      valoresLlavesRatchet = generarLlavePublicaRatchet(); 
      ratPrivDHenvio.push({emisor:usuario, receptor:usuarioConectado, indice:0, ratchet:valoresLlavesRatchet.rat_a});
      ratPubDHenvio.push({emisor:usuario, receptor:usuarioConectado, indice:0, ratchet:valoresLlavesRatchet.RAT_A})         
        
      document.getElementById('llaveRatchDH0_'+usuarioConectado).innerHTML = valoresLlavesRatchet.RAT_A; 
      console.log('Llave Ratchet 0 privada ', valoresLlavesRatchet.rat_a, ' con usuarioConectado ',usuarioConectado);
      console.log('Llave Ratchet 0 publica ', valoresLlavesRatchet.RAT_A, ' con usuarioConectado ',usuarioConectado);
      


    });

    //ESTOY A LA ESCUCHA CUANDO UN USUARIO SE DESCONECTA Y AVISA QUE SE DESCONECTO
    socket.on('avisoUsuarioDesConectado', function(datos){
      usuarioDesConectado = datos.usuarioDesConectado;
      document.getElementById('situacionConexion_'+usuarioDesConectado).innerHTML="";
      document.getElementById('llavePubSesion_'+usuarioDesConectado).innerHTML="";
      document.getElementById('llavePubIdentidad_'+usuarioDesConectado).innerHTML="";
      document.getElementById('secretoCompartido_'+usuarioDesConectado).innerHTML="";
      document.getElementById('llaveRatchDH0_'+usuarioDesConectado).innerHTML="";
      //console.log('contador de quien se desconecta ',contadorMensajesSesion[usuario, usuarioDesConectado]);
      contadorMensajesSesion[usuario, usuarioDesConectado] = 0; //debe reiniciar contador de mensajes de sesion
      
      //reinicio contador de mensajes enviados y recibidos
      contadorMensajesEnviadosSesion = {}
      contadorMensajesRecibidosSesion = {}

      //reincio valores
      //mensajesSesion = {} //variable para almacenar mensajes y saber quien fue el que envio el ultimo mensaje, para poder renovar las ratche keys
      //emisorAnterior = {};  
    });


  });// fin socket.on('connect')

    //CUANDO EL SERVIDOR DE SOCKETS SE DESCONECTA DEL CLIENTE POR perder la conectividad del cliente, Y ESTOY DENTRO DEL CHAT
    //debo borrar la conexion antigua cuando me vuelva a conectar, mando un emit('borrar_conexion')
    //solo aviso que se desconecto ya no empleo el emit del renglon anterior
    socket.on('disconnect', ()=>{ 
      console.log('Cliente on.("disconnect"): Servidor desconectado');
      console.log('Socket a desconectar ', socketActual);
      //socket.emit('borrar_conexion',{socketId: socketActual})
     
    }); // fin socket.on disconnect




        //Estoy a la escucha de solicitudes de sesiones cifradas por parte de otros usuarios socket.on('solicitudHaciaContactos.....')
    //hago mis calculos del secreto compartido descifro el mensaje corroboro que este correcto y envio respuesta al usuario que solicito la sesion cifrada
    //envio respuesta de solicitud socket.emit('respuestaSolicitudSesionCifrada....')
 /*   socket.on('solicitudHaciaContactoSesionCifradaUsuario-Contacto', function(datos){
      usuario = datos.userUsuario; //el que solicita la sescion
      contacto = datos.userContacto; //soy yo este usuario
      mensajeADcifrado = datos.mensajeADcifrado;
      llavePublicaIdentidadUsuario = datos.llavePublicaIdentidadUsuario;
      llaveEfimeraPublicaSesion = datos.llaveEfimeraPublicaSesion;

      //Calculo el secreto compartido, descifro el mensaje y comparo el resultado con la cadena "usuario+contacto"
      //y si coinciden los resultados, se establece la sesion y envio la respuesta ok
      //debo desplegar el secreto compartido en la ventana de contactos y en su momento grabarlo en la base de datos del dispositivo

      //CALCULO LOS SECRECTOS COMPARTIDOS SK
        //SK=DH1(I'B, IA)||DH2(E'B, EA)    I es llave de identeidad E es llave efimera(sesion), A usuario y B contacto, ' es llave privada sin ' es llave publica
        //recuerda funcion siguiente el orden es llavePrivada, llavePublica
        DH1 = generarSecretoCompartido(buscarLlavePrivadaIdentidadUsuario(contacto),llavePublicaIdentidadUsuario);
        DH2 = generarSecretoCompartido(a,llaveEfimeraPublicaSesion);

        SK = (DH1+DH2)%11;
        mensajeADdescifrado = descifradoSustitucion(mensajeADcifrado,SK);

        mensajeAD= usuario+contacto;

        //OJO AQUI ES DEL LADO AL QUE LE ESTAN SOLICITANDO Y EN socket.on('respuestaSolicitudSesionCifradaUsuarioHaciaContacto')
        //es del LADO DE SOLICITANTE
        //si son iguales envio la respuesta y pongo en la informacion de mis conctacos el secreto compartido y envio la respuesta
        //al solicitante
        if (mensajeAD==mensajeADdescifrado){
          //usuario es el que solicita la sesion
          document.getElementById('secretoCompartido_'+usuario).innerHTML= SK;
          respuesta="ok" //para enviar la respuesta
        }else{
          respuesta="no"
        }
        //respuesta= mensajeADdescifrado+mensajeAD;

      console.log("Cliente: Recibi solicitud sesion cifrada de ", datos.userUsuario);
      
      socket.emit('respuestaSolicitudSesionCifradaUsuarioHaciaServidor', {userUsuario: usuario, userContacto: contacto, respuesta: respuesta});

    });

    //LADO DEL SOLICITANTE
    socket.on('respuestaSolicitudSesionCifradaUsuarioHaciaContacto', function(datos){
      //console.log("Reespuesta de mi solicitud de sesion Cifrada con el contacto ",datos.contacto, " es ", datos.respuesta);
      if (datos.respuesta=="ok"){
        console.log("Sesion cifrada establecida con el usuario ", datos.contacto);
        document.getElementById('secretoCompartido_'+datos.contacto).innerHTML= SK[datos.contacto];
      }

    });
*/




}//fin funcion iniciarSesion() 

//abro el chat cuando doy click sobre un contacto en la ventana CONTACTOS contactos.hbs
//dentro de esta funcion ajax esta la funcion inciar_chat() que es la que contiene socket.on('enviar_mensajes')
//citado socket esta a la escucha de mensajes de otros usuarios
function abrirChat(userContacto,fullnameContacto,nombreImagenContacto,userUsuario){
	abrirChatRequest = createRequest();
	
	if (abrirChatRequest == null) alert ("no fue posible crear un request");
					
	else{
		//var usuario_actual= document.getElementById('usuario_actual').value;
		//alert(usuario_actual);
    
    //en links.js router.get('/chat/:userContacto/:userFullname/:userImage/:userUsuario'
    url="chat/"+userContacto+"/"+fullnameContacto+"/"+nombreImagenContacto+"/"+userUsuario;

		//url = "abrir_cerrar_puerta.php?orden="+orden;
		
		abrirChatRequest.open("GET",url,true);
		abrirChatRequest.onreadystatechange = function(){ mostrarRespuestaAbrirChat(userUsuario,userContacto); }
		abrirChatRequest.send(null);
	}//fin else request
}

//ESTA FUNCION SE MANDA A LLAMAR CON abrirChat()
//AQUI COLOCO EL CHAT DEL USUARIO OBTENIENDO LA RESPUESTA DE links.js QUE ES con router.get('/chat/:userContacto/:userFullname/:userImage/:userUsuario')
//quien envia con res.send(plantillaChatContacto) el codigo html de divs para ponerlos en la venta de contactos.hbs
//dentro de los divs contenedorContactos y contenedorChat
function mostrarRespuestaAbrirChat(usuario,contacto) {
	if (abrirChatRequest.readyState == 4) {
     if (abrirChatRequest.status == 200) {
		 respuestaRequestAbrir = abrirChatRequest.responseText;
     document.getElementById('contenedorContactos').style.display = "none";     
     document.getElementById('contenedorChat').innerHTML=respuestaRequestAbrir;
     document.getElementById('contenedorChat').style.display = "block";  
     //pedirLlavePub(contacto);  
     iniciar_chat(usuario,contacto);
    }
  }
}




//SE INICIA EL CHAT DENTRO DE LA VENTANA DE contactos.hbs, ALLI ES DONDE COLOCO LA FUNCION inciar_chat() dentro de cada contacto
//la variable contacto no la ocupo la debo quitar despuse
//OJO: en esta funcion se activa el socket.on('enviar_mensaje'), empleado para estar a la escucha para recibir mensajes
//recuerda que cuando un usuario envia mensajes envia mensajes al contacto final y a el mismo asi que se emplea dos veses el emit('enviar_mensaje')
//y el on('enviar_mensaje')
function iniciar_chat(usuario, contacto){
    let n=0; //empleada para contabilizar mensajesSesion para poder observar cual fue el mensaje anterior y quien fue el emisor
    
    //la siguiente bandera es porque solo puedo generar un solo socket.on('enviar_mensaje'), solo una escucha
    //anteriormente si no lo ponia cada vez que se llamaba la funcion iniciar_chat() se creaba un nuevo socket
    //lo que hacia que se duplicaran o triplicarn los mensajes
    
    banderaIniciaChatSocketEnviarMensaje = banderaIniciaChatSocketEnviarMensaje + 1;

    //las dos variables siguientes son globales porque se actualizan en el socket.on('enviar_mensaje'), que
    //solo se ejecuta una vez debido a la bandera y no puede emplear los parametros directos usuario,contacto de la funcion iniciar_chat()
    contactoEnviar=contacto;
    usuarioEnvia=usuario;

    //estoy a la escucha de nuevos mensajes que el servidor envia de otros usuarios
    //enviar_mensaje recibe los mensajes del servidor y los despliega dentro de la ventana del chat
    //recuerda que cuando usuario envia un mensaje lo envia dos veces (el usuario envia el mensaje a si mismo y envia el mensaje para sus contacto)
    
    if (banderaIniciaChatSocketEnviarMensaje==1){
          socket.on('enviar_mensaje', function(datos){
            
         
            //contador mensajes enviados por el receptor (mensajes recibidos)
            //yo soy el receptor
            if( isNaN(contadorMensajesEnviadosSesion[datos.receptor])||(contadorMensajesEnviadosSesion[datos.receptor]==0)){
              contadorMensajesEnviadosSesion[datos.receptor] = 0;
              contadorMensajesEnviadosSesion[datos.receptor] = contadorMensajesEnviadosSesion[datos.receptor] + 1;
            }else {
              contadorMensajesEnviadosSesion[datos.receptor] = contadorMensajesEnviadosSesion[datos.receptor] + 1;
            }
            //contador mensajes recibidos por el emisor (mensajes enviados)
            //yo soy el emisor
            if( isNaN(contadorMensajesRecibidosSesion[datos.emisor])||(contadorMensajesRecibidosSesion[datos.emisor]==0)){
              contadorMensajesRecibidosSesion[datos.emisor] = 0;
              contadorMensajesRecibidosSesion[datos.emisor] = contadorMensajesRecibidosSesion[datos.emisor] + 1;
            }else {
              contadorMensajesRecibidosSesion[datos.emisor] = contadorMensajesRecibidosSesion[datos.emisor] + 1;
            }
           

            //busco y almaceno quien fue el ultimo que envio el mensaje            
            if (mensajesSesionActual.length!=0){           
              var indiceUltimoEmisor=0
              for (var i = 0; i < mensajesSesionActual.length; i++) {
                if ((mensajesSesionActual[i].receptor==usuarioEnvia || mensajesSesionActual[i].emisor==usuarioEnvia)&&(mensajesSesionActual[i].receptor==contactoEnviar||mensajesSesionActual[i].emisor==contactoEnviar))
                  {                    
                    indiceUltimoEmisor=i;
                  }//fin if
              }//fin del for
              ultimoEmisor = mensajesSesionActual[indiceUltimoEmisor].emisor;              
            }else{
                //console.log('no hay mensajes anteriores');
            }
            
            //grabo los mensajes de sesion para saber quien es el ultimo que envio mensajes         
            mensajesSesionActual.push({receptor: datos.receptor, emisor: datos.emisor, mensaje: datos.mensaje});

            
            //esta clase es para que el mensaje se coloque del lado derecho o de lado izquierdo 
            //dependiendo de quien es el que envia el mensaje (emisor-receptor);
            var clase="";       
            //este if diferencia entre quien es el que envia y recibe mensaje, recuerda que el emisor envia mensaje a receptor y a si mismo 
            //antes ocupaba este if porque me enviaba el mensaje a mi mismo a travez de la red pero lo cambie y ya no me envio a mi mismo por red
            //ahora lo hago en mi misma ventana cliente          
            if(usuarioEnvia==datos.emisor){    //si recibe es quien envia los mensajes que me llegan a mi mismo de mi mismo         
              clase="mensajeEmisor";
              
              //ya no lo ocupo             

            }else{ //ESTE ELSE ES EMPLEADO PARA CUANDO NO LLEGAN MENSAJES A SI MISMO, CUANDO LLEGAN LOS MENSAJES A TODOS LOS DEMAS USUARIOS
              clase="mensajeReceptor";
             
               //el contador contadorMensajesSesion[datos.receptor, datos.emisor] es para llevar control de los mensajes de sesion entre usuario y contacto               
               //si el contadoor es nulo o igual a cero, hacerlo 0 y sumarle uno
              if( isNaN(contadorMensajesSesion[datos.receptor, datos.emisor])||(contadorMensajesSesion[datos.receptor, datos.emisor]==0)) {
                //para el primer mensaje entre el emisor y el receptor
                //si no hay contadorMensajesSesion o contadorMensajesSesion igual a cero
                contadorMensajesSesion[datos.receptor, datos.emisor]=0
                contadorMensajesSesion[datos.receptor, datos.emisor] = contadorMensajesSesion[datos.receptor, datos.emisor] + 1;
                
                //almaceno la primera llave publica rachet recibida del emisor
                ratPubDHrecibo.push({emisor:datos.emisor, receptor:datos.receptor, indice:datos.indiceRatPubDHemisor, ratchet:datos.ratPubDHemisorEnvio});
                //genero un nuevo par de llaves rachet cuando recibo el primer mensaje
                valoresLlavesRatchet = generarLlavePublicaRatchet(); 
                ratPrivDHenvio.push({emisor:datos.receptor, receptor:datos.emisor, indice:1, ratchet:valoresLlavesRatchet.rat_a});
                ratPubDHenvio.push({emisor:datos.receptor, receptor:datos.emisor, indice:1, ratchet:valoresLlavesRatchet.RAT_A})         

                //empleo el secreto compartido inicial
                secretoCompartido = document.getElementById('secretoCompartido_'+contactoEnviar).innerHTML;
                secretoCompartido = parseInt(secretoCompartido); 
                console.log("secreto compartio: ",secretoCompartido);
                mensaje_claro = descifradoSustitucion(datos.mensaje,secretoCompartido);

              }else{//para el segundo mensaje en adelante entre emisor y receptor
                        //si existe contadorMensajesSesion o contadorMensajesSesion no es igual a cero
                        //le agrego uno al contador
                        contadorMensajesSesion[datos.receptor, datos.emisor] = contadorMensajesSesion[datos.receptor, datos.emisor] + 1;
                                                                       
                        //busco el ultimo indice ultimoIndiceRatPubDHreciboEmisor para emplearlo en las condicionales siguientes
                        //necesito saber si son los primeros mensajes donde estoy empleando el secreto compartido original
                        //o bien ya se estan empleando las llaves ratchet
                        //para eso ocupo las siguientes operaciones if y for
                        var indiceRatPubDHrecibo=0;
                        if(ratPubDHrecibo.length == 0){
                          //indiceRatPubDHrecibo = -1;
                          indiceRatPubDHrecibo = 0;
                        }else{
                          var ultimaLlaveRatPubDHreciboEmisor=0;
                          var ultimoIndiceRatPubDHreciboEmisor=0;
                          for (var i = 0; i < ratPubDHrecibo.length; i++) {
                            if ((ratPubDHrecibo[i].emisor==datos.emisor)&&(ratPubDHrecibo[i].receptor==datos.receptor))
                              {   
                                //console.log(ratPubDHrecibo[i].emisor,ratPubDHrecibo[i].receptor,ratPubDHrecibo[i].ratchet);                      
                                ultimaLlaveRatPubDHreciboEmisor = ratPubDHrecibo[i].ratchet;
                                ultimoIndiceRatPubDHreciboEmisor = ratPubDHrecibo[i].indice; 
                                indiceRatPubDHrecibo = ultimoIndiceRatPubDHreciboEmisor;           
                              }//fin if
                          }//fin del for
                        }
                        
                        longitudRatPubDHrecibo=ratPubDHrecibo.length;
                        

                        //este if lo empleo para obtener el indiceEmplieCifrar el cual lo ocupo
                        //para que los primeros mensajes utilicen el secreto compartido, mientras no 
                        //se generen las primeras llaves Ratchet
                        var indiceEmplieCifrar;                        
                        if(datos.indiceRatPubDHreciboEmplieCifrar===""){
                          indiceEmplieCifrar='vacio';
                        }else{
                          indiceEmplieCifrar='novacio';
                        }
                      
                        //ESTA ES LA CONDICIONAL IF PRINCIAL DONDE SI SE CUMPLEN LAS CONDICIONES
                        //EMPLEO EL secretoCompartido original que se creo con la sesion
                        //si no se cumple ahora si empleo las llaves ratchet
                        if ((ultimoIndiceRatPubDHreciboEmisor==datos.indiceRatPubDHemisor)&&(ultimaLlaveRatPubDHreciboEmisor==datos.ratPubDHemisorEnvio)&&(longitudRatPubDHrecibo==1)&&(indiceEmplieCifrar=='vacio')){
                          //no agrego llaves ratPubDHrecibo
                          //no agrego llaves ratPubDHenvio
                          
                          //CALCULO secretoCompartido PARA DESCIFRAR
                          secretoCompartido = document.getElementById('secretoCompartido_'+contactoEnviar).innerHTML;
                          secretoCompartido = parseInt(secretoCompartido); 

                        }else{// si el receptor ya envio mas un mensaje entonces --->
                            
                            //si recibo la misma llave publica y el mismo indice de parte del emisor entonces
                            //no guardo otra llave en ratPubDHrecibo.push porque ya la almacene y la tengo al principio de la fila
                            if ((ultimoIndiceRatPubDHreciboEmisor==datos.indiceRatPubDHemisor)&&(ultimaLlaveRatPubDHreciboEmisor==datos.ratPubDHemisorEnvio)){
                              //no agergo llaves ratPubDHrecibo
                              //no agrego llaver ratPubenvio
                             
                            }else{//si recibo llave publicas e indices diferentes al ultimo almacenado entonces
                              // genero nuevas llaves ratPubDHrecibo y ratPubDHenvio
                           

                                //almaceno la llave public rachet recibida del emisor
                                ratPubDHrecibo.push({emisor:datos.emisor, receptor:datos.receptor, indice:datos.indiceRatPubDHemisor, ratchet:datos.ratPubDHemisorEnvio});

                                //GENERO NUEVAS LLAVES RATCHET
                                var ultimoIndice=0;
                                ultimoIndice = datos.indiceRatPubDHemisor;

                                //busco el ultimo indice  de ratPubDHenvio para que el indice se agregue a la nueva llave ratPubDHenvio.push
                                var indiceRatPubDHenvio=0;
                                if(ratPubDHenvio.length == 0){
                                  indiceRatPubDHenvio = -1;
                                }else{
                                  var ultimaLlaveRatPubDHenvioEmisor=0;
                                  var ultimoIndiceRatPubDHenvioEmisor=0;
                                  for (var i = 0; i < ratPubDHenvio.length; i++) {
                                    if ((ratPubDHenvio[i].emisor==datos.receptor)&&(ratPubDHenvio[i].receptor==datos.emisor))
                                      {   
                                        //console.log(ratPubDHrecibo[i].emisor,ratPubDHrecibo[i].receptor,ratPubDHrecibo[i].ratchet);                      
                                        ultimaLlaveRatPubDHenvioEmisor = ratPubDHenvio[i].ratchet;
                                        ultimoIndiceRatPubDHenvioEmisor = ratPubDHenvio[i].indice; 
                                        indiceRatPubDHenvio = ultimoIndiceRatPubDHenvioEmisor;           
                                      }//fin if
                                  }//fin del for
                                }
                                indiceRatPubDHenvio = indiceRatPubDHenvio + 1;


                                valoresLlavesRatchet = generarLlavePublicaRatchet(); 
                                ratPrivDHenvio.push({emisor:datos.receptor, receptor:datos.emisor, indice:(indiceRatPubDHenvio), ratchet:valoresLlavesRatchet.rat_a});
                                ratPubDHenvio.push({emisor:datos.receptor, receptor:datos.emisor, indice:(indiceRatPubDHenvio), ratchet:valoresLlavesRatchet.RAT_A})
                            }//fin else de que me mandaron las mismas llaves publicas
                            

                            //RECUERDA SIGO DENTRO DEL else { // si el receptor ya envio mas un mensaje entonces --->

                              //para DESCIFRAR busco en ratPrivDHenvio la llave con el indice que me enviaron indiceRatPubDHreciboEmplieCifrar
                              //cuya llave publica fue la que ocupo el emisor para cifrar
                              //tambien empleo la llave publica que me enviaron del emisor que cuya llave privada fue la que ocuparon para cifrar
                              //esa llave es datos.ratPubDHemisorEnvio
                            
                              //POR LO TANTO con base al parrafo anterior

                              //busco mi llave privada con el indice indiceRatPubDHreciboEmplieCifrar enviado por el receptor ratPrivDHenvio  
                              //ya que el receptor empleo la respectiva llave publica para cifrar
                                            
                              var ultimaLlaveRatPrivDHenvioEmisor = 0;                
                              for (var i = 0; i < ratPrivDHenvio.length; i++) {
                                      if ((ratPrivDHenvio[i].emisor==datos.receptor)&&(ratPrivDHenvio[i].receptor==datos.emisor)&&(ratPrivDHenvio[i].indice==(datos.indiceRatPubDHreciboEmplieCifrar)))
                                        {   
                                          //console.log(ratPrivDHenvio[i].emisor,ratPrivDHenvio[i].receptor,ratPrivDHenvio[i].ratchet,i);                           
                                          ultimaLlaveRatPrivDHenvioEmisor = ratPrivDHenvio[i].ratchet;            
                                        }//fin if
                                    }//fin del for
                              
                              //obtengo la llave publica que envio el emisor
                              var ultimaLlaveRatPubDHreciboReceptor;
                              ultimaLlaveRatPubDHreciboReceptor=datos.ratPubDHemisorEnvio
                          
                              secretoCompartido = generarSecretoCompartido(ultimaLlaveRatPrivDHenvioEmisor,ultimaLlaveRatPubDHreciboReceptor);
                              secretoCompartido = parseInt(secretoCompartido); 


                        }//fin else si el receptor ya envio mas de un mensaje


                        console.log("secreto compartio: ",secretoCompartido);
                        mensaje_claro = descifradoSustitucion(datos.mensaje,secretoCompartido);

              }//fin else si contador es igual a nul a cero
              
            
            }//fin else cuando no llegan mensajes a si mismo

            //OJO y recordatorio las llaves publicas del receptor que esta colocadas en el div de la informacion del contacto
            //las empleo para calcular el secretoCompartido inicial
            //y esta se actualiza cada vez que se conecta o desconecta un contacto
            //el parametro contactoEnviar se actualiza cada vez que se da click en iniciar_chat(usuario,contacto) y se asigna
            // la variable contacto a la variable contactoEnviar


            //AQUI ES DONDE ENVIO LOS MENSAJES DENTRO DEL CUADRO DE MENSAJE CON id="cont_mensajes"            
            $('#cont_mensajes').append('<p class="' + clase + '">' + mensaje_claro +'</p>');
            //alturaDiv = $('#cont_mensajes').height();
            //el scrollTop es para que mueva el scroll hasta abajo cuando se envia el mensaje
            $('#cont_mensajes').scrollTop(9999999);
            document.getElementById('mensaje').value = "";
            
          }); //fin socket.on('enviar_mensaje')
      }//fin if bandera para solo tener a la escucha un solo socket.on('enviar_mensaje')
  

}//fin funcion iniciar chat


//funcion del boton enviar mensaje version 1
function enviar_mensajev1(emisor, mensaje, receptor = null){
  //me envio el mensaje a mi mismo, las siguientes tres lineas es par realizar esa accion
  $('#cont_mensajes').append('<p class="mensajeEmisor">' + mensaje +'</p>');
  $('#cont_mensajes').scrollTop(9999999);
  document.getElementById('mensaje').value = "";
  //almaceno los mensajes en memoria volatil en el siguiente array
  mensajesSesionActual.push({receptor: receptor, emisor: emisor, mensaje: mensaje});

  //el contador contadorMensajesSesion[emisor,receptor] es para llevar control de los mensajes de sesion entre usuario y contacto  
  //cuando el contador es 0 entonces hay un inicio de sesion por parte de alguno de los dos usuario
  //por lo que se vuelven a negociar las llaves e inicia el conteo y generacion de llaves Ratchet
  if( (isNaN(contadorMensajesSesion[emisor,receptor]))||(contadorMensajesSesion[emisor,receptor]==0)) {
    //para el primer mensaje entre emisor y receptor
      contadorMensajesSesion[emisor,receptor]=0
      contadorMensajesSesion[emisor,receptor] = contadorMensajesSesion[emisor,receptor] + 1;
      //console.log('contadorMensajesSesion emisor ', emisor, ' receptor ', receptor, contadorMensajesSesion[emisor,receptor]);

      //el siguiente secretoCompartido se genera en automatico cuando los usuarios inician sesion y 
      //hacen los avisos respectivos en socket.on() avisoUsuariosConectados y avisoContactosConectados
      secretoCompartido = document.getElementById('secretoCompartido_'+receptor).innerHTML;
      secretoCompartido = parseInt(secretoCompartido);
     
      mensaje_cifrado = cifradoSustitucion(mensaje,secretoCompartido);

     //ya genere primera llave rachet arriba en socket.on() avisoUsuariosConectados y avisoContactosConectados 
     //la obtengo para mandarla junto con el primer mensaje
      var indiceRachetCero=0
      ratPubDHenvioRatchet0 = 0;
      for (var i = 0; i < ratPubDHenvio.length; i++) {
        if ((ratPubDHenvio[i].emisor==usuarioEnvia)&&(ratPubDHenvio[i].receptor==contactoEnviar))
          {   
            //console.log(ratPubDHenvio[i].emisor,ratPubDHenvio[i].receptor,ratPubDHenvio[i].ratchet,i);
            indiceRachetCero=i;
            ratPubDHenvioRatchet0=ratPubDHenvio[i].ratchet;
          }//fin if
      }//fin del for

 
      //envio mensaje y datos del mensaje al servidor
      //nuevo_mensaje emite mensajes nuevos al servidor con todos los datos necesarios para su envio, junto con la llave racthet
      socket.emit('nuevo_mensaje', {emisor: emisor, mensaje: mensaje_cifrado, receptor: receptor, ratPubDHenvio:ratPubDHenvioRatchet0, indiceRatPubDH:0});
      //console.log("Cliente emit('nuevo_mensaje'): " + " El emisor: " + emisor + ", envia mensaje: " + mensaje_cifrado + ", al receptor: " + receptor);
  }//fin if si se inicia sesion y el contador de mensajes es 0


  else { //cuando el contador no es 0 osea que ya hay una sesion establecida y hay mas de un mensaje
      
      //para seguir el conteo de los mensajes
      contadorMensajesSesion[emisor,receptor] = contadorMensajesSesion[emisor,receptor] + 1; 
     
 
      //voy a cifrar mi mensaje empleando la ultima llave publica recibida por parte del receptor ratPubDHrecibo
      //y mi ultima llave privada generada por el emisor ratPrivDHenvio
      //cuando envio mi mensaje cifrado lo envio junto con la llave publica de la llave privada que ocupe(ratPrivDHenvio) y su respectivo indice 
      //ademas envio el numero de indice de la llave publica que recibi (ratPubDHrecibo) y que ocupe para cifrar

      //si todavia no se ha recibido un mensaje por parte del receptor sigo empleando la informacion del primer mensaje 0
      //aqui debo poner tambien la condicion de que si he sido yo el ultimo en mandar mensaje seguir enviando la misma ratchet
      //esta condicion if la pongo al final de este else para indicar que se sigue utilizando el mismo secretoCompartido



      //POR LO TANTO si el receptor va a enviar un mensaje si no se cumple la condicion explicada en el parrafo anterior
      //busco el indice y la ultima llave publica ratPubDHrecibo que tengo almacenada con el receptor,
      var ultimoIndiceReceptor = "";
      var ultimaLlaveRatPubDHreciboReceptor = "";
      for (var i = 0; i < ratPubDHrecibo.length; i++) {
        if ((ratPubDHrecibo[i].emisor==receptor)&&(ratPubDHrecibo[i].receptor==emisor))
          {   
            //console.log(ratPubDHrecibo[i].emisor,ratPubDHrecibo[i].receptor,ratPubDHrecibo[i].ratchet,i);
            ultimoIndiceReceptor=ratPubDHrecibo[i].indice;
            ultimaLlaveRatPubDHreciboReceptor=ratPubDHrecibo[i].ratchet;         
            
          }//fin if
      }//fin del for


      //busco mi ultima llave privada que genere cuando recibi el ultimo mensaje del receptor        
      var ultimoIndiceEmisor = "";
      var ultimaLlaveRatPrivDHenvioEmisor = "";
      for (var i = 0; i < ratPrivDHenvio.length; i++) {
              if ((ratPrivDHenvio[i].emisor==emisor)&&(ratPrivDHenvio[i].receptor==receptor))
                {   
                  //console.log(ratPrivDHenvio[i].emisor,ratPrivDHenvio[i].receptor,ratPrivDHenvio[i].ratchet,i);
                  ultimoIndiceEmisor = ratPrivDHenvio[i].indice;
                  ultimaLlaveRatPrivDHenvioEmisor = ratPrivDHenvio[i].ratchet;            
                }//fin if
            }//fin del for
      
           
      //con la ultima llave publica del receptor y con la ultima llave privada del emisor cifro el mensaje
      //generarSecretoCompartido(llavePrivadaEmisor,llavePublicaReceptor)
      secretoCompartido = generarSecretoCompartido(ultimaLlaveRatPrivDHenvioEmisor,ultimaLlaveRatPubDHreciboReceptor);
      
      //CUANDO ENVIO MENSAJES mando la llave ratchet publica de la llave privada que utilice anterioremente para cifrar (ratPubDHenvio)
      //y tambien mando su indice      
      ultimoIndiceEmisor = 0;
      ultimaLlaveRatPubDHenvioEmisor = 0;
      ultimoIndice = 0;
      for (var i = 0; i < ratPubDHenvio.length; i++) {
              if ((ratPubDHenvio[i].emisor==emisor)&&(ratPubDHenvio[i].receptor==receptor))
                {   
                  //console.log(ratPubDHenvio[i].emisor,ratPubDHenvio[i].receptor,ratPubDHenvio[i].ratchet,i);
                  //ultimoIndiceEmisor = i;
                  ultimaLlaveRatPubDHenvioEmisor = ratPubDHenvio[i].ratchet;
                  ultimoIndice = ratPubDHenvio[i].indice;
                }//fin if
            }//fin del for
     
       //si todavia no se ha recibido un mensaje por parte del receptor sigo empleando la informacion del primer mensaje 0      
       if(ultimaLlaveRatPubDHreciboReceptor==""){
        secretoCompartido = document.getElementById('secretoCompartido_'+receptor).innerHTML;
        ultimoIndice = 0;
        var indiceRachetCero=0
        ratPubDHenvioRatchet0 = 0;
        for (var i = 0; i < ratPubDHenvio.length; i++) {
          if ((ratPubDHenvio[i].emisor==usuarioEnvia)&&(ratPubDHenvio[i].receptor==contactoEnviar))
            {   
              //console.log(ratPubDHenvio[i].emisor,ratPubDHenvio[i].receptor,ratPubDHenvio[i].ratchet,i);
              indiceRachetCero=i;
              ratPubDHenvioRatchet0=ratPubDHenvio[i].ratchet;
            }//fin if
         }//fin del for
         ultimaLlaveRatPubDHenvioEmisor=ratPubDHenvioRatchet0;
      }

         
      secretoCompartido = parseInt(secretoCompartido);
      mensaje_cifrado = cifradoSustitucion(mensaje,secretoCompartido);
      socket.emit('nuevo_mensaje', {emisor: emisor, mensaje: mensaje_cifrado, receptor: receptor, ratPubDHenvio:ultimaLlaveRatPubDHenvioEmisor, indiceRatPubDH:(ultimoIndice), indiceRatPubDHreciboEmplieCifrar:ultimoIndiceReceptor});
      //socket.emit('nuevo_mensaje', {emisor: emisor, mensaje: mensaje_cifrado, receptor: receptor, ratPubDHenvio:ratPubDHenvio[emisor,indiceLlavesRachet], indiceRatPubDH:indiceLlavesRachet});


  }//fin del else cuando el contador no es 0 osea que ya hay una sesion establecida y hay mas de un mensaje

}//fin de la funcion

//funcion que utilizo para pedir la llave publica del receptor
function pedirLlavePub(receptor){  
  //PARA PEDIR LAS LLAVES PUBLICAS
  socket.emit('pedirLlavePub', {receptor: receptor});
  
  socket.on('recibirLlavePub', function(datos) {

     console.log('Cliente socket.on("recibirLlavePub"): La llave publica del receptor ' + datos.receptor + " es " + datos.llavePub);
     llavePublicaReceptor = datos.llavePubSesion;

     //console.log('Cliente socket.on("recibirLlavePub"): llave publica dentro de socket.on recibirLlavePub '+ llavePublicaReceptor);
     secretoCompartido = (Math.pow(llavePublicaReceptor, a))%11;

     console.log('Cliente socket.on("recibirLlavePub"): El Secreto Compartido con el receptor '+ datos.receptor + " es " + secretoCompartido);
    });
  
}




function enviar_mensaje(emisor,mensaje,receptor=null){
  //console.log(emisor,mensaje,receptor);
  //existeSesionCifrada(emisor,receptor);
  existeSesionCifradaDispositivo(emisor,receptor).then((respuestaSesionDispositivo)=>{
      //console.log(respuestaSesionDispositivo);
      
      //si si existe la sesion cifrada   
      if (respuestaSesionDispositivo == 1){ 
          console.log("Existe sesion local");
          //enviar mensajes al receptor


        //si no existe sesion cifrada localmente
        }else{
          console.log("No existe sesion local");
            //GESTIONAR LA SESION CON EL RECEPTOR EN LA BASE DE DATOS DEL SERVIDOR
            //buscar si hay una solicitud de sesion en el servidor por parte del emisor
            //existeSolicitudSesionServidor(emisor,receptor);
            url = "http://localhost:4000/links/gestionarSesion/"+emisor+"/"+receptor;        
            makeAjaxCall(url, "GET").then((processSesionDetailsResponse)=>{
            //se obtiene la respuesta de router.get('/buscarSesionAceptada/:emisor/:receptor'), que esta en links.js
            //que es la busqueda de sesiones aceptadas en tb_sesiones_aceptadas_detalle 
            let respuesta = {};
            respuesta = processSesionDetailsResponse;            
            console.log(respuesta);
            
            if (respuesta.almacenarMensajesDispositivo == "si"){
              //almacenar mensajes dispositivo local
              console.log('almacenar mensajes en dispositivo');
              almacenarMensajesInicialesDispositivo(emisor,receptor,mensaje);              
            }

            if (respuesta.almacenarSesionDispositivo == "si"){
              //almacenar sesion en el dispositivo
              console.log('almacenar sesion en dispositivo');
            }

            if (respuesta.enviarMensajesIniciales == "si"){
              //enviar mensajes iniciales al receptor
              console.log('enviar mensajes iniciales');

            }
            
          }, errorHandler);


      }//fin else respuestaSesionDispositivo    
  });//fin existeSesionCifradoDispositivo()

}//fin funcion enviar_mensaje();

function abrirContenedorContactos(){
  document.getElementById('contenedorContactos').style.display = "block";
  document.getElementById('contenedorChat').innerHTML = "";
  document.getElementById('contenedorChat').style.display = "none";
}


