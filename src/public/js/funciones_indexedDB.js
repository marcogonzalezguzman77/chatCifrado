
async function existeSesionCifradaDispositivo(emisor,receptor){
    resultado = "";    
    const db= new Dexie("sesionesdb");
    table={tb_sesiones_aceptadas: `++id,fk_usuario_emisor,fk_usuario_receptor,llavePub_emisor,llavePub_receptor`};
    db.version(1).stores(table);
    db.open();

   /* db.tb_sesiones_aceptadas.add({fk_usuario_emisor: "marcoglz", fk_usuario_receptor: "jess", llavePub_emisor: 6, llavePub_receptor: 5});
    db.tb_sesiones_aceptadas.add({fk_usuario_emisor: "marcoglz", fk_usuario_receptor: "mateo", llavePub_emisor: 7, llavePub_receptor: 8});
*/
    await db.tb_sesiones_aceptadas
        .where('fk_usuario_receptor').startsWithIgnoreCase(receptor).toArray(function(a) {
            resultado = a.length; 
            //console.log(resultado);
        });
    return resultado;
}

async function almacenarMensajesInicialesDispositivo(emisor,receptor,mensaje){
    resultado = "";    
    const db= new Dexie("mensajesdb");
    table={tb_mensajes_iniciales: `++id,fk_usuario_emisor,fk_usuario_receptor,mensaje`};
    db.version(1).stores(table);
    db.open();

    await db.tb_mensajes_iniciales.add({fk_usuario_emisor: emisor, fk_usuario_receptor: receptor, mensaje: mensaje});
    //await db.tb_mensajes_iniciales.add({fk_usuario_emisor: emisor, fk_usuario_receptor: receptor, mensaje: mensaje});
    console.log('mensajes guardados en dispositivo');
    //return resultado;
}