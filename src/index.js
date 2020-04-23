const express = require('express');
const morgan = require('morgan'); //morgan muestra peticiones en cosola que van llegano
const exphbs = require('express-handlebars')//empleo plantillas con codigo-vistas html para enviar formularios
const path = require('path'); //muesstra ubicaciones de archivos y directorios
const flash = require('connect-flash'); //empleado para presentar mensajes despues de una operacion
const session = require('express-session'); //para guardar variables de sesiones
const MySQLStore  = require('express-mysql-session'); //para guardar variables de sesion en base de datos
const passport = require('passport'); //para hacer operaciones con contraseñas

const { database } = require('./keys'); //usuarios y contraseñas de la base de datos

//para trabajar con la base de datos
const pool = require('./database.js')

//inicialización
const app = express();
require('./lib/passport');


//settings
app.set('port', process.env.PORT || 4000); //defino el puerto para acceder al servidor

app.set('views', path.join(__dirname, 'views'))//para buscar la carpeta views ya que esta en el src y no en el inicio

app.engine('.hbs', exphbs({  //hbs es un motor de plantillas, engine template
  defaultLayout: 'main', //nombre de la plantilla principal dentro del folder layouts hay un archivo llamado main.hbs
  layoutsDir: path.join(app.get('views'), 'layouts'), //get obtiene la direccion de set, layouts esta dentro de views, aqui esta la vista principal main.hbs
  partialsDir: path.join(app.get('views'), 'partials'), // para colocoar pedazos de codigo en las vistas, chat disponible en multiples vistas, partials esta dentro de views, son vistas fijas, aqui estan la barra de navegacion y los mensajes, navigations.hbs y messages.hbs
  extname: '.hbs', //como termina la extension de handlebars
  helpers: require('./lib/handlebars') //para ejecutar funciones externas fuera de handlebars, aqui estan diversas funciones handelbars.js
})); //nombre plantilla, donde estaran las vistas, que extensiones, funciones

app.set('view engine', '.hbs'); //para llamar las vistas, esta es la llamada principal de handlebars


//middlewares funciones que se ejecutan cada vez que un usuario envia una peticion
//se ejecutan primero estas funciones y posteriormente las demas funciones
app.use(session({
  secret: 'marcomysqlnodesession',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}));
app.use(flash()); //para presentar mensajes
//app.use(morgan('dev')); //para ver mensajes en consola sobre peticiones
app.use(express.urlencoded({extended: true})); //para aceptar desde los formularios los datos que me envien los clientes
app.use(express.json()); //que se pueda emplear formato json en el codigo a emplear
app.use(passport.initialize()); 
app.use(passport.session());


//Variables globales
//se definen que variables pueden ser accedidas desde nuestra APLICACION
//podria poner una variable cuando quiera almacenar el nombre de mi aplicacion

app.use((req, res, next) => {
  app.locals.success = req.flash('success');
  app.locals.message = req.flash('message');
  app.locals.user = req.user;
  next();
}); //toma la informacion del usuario y  continua con el resto del codigo
//colocar variables accesibles desde cualquier parte

//var msg  = require('./public/js/funciones_socket'); //funciones para los sockets


//Rutas (urls de nuestro servidor)
//que se va a hacer cuando un usuario entre a la URL
//********ESTAS SON LAS RUTAS A LAS QUE INGRESA POR PRIMERA VEZ LA PAGINA CUANDO******/
//cuando el usuario entra a http://localhost:4000
//dentro de la carpeta routes estan las rutas donde se direcciona hacia las plantillas que se va accesar dependiedo de la ruta del URL
//por ejemplo http://localhost:/  entra index.hbs porque en index.js esta direccionado con el comando res.render('index.hbs');
app.use(require('./routes/index.js'));  //dentro de index.js .get('/') estoy renderizando index.hbs 'Lets get started', pagina inicial
app.use(require('./routes/authentication.js')); //.get('/signin')
app.use('/links',require('./routes/links.js')); //.get--> chat, add, edit, delete, CUANDO EN EL URL ES localhost:4000/links/add , localhost:4000/links/chat

//Public (codigo al cual el navegador de los clientes pueden acceder), archivos estaticos, static files
direccionImagenesUsuarios = 'views\\links\\imagenes';
//console.log(direccionImagenesUsuarios);
//console.log(path.join(__dirname,direccionImagenesUsuarios));
//console.log(path.join(__dirname,'views'));
//app.use(express.static(path.join(__dirname, '/views')));
//app.use(express.static(__dirname + '/views'));
app.use(express.static(path.join(__dirname, 'public')));


//CODIGO PARA INICIALIZAR LOS SOCKETS

//defino la constante server, que es el servidor empleando app=express(), app.set('port', process.env.PORT || 4000); 
const server = app.listen(app.get('port'), () => {
  console.log('Servidor en el puerto: ', app.get('port'));
});

const socketIo = require('socket.io');



//pero antes de iniciar el servicio de sockets, o bien cuando reinicio el servidor, o bien por alguna falla propia del servidor
//borro todas las conexiones existentes en la base de datos

borrarConexionesExistentes().then((result)=>{
  console.log("tabla conexiones borrada",result);
  const io = socketIo.listen(server); //socket necesita un servidor ya creado en este caso server
  require('./sockets.js')(io)
});

//inicio con los websockets, me pongo a la escucha con io.on y espero conexiones con ('connection');
//esta configuracion la puedo ver en el archivo socket.js, lo requiero y le mando el parametro (io), previamente creado


//en ese archivo se exporta una funcion donde dentro de sus parametros internos esta io.on('connection')

//para entender un poco mas
//el servidor de socket llamado (io) envia al cliente un archivo llamado socket.io.js
// lo podemos observar en la ruta http://localhost:4000/socket.io/socket.io.js
//lo anterior le permite al cliente comunicarse con el servidor
//asi que en el archivo main.hbs, mi plantilla principal que es el cliente, mando a llamar socket.io.js con el comando <script src="/socket.io/socket.io.js"></script>

//entonces tambien en main.hbs mando allamar  <script src="/js/funciones_socket.js"></script>, dentro de la cual, ya desde el cliente
//mando a llamar la funcio io(), la cual ya habia mandado desde el servidor con require(./sockets.js)(io), y la asigno a una constante
//socket = io()




async function borrarConexionesExistentes(){
  const respuesta="ok";
  const resultado = await pool.query('truncate tb_conexiones_general');
  //respuesta="ok";
 /* if (resultado){
    respuesta="ok";
  }*/
  return respuesta;
}