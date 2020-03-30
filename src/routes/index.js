//PARA ALMACENAR LAS RUTAS PRINCIPALES DE LA APLICACION
//RUTAS PARA DAR LA BIENVENIDA, PARA CONTACTO, EL ACERCA DE, ETC. (LAS PAGIANS)

const express = require('express'); //lo creo para crear rutas
const router = express.Router(); //me devuelve un objeto y luego lo exporto

router.get('/', (req, res) => {
  //res.send('Hola MUNDO');
  res.render('index.hbs'); //renderizo index.hbs ubicado en raiz de la carpeta views
});

module.exports = router; //exporto el objeto para poder importarlo desde otro lado
