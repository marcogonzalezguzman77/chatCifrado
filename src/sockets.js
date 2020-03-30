//ESTA FUNCION ES DEL LADO DEL SERVIDOR Y ES PARA SOCKET// AQUI NO PUEDO UTILIZAR DOMS DE JAVASCRIPT

//para trabajar con la base de datos
const pool = require('./database.js')
//var socketR = "";

module.exports = function (io) {

  //connect es un evento predefinido, que se emplea para realizar acciones cuando un usuario se conecta al servidor
  //esta funcion se emplea cuando cualquier usuario se conecta
  io.on('connection', (socket) =>{ //.on es un evento que se escucha
          console.log('nueva conexion id: ' + socket.id);

          //cuando el usuario cliente se conecta al servidor, el usuario informa su conexion con socket.emit('nueva_conexionUsuario')
          //espero datos del usuario cuando se conecte para guardar la conexion en la base de datos del servidor, en la tabla 'tb_conexiones_general'
          socket.on('nueva_conexionUsuario', function(datos){
            console.log("Servidor: El usuario "+ datos.usuario + " entro al chat con la Llave Pub: " + datos.llavePubSesion);
            
            //cuando un usuario se conecta el servidor debe avisar sobre los contactos que tiene el usuario en linea
            //busco los contactos en linea en la tabla tb_conexiones_general, y los envio al usuario que se conecto (socket.id), empleo la funcion socket.emit('avisoContactosConectados')
            //tambien aviso al resto de usuarios que ese usuario se conecto con socket.emit('avisoUsuarioConectado')
            buscarContactosConectados(datos.usuario).then((result) =>{
              //result devuelve dos resultados result 1 y result 2 de dos consultas realizada a la base de datos
              //result 1 consulta las conexiones entre usuario contactos ocupo el socket de los conctactos conectados socketId
              //result 2 consulta los datos del usuario ocupo la llave de identidad del usuario llavePublicaIdentidad
              
              [result1, result2] = result;
              

              const string1 = JSON.stringify(result1);
              const valores1 = JSON.parse(string1);
              //const usuariosConectados = {valores};

              const string2 = JSON.stringify(result2);
              const valores2 = JSON.parse(string2);
              const element2 = valores2[0]; //un solo resultado y ocupare llavePublicaIdentidad del usuario element2.llavePublicaIdentidad

              //en la variable valores se almacena el resultado de la consulta de las tres tablas:
              //tb_contactos_usuarios_detalle, tb_conexiones_general, users, y se almacenan todos los campos de citadas tablas
              //entre ellas las llaves Publicas de sesion y llaves Publicas de Identidad .....
              //el socket id de conexion etc.
              //DEBO AVISAR SOLO AL USUARIO QUE SE ACABA DE CONECTAR CUALES SON SUS CONTACTOS CONECTADOS
              //el servidor escucha cuando un contacto se conecta, 
              //busca sus contactos conectados del usuario y se los envia
              //CON EL SIGUIENTE socket EL USUARIO BUSCA PARA SI MISMO, NO AVISA A OTROS CONTACTOS
              io.to(socket.id).emit('avisoContactosConectados', {contactosConectados: valores1, llavePublicaIdentidadUsuario: element2.llavePublicaIdentidad });




              //DEBO AVISAR TAMBIEN A LOS CONTACTOS DEL USUARIO QUE SE CONECTO QUE SE ACABA DE CONECTAR
              //desglozo los usuarios para obtener su socket.id y enviarle los datos del usuario a cada uno
              longitudContactos = valores1.length;
              //console.log('Longitud Contactos ',longitudContactos);
              const propierties = valores1[0];
              //este for es para que en la ventana de CONTACTOS se coloque Online si es que los contactos del usuario estan conectados
              for (let index = 0; index < valores1.length; index++) {
                const element1 = valores1[index];
                
                //element1 son los datos del conctacto
                //datos son los datos del usuario
              
                //recuerda que el array datos proviene de la conexion del cliente cuando avisa con un socket.emit('nueva_conexionUsuario')
                //y alli vienen los datos del usuario datos.usuario y de la llave publica de sesion datos.llavePubSesion
                //la llave publica de identidad llavePubIdentidad proviene de la variable valores.element que proviene del resultado
                //de la busqueda de contactos conectados en la base de datos
                //console.log('dentro de avisoUsuarioConetado ', datos.usuario, " ", element1.llavePublicaIdentidad);
                io.to(element1.socketId).emit('avisoUsuarioConectado', {usuarioConectado: datos.usuario, socketUsuario: socket.id, llavePubUsuarioSesion: datos.llavePubSesion, llavePubUsuarioIdentidad: element2.llavePublicaIdentidad});
              }//fin for valores1


              //console.log(propierties);
             // socketReceptor = propierties.socketId
              //console.log(socketReceptor);


            }); //fin buscarContactos()
            
            //aqui guardo la conexion del el usuario que se acaba de conectar y que aviso al servidor que se conecto
            guardarConexionBD(this.id, datos.usuario, datos.llavePubSesion, 'tb_conexiones_general');


          }); //fin socket.on nueva_conexionUsuario




          //socket.on('nuevo_mensaje'), recibe un mensaje nuevo del cliente, con toda la informacion necesaria para su transmision
          //y luego transmito ese mensaje al destinatario con emit('enviar_mensaje')
          socket.on('nuevo_mensaje', function(datos){ //servidor a la escucha de un nuevo mensaje
            //console.log("socket.on nuevo_mensaje: "+ datos.emisor+" "+ datos.mensaje + " " + datos.receptor);

            //funcion asincrona, busco el socket del usuario receptor para poder enviar el mensaje
            buscarSocketsUsuario(datos.receptor).then((result) => { //busco los sockets del receptor, debo modificcar y que se busque localmente no en el servidor// para esto debo jugar con las publicaciones de los sockets por parte del servidor, talvez almaceno en base de datos local
              
              const string = JSON.stringify(result);
              const valores = JSON.parse(string);
              const propierties = valores[0];
              //console.log(propierties);
              socketReceptor = propierties.socketId
              //console.log('Socket Receptor: ',socketReceptor);
              
              console.log("Servidor (buscarSocketsUsuario()), emit('enviar_mensaje'): El socket del recpetor: " + datos.receptor +  " es: " + socketReceptor);

              //emito a todos los clientes el mensaje
              //io.emit('enviar_mensaje', {emisor: datos.emisor, mensaje: datos.mensaje, receptor: datos.receptor, socketReceptor: socketReceptor });

              //emito a un solo ciente el mensaje
              //enviar_mensaje, envio los mensajes a todos los clientes, o bien a un solo cliente
              //con io.emit envio mensajes a todos los usuarios
             
              io.to(socketReceptor).emit('enviar_mensaje', {emisor: datos.emisor, mensaje: datos.mensaje, receptor: datos.receptor, socketReceptor: socketReceptor, ratPubDHemisorEnvio:datos.ratPubDHenvio, indiceRatPubDHemisor: datos.indiceRatPubDH, indiceRatPubDHreciboEmplieCifrar:datos.indiceRatPubDHreciboEmplieCifrar });
              
              //el io siguiente lo utilizaba porque tambien mandaba a la red el mensaje que va para mi mismo, ahora ya no lo mando en el mismo cliente
              //io.to(this.id).emit('enviar_mensaje', {emisor: datos.emisor, mensaje: datos.mensaje, receptor: datos.receptor, socketReceptor: socketReceptor, ratPubDHemisorEnvio:datos.ratPubDHenvio, indiceRatPubDHemisor: datos.indiceRatPubDH });

            });

            //socket.emit('enviar_mensaje', {emisor: datos.emisor, mensaje: datos.mensaje, receptor: datos.receptor});

          }); //fin socket de nuevo_mensaje


          //PARA ENVIAR LAS LLAVES PUBLICAS CUANDO SON REQUERIDAS PARA PODER ENVIAR MENSAJES
            socket.on('pedirLlavePub', function(datos){

              //funcion asincrona
              buscarllavePubUsuario(datos.receptor).then((result) => { //busco la llave publica del receptor
                llavePublica = Object.values(result)[3]; //objtengo valores del objeto recibido, el campo no. 3 que es la llavePub
                console.log("Servidor (on.pedirLlavePub): La Llave Publica del Receptor: " + datos.receptor + " es: " + llavePublica);
                
                //solo envio la llave publica del receptor al emisor
                io.to(this.id).emit('recibirLlavePub', { llavePubSesion: llavePublica, receptor: datos.receptor });

              });

              //io.to(this.id).emit('recibirLlavePub', { llavePub: "20" });

            });

            //LOS SIGUIENTES DOS socket.on(), toman acciones cuando los clientes se desconectan ya sea provocada por el servidor o provocado por el cliente
            //cuando el cliente se desconecta borro la conexion de la base de datos del servidor y de la tabla 'tb_conexiones_general'
            socket.on('disconnect', function(){
              id_socket = socket.id;
              //funcion asincrona

              //busco primero el username del usuario que se va a desconectar 
              //ya que lo encuentra busco los contactos del usuario para avisarles que se va a desconectar
              //con emit('avisoUsuarioDesConectado')
              //ya despues borro la conexion de la base de datos
              buscarUsuarioDesconectado(id_socket).then((result) => {                
                const string = JSON.stringify(result);
                const valores = JSON.parse(string);
                const propierties = valores[0];
                //console.log(propierties);
                userUsuario = propierties.fk_username;
                //console.log('user Usuario: ',userUsuario);                
                
                
                buscarContactosUsuarioDesconectar(userUsuario).then((result) =>{
                  //console.log(result);
                  const string = JSON.stringify(result);
                  const valores = JSON.parse(string);
                  //const usuariosConectados = {valores};
    
                  //DEBO AVISAR A LOS CONTACTOS DEL USUARIO DESCONECTADO QUE ESTE SE DESCONECTÓ
                  //desglozo los usuarios para obtener su socket.id y enviarle los datos del usuario
                  longitudContactos = valores.length;
                  //console.log('Longitud Contactos ',longitudContactos);
                  const propierties = valores[0];
                  //este for es para que en la ventana de CONTACTOS se coloque Online si es que los contactos del usuario estan conectados
                  for (let index = 0; index < valores.length; index++) {
                    const element = valores[index];
                    //document.getElementById('situacionConexion_'+element.fk_user_contacto).innerHTML="Online";
                    //console.log('sockets contactos conectados usuario que se desconectara: '+ element.fk_user_contacto+ ' socket.id '+ element.socketId);
                    io.to(element.socketId).emit('avisoUsuarioDesConectado', {usuarioDesConectado: userUsuario, socketUsuario: socket.id, llavePubUsuarioSesion: element.llavePublicaSesion});
                  }

                  borrarConexionBD(id_socket);
                });




                
                //borrarConexionBD(id_socket);
              },errorHandler);//fin buscarUsuarioDesconectado()
            });//fin socket.on('disconnect')

            //cuando el servidor se desconecta del cliente pero por cuestiones del servidor no del cliente
            //tengo que borrar tambien la conexion
           /* socket.on('borrar_conexion', function(datos){ 
              id_socket = datos.socketId;
              //funcion asincrona
              buscarUsuarioDesconectado(id_socket).then((result) => { ////busco el username del usuario que se va a desconectar
                console.log('borrar conexion', result);
                const string = JSON.stringify(result);
                const valores = JSON.parse(string);
                const propierties = valores[0];
                //console.log(propierties);
                userUsuario = propierties.fk_username;
                console.log('user Usuario: ',userUsuario);
                

                buscarContactosUsuarioDesconectar(userUsuario).then((result) =>{
                  //console.log(result);
                  const string = JSON.stringify(result);
                  const valores = JSON.parse(string);
                  //const usuariosConectados = {valores};
    
                  //DEBO AVISAR A LOS CONTACTOS DEL USUARIO DESCONECTADO QUE ESTE SE DESCONECTÓ
                  //desglozo los usuarios para obtener su socket.id y enviarle los datos del usuario
                  longitudContactos = valores.length;
                  console.log('Longitud Contactos ',longitudContactos);
                  const propierties = valores[0];
                  //este for es para que en la ventana de CONTACTOS se coloque Online si es que los contactos del usuario estan conectados
                  for (let index = 0; index < valores.length; index++) {
                    const element = valores[index];
                    //document.getElementById('situacionConexion_'+element.fk_user_contacto).innerHTML="Online";
                    console.log('sockets contactos conectados usuario que se desconectara: '+ element.fk_user_contacto+ ' socket.id '+ element.socketId);
                    io.to(element.socketId).emit('avisoUsuarioDesConectado', {usuarioDesConectado: userUsuario, socketUsuario: socket.id, llavePubUsuario: element.llavePublica});
                  }                
                
                  borrarConexionBD(id_socket);
                  
		            });

                //borrarConexionBD(id_socket);
              });//fin buscarUsuarioDesconectado
             
            });//fin socket.on('borrar_conexion') */






            
          //estoy a la escucha de solicitudes de sesciones cifradas por parte de los usuaruios socket.on('solicitudHaciaServidor...')
            //una vez recibida la solicitud la envio al contacto final socket.emit('solicitudHaciaContacto....')
        /*    socket.on('solicitudHaciaServidorSesionCifradaUsuario-Contacto', function(datos,callback){
              //+++++++++++++HAY QUE SINCRONIZAR ++++++++++++++++
              console.log('solicitudHaciaServidorSesionCifradaUsuario userUsuario', datos.userUsuario, ' userContacto', datos.userContacto);
              usuario = datos.userUsuario;
              contacto = datos.userContacto;
              mensajeADcifrado = datos.mensajeADcifrado;
              llavePublicaIdentidadUsuario = datos.llavePublicaIdentidadUsuario;
              llaveEfimeraPublicaSesion = datos.llaveEfimeraPublicaSesion;

              //busco socket del contacto a quien quiero hacer la solicitud de sesion cifrada
              buscarSocketsUsuario(contacto).then((result) => { 
              
                const string = JSON.stringify(result);
                const valores = JSON.parse(string);
                const propierties = valores[0];
                //console.log(propierties);
                socketContacto = propierties.socketId

                // +++++++++++++++++ HAY QUE SINCRONIZAR AQUI++++++++++++++++++ este emit hay que hacerlo esperar
                //hasta el siguiente emit
                //envio la solicitud solo al contacto con todos los datos necesarios procedentes del usuario
                io.to(socketContacto).emit('solicitudHaciaContactoSesionCifradaUsuario-Contacto', {userUsuario: usuario, userContacto: contacto, mensajeADcifrado: mensajeADcifrado, llavePublicaIdentidadUsuario: llavePublicaIdentidadUsuario, llaveEfimeraPublicaSesion: llaveEfimeraPublicaSesion});

                //ESTE MENSAJE LLEGA DOBLE AL  CLIENTE
                callback('Solicitud de sesion cifrada recibida del usuario ' + usuario + ' del contacto: ' + contacto);


              });//fin buscarSocketsUsuarios()
              
            });//fin socket.on('solicitudHaciaServidorSesionCifradaUsuario')

            
            socket.on('respuestaSolicitudSesionCifradaUsuarioHaciaServidor',function(datos){  
              //HAYQ QUE SINCRONIZAR AQUI
              //aqui estan llegando repetidos los valores*********
              console.log('respuesta solicitud Sesion Cifrada Usuario Hacia Servidor del usuario: ', datos.userUsuario, ' contacto: ', datos.userContacto);
              usuario = datos.userUsuario;
              contacto = datos.userContacto;
              respuesta = datos.respuesta;              
              
              buscarSocketsUsuario(usuario).then((result) => { 
              
                const string = JSON.stringify(result);
                const valores = JSON.parse(string);
                const propierties = valores[0];
                //console.log(propierties);
                socketUsuario = propierties.socketId

                //console.log("socketUsuario respuesta sesion cifrada: ", socketUsuario);
                //respuestaContactoSesion="";

                io.to(socketUsuario).emit('respuestaSolicitudSesionCifradaUsuarioHaciaContacto', {respuesta: respuesta, contacto: contacto});

                //callback('Respuesta de sesion cifrada recibida');

              });//fin buscarSocketsUsuarios()

              //socket.emit('respuestaSolicitudSesionCifradaUsuarioHaciaContacto',{respuesta: datos.respuesta});
            });
            */









  });//fin de io.on connect

} //FIN module.exports de la funcion(io) de los sockets








//FUNCIONES PARA GUARDAR LA CONEXION en la base de datos
async function guardarConexionBD(socketId, usuario, llavePub, tabla){
  
  if (tabla=='tb_conexiones_contactos'){
      const newConnection = {
        username_conexion: usuario,
        socket_conexion: socketId,
        llavePublicaSesion: llavePub,        
      };
      //console.log(socketId + " " + usuario);
      //console.log(newConnection);
      await pool.query('INSERT INTO tb_conexiones_contactos set ?', [newConnection]);
  }
  if (tabla=='tb_conexiones_general'){
      const newConnection = {
        fk_username: usuario,
        socketId: socketId,
        llavePublicaSesion: llavePub        
      };
      //console.log(socketId + " " + usuario);
      //console.log(newConnection);
      await pool.query('INSERT INTO tb_conexiones_general set ?', [newConnection]);
  }


  console.log("Servidor: Sesión guardada en Base de Datos");
}

//FUNCION PARA BORRAR LA CONEXION CUANDO SE DESCONECTAN LOS CLIENTES
async function borrarConexionBD(socketId){
  console.log("SocketId a borrar: " + socketId);
  
  await pool.query('DELETE FROM database_links.tb_conexiones_general WHERE socketId = ?', [socketId]);
  //await pool.query('DELETE FROM database_links.tb_conexiones_contactos WHERE username_conexion = ?', [socketId]);
  console.log("Servidor: Sesión borrada de Base de Datos");
}


//FUNCION PARA BUSCAR SOCKETS DE USUARIOS PARA ENVIAR MENSAJES
async function buscarSocketsUsuario(usuario) {
  let sockets_receptor;
  let long;
  const resultado = await pool.query('SELECT * FROM tb_conexiones_general WHERE fk_username = ?', [usuario]);
  
  return resultado;
}

//FUNCION PARA BUSCAR LLAVES PUBLICAS DE USUARIO PARA ENVIAR MENSAJES
async function buscarllavePubUsuario(usuario) {
  let sockets_receptor;
  let long;
  sockets_receptor = await pool.query('SELECT * FROM tb_conexiones_general WHERE fk_username = ?', [usuario]);
  long = sockets_receptor.length;
  //console.log(sockets_receptor[long-1]);
  return sockets_receptor[long-1];
}

//FUNCION PARA BUSCAR CONTACTOS CONECTADOS Y AVISARLES QUE UN USUARIO SE ACABA DE CONECTAR
async function buscarContactosConectados(usuario){
  resutaldoContactosConectados = await pool.query('SELECT * FROM tb_contactos_usuarios_detalle, tb_conexiones_general, users where fk_user_usuario = ? and fk_user_contacto = fk_username and username=fk_username', [usuario]);
  //console.log(resutaldoContactosConectados);

  resultadoLlaveIdentidadUsuario = await pool.query('SELECT * FROM users where username = ?', [usuario])

  return [resutaldoContactosConectados, resultadoLlaveIdentidadUsuario];

}

//FUNCION PARA BUSCAR username DE USUARIO QUE SE VA A DESCONECTAR PARA PODER BUSCAR SUS CONTACTOS Y AVISARLES QUE SE DESCONECTARA
async function buscarUsuarioDesconectado(socketId){
  const resultado = await pool.query('SELECT * FROM tb_conexiones_general WHERE socketId = ?', [socketId]);
  return resultado;
}

//FUNCION PARA BUSCAR CONTACTOS DEL USUARIO QUE SE VA A DESCONECTAR PARA AVISARLES QUE SE VA A DESCONECTAR
async function buscarContactosUsuarioDesconectar(usuario){
  resutaldoContactosUsuarioDesconectar = await pool.query('SELECT * FROM tb_contactos_usuarios_detalle, tb_conexiones_general where fk_user_usuario = ? and fk_user_contacto = fk_username', [usuario]);
  //console.log(resutaldoContactosConectados);

  return resutaldoContactosUsuarioDesconectar;

}

function errorHandler(statusCode){
  console.log("Error: ",statusCode);
}