//sitios webs favoritos

const express = require('express');
const router = express.Router();

const pool = require ('../database.js')
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth'); //metodo para proteger rutas de la navegacion en paginas sin sigin

//const enviar_mensaje  = require('../public/js/funciones_socket'); //funciones para los sockets

//el siguiente link busca todos los contactos y los despliega en la plantilla contactos.hbs
router.get('/contactos', isLoggedIn, async (req, res) => { //busco la plantilla del chat
  //res.send('Form');
  username = req.user.username;
  
  const contactos = await pool.query('SELECT * FROM tb_contactos_usuarios_detalle, users WHERE fk_user_usuario = ? and fk_user_contacto = username', [username]);
  //console.log(contactos);
  res.render('links/contactos.hbs', {contactos: contactos})
});


//el siguiente link, lo empleo desde la plantilla contactos.hbs, al pedir una imagen desde 
//el input <img src='./imagenes/{{nombreImagen}}' class='imgRedonda' /> pedia la direccion http://localhost:4000/link/imagenes/imagen.jpg
//entonces lo que hice fue direccionarlo a la carpeta publica (public/img) que es donde se encuentran las imagenes
//LO DEJE DE OCUPAR PORQUE ENCONTRE OTRA SOLUCION DIRECTA, lo dejo porque puede servir para despues
/*
router.get('public/imagenes/:imagen', isLoggedIn, async (req, res) => {
  const parametros = req.params;  
  const nombreImagen = parametros.imagen
  //console.log(nombreImagen);
  res.redirect('/img/'+nombreImagen);
});
*/

//el siguiente link, abre el chat con el contacto en la plantilla chat.hbs
//emplea el div 'contenedorChat' que esta dentro de contactos.hbs, para poder
//desplegar el chat de cada usuario
router.get('/chat/:userContacto/:userFullname/:userImage/:userUsuario', isLoggedIn, (req, res) => { //busco la plantilla del chat
  //res.send('Form');
  const userContacto = req.params;
  const datosUsuario = userContacto;
  //console.log("datos usuario: ",datosUsuario);
  //userUsuario="marcoglz";
 // res.render('links/chat.hbs', {datosUsuario})

  plantillaChatContacto ='<script type="text/javascript">iniciar_chat("'+datosUsuario.userUsuario+'","'+datosUsuario.userContacto+'"); </script><style media="screen">#cont_mensajes{height:25em;background-color:#b8c6ac;text-align:left;line-height:10px;padding:2px}.imgRedonda{width:60px;height:60px;border-radius:30px}.mensajeEmisor{clear:both;padding:10px;background-color:#e6f6d8;width:auto;margin:1px;margin-bottom:5px;display:inline-block;line-height:20px;float:right;margin-left:20px;border-right:5px solid #1c6ea4;border-radius:10px 0 20px 10px}.mensajeReceptor{clear:both;padding:10px;background-color:#fff;width:auto;margin:1px;margin-bottom:5px;display:inline-block;line-height:20px;float:left;margin-right:20px;border-left:5px solid #1c6ea4;border-radius:0 10px 10px 20px}</style><div class="row"> <div class="col-md-8 mx-auto"> <div class="card text-center"> <div class="card-body" style="padding:0.25rem"><div style="margin:auto; overflow:hidden; background-color:#5a6253; padding:2px; color:white;"><i onclick="abrirContenedorContactos()" class="fas fa-arrow-left fa-3x" style="float:left; vertical-align:middle; margin-top:2px; margin-right:5px; margin-left:5px; cursor:pointer; "></i><div style="float:left;"><img src=/img/'+datosUsuario.userImage+' class="imgRedonda"/></div><div style="margin-left:10px; margin-top:15px; float:left;"> <h5 style="text-align:left;">'+datosUsuario.userFullname+'</h5> </div></div><div class="" id="cont_mensajes" style="clear:both; overflow:auto;"></div><input type="hidden" id="usuario" name="usuario" value="'+datosUsuario.userUsuario+'"></input><div id="div_enviar_mensaje" style="margin:auto; margin-top:2px; overflow:hidden; "> <textarea style="float:left;" id="mensaje" placeholder="mensaje"></textarea><i onclick="enviar_mens()" class="fas fa-arrow-circle-right fa-3x" style="float:left; margin-left:5px; margin-top:2px; cursor:pointer; color:#67705f;"></i> </div><div class="" id="div_receptor" style="margin-top:5px; float:left;"> <input type="hidden" id="receptor" placeholder="receptor" name="" value="'+datosUsuario.userContacto+'"> </div> <!--<div class="" style="clear:both; float:left; margin-top:0em; padding:0px;"> <a href="javascript:pedirLlaves()" class="btn btn-primary " id="btn_enviar_mensaje"> Pedir llave pública </a> <a href="javascript:enviar_mens()" class="btn btn-primary " id="btn_enviar_mensaje"> ENVIAR </a></div>--></div></div></div></div><script>function enviar_mens(){mensaje=$("#mensaje").val(); receptor=$("#receptor").val(); emisor="'+datosUsuario.userUsuario+'"; //console.log("En el cliente: "+ " mensaje: " + mensaje + " receptor: " + receptor); if (receptor !=""){enviar_mensajev1(emisor, mensaje, receptor);}else{enviar_mensajev1(emisor, mensaje);}}function pedirLlaves(){mensaje=$("#mensaje").val(); receptor=$("#receptor").val(); emisor="'+datosUsuario.userUsuario+'"; //console.log("En el cliente: "+ " mensaje: " + mensaje + " receptor: " + receptor); if (receptor !=""){pedirLlavePub(receptor);}else{}}</script>';
  
  res.send(plantillaChatContacto);
});


//buscar sesiones establecidas en la base de datos del servidor
router.get('/gestionarSesion/:emisor/:receptor', isLoggedIn, async (req, res) => {
  //res.send('Form');
  const { emisor, receptor } = req.params;
  let res_sol_enviada = "";
  let res_sol_recibida = "";
  let confirmar_solicitud_emisor = "no";
  let almacenarMensajesDispositivo = "no";
  let enviarMensajesIniciales = "no";
  let almacenarSesionDispositivo = "no";
  
  //busco primero si existe una solicitud enviada por parte del emisor y su situacion
  const resultado_solicitud_enviada = await pool.query('SELECT * FROM tb_solicitudes_sesion_enviadas WHERE fk_usuario_solicitado=? and fk_usuario_solicitante=?', [receptor,emisor]);  
  longitud_resultado_solicitud_enviada = Object.keys(resultado_solicitud_enviada).length;
  console.log("longitud solicitud enviada: ", longitud_resultado_solicitud_enviada);
  if (longitud_resultado_solicitud_enviada > 0){
    res_sol_enviada = resultado_solicitud_enviada[0].situacion_solicitud;
    confirmar_solicitud_emisor = resultado_solicitud_enviada[0].confirmar_solicitud;    
    console.log("situacion solicitud enviada:", res_sol_enviada);
  }

  //busco segundo si existe una solicitud enviada por parte del receptor y su situacion
  const resultado_solicitud_recibida = await pool.query('SELECT * FROM tb_solicitudes_sesion_enviadas WHERE fk_usuario_solicitante=? and fk_usuario_solicitado=?', [receptor,emisor]);
  longitud_resultado_solicitud_recibida = Object.keys(resultado_solicitud_recibida).length;
  console.log("longitud solicitud recibida: ", longitud_resultado_solicitud_recibida);
  if (longitud_resultado_solicitud_recibida > 0){
    res_sol_recibida = resultado_solicitud_recibida[0].situacion_solicitud;    
    console.log("situacion solicitud recibida:", res_sol_recibida);
  }  

  //si no existe solicitud enviada por el EMISOR o bien no existe alguna solicitud recibida POR EL RECEPTOR, crear 
  //solicitud en la base de datos del servidor tb_solicitudes_sesion_enviadas
  //y en la base de datos del dispositivo del EMISOR crear una tabla con los mensajes iniciales tb_mensajes_iniciales
  if (longitud_resultado_solicitud_enviada <= 0 && longitud_resultado_solicitud_recibida <=0){
    //crear solicitud en servidor tb_solicitudes_sesion_enviadas
    //router.get('/crearSolicitudSesion/:emisor/:receptor', isLoggedIn, async (req, res) => {


    //});

    //indicarle al dispositivo DEL EMISOR que debe almacenar los mensajes iniciales en la tabla tb_mensajes_iniciales
    almacenarMensajesDispositivo = "si"
  }

  //si existe una solicitud enviada POR EL EMISOR y la situacion_solicitud es "enviada", osea que no ha sido aceptada por el receptor
  //seguir almacenando mensajes en el dispositivo en la tabla tb_mensajes_iniciales
  if (longitud_resultado_solicitud_enviada > 0 && res_sol_enviada=="enviada"){
    //indicarle al dispositivo que debe seguir almacenando sus mensajes en la tb_mensajes_iniciales
    almacenarMensajesDispositivo = "si"
  }


  //si existe  una solicitud enviada por el EMISOR y la situacion_solicitud_enviada es "aceptada", osea que el receptor acepto la sesion
  //cambio el campo confirmar_solicitud="si" de la tabla tb_solicitudes_sesion_enviadas
  //indico al EMISOR que envie los mensajes iniciales de la tabla tb_mensajes_iniciales
  //indico al EMISOR que almacene sesion en el dispositivo en la tabla tb_sesiones_aceptadas
  if (longitud_resultado_solicitud_enviada > 0 && res_sol_enviada=="aceptada"){
    //actualizar el campo confirmar_solicitud="si" de la tabla tb_solicitudes_sesion_enviadas


    //indicar al EMISOR que envie los mensajes iniciales de la tabla tb_mensajes_iniciales
    //indicar al EMISOR que almacene sesion en el dispositivo en la tabla tb_sesiones_aceptadas
    enviarMensajesIniciales = "si";
    almacenarSesionDispositivo = "si";

  }




  //si existe una solicitud enviada por el RECEPTOR y no se ha confirmado la solicitud por el EMISOR confirmar_solicitud="no" 
  //actualizar la tabla tb_solicitudes_sesion_enviadas el campo situacion_solicitud como "aceptada"
  //seguir almacenando mensajes en la tb_mensajes_iniciales hasta que el RECEPTOR vea que ha sido aceptada, confirme (confirmar_solicitud="si")
  //y envie sus mensajes iniciales
  if (longitud_resultado_solicitud_recibida > 0 && res_sol_recibida=="enviada"){
    //actualizar campo situacion_solicitud = "aceptada" en tabla tb_solicitudes_sesion_enviadas en el servidor


    //indicar al EMISOR que siga almacenando mensajes en el dispositivo en la tabla tb_mensajes_iniciales
    //hasta que el RECEPTOR confirme la solicitud aceptada con el campo confirmar_solicitud = "si"
    //con la finalidad de que el receptor envie primero sus mensajes
    almacenarMensajesDispositivo = "si";
  }


  //si existe una solicitud enviada por el RECEPTOR y el EMISOR ya confirmo la solicitud confirmar_solicitud es "si"
  //indicar al EMISOR que envie sus mensajes iniciales de la tabla tb_mensajes_iniciales
  //indicar al EMISOR que guarde la sesion en la tabla tb_sesiones_aceptadas
  if (longitud_resultado_solicitud_recibida > 0 && confirmar_solicitud_emisor=="SI"){
    //indicar al EMISOR que envie sus mensajes iniciales de la tabla tb_mensajes_iniciales
    //indicar al EMISOR que guarde la sesion en la tabla tb_sesiones_aceptadas
    enviarMensajesIniciales = "si";
    almacenarSesionDispositivo = "si";
  }

  const respuesta = {
    almacenarMensajesDispositivo,
    enviarMensajesIniciales,
    almacenarSesionDispositivo
  }

  res.json(respuesta);
}); //FIN buscar sesiones establecidas en la base de datos del servidor









//LOS SIGUIENTES router.* NO LOS OCUPO POR EL MOMENTO

//este es para obtener (leerlos) links, pero no lo ocupo
router.get('/add', isLoggedIn, (req, res) => {
  //res.send('Form');
  res.render('links/add.hbs')
});

//este es para guardar los links para enviarlos con post, pero no lo ocupo
router.post('/add', isLoggedIn,  async (req,res) => { //asyn con await
  //console.log(req.body);
  const { title, url, description } = req.body;
  const newLink = {
    title,
    url,
    description,
    user_id: req.user.id
  };

  await pool.query('INSERT INTO links set ?', [newLink]);
  req.flash('success', 'Link guardado correctamente');
  //res.send('recibido');
  //res.redirect('/'); te redirecciona a la ruta principal
  res.redirect('/links');
});


//esta es la raiz /link muestra listado de links guardados, pero no lo uso
router.get('/', isLoggedIn, async (req, res) => {
  const links = await pool.query('SELECT * FROM links WHERE user_id = ?', [req.user.id]);
  //console.log(links);
  res.render('links/list.hbs',{links: links}  );
});

//para borrar links, pero no lo ocupo
router.get('/delete/:id', isLoggedIn, async (req,res) => {
  //console.log(req.params.id);
  //res.send('DELETED');
  const { id } = req.params;
  await pool.query('DELETE FROM links WHERE id =?', [id]);
  req.flash('success', 'Link borrado correctamente');
  res.redirect('/links');

});

//para editar links pero no lo ocupo
router.get('/edit/:id', isLoggedIn, async (req,res) => {
  //console.log(req.params.id);
  //res.send('RECIBIDO');
  const { id } = req.params;
  const link = await pool.query('SELECT * FROM links WHERE id=?', [id]);
  //console.log(link[0]);
  res.render('links/edit.hbs', {link: link[0]});

});

//para editar links pero no lo ocupo
router.post('/edit/:id', isLoggedIn, async (req,res) => {
  const { id } = req.params;
  const { title, description, url } = req.body;
  const newLink = {
    title,
    url,
    description
  };

  await pool.query('UPDATE links set ? WHERE id=?', [newLink, id]);
  req.flash('success', 'Link actualizado correctamente');
  res.redirect('/links');

});











module.exports = router; //export el modulo router para emplearlo desde otra parte con import
