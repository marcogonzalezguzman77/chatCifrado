//ESTE CODIGO SE CORRE CUANDO LA PAGINA DE main.hbs INICIA
let resultado="no";
let bandera=false;

function existeSesionCifradav1(receptor){
    resultado="no";
    bandera=false;
    var promiseObj = new Promise(function(resolve, reject){
       
        let sesiondbimport = import('./module.js').then((obj)=>{
            let db = obj.sesiondb("sesionesdb",{
                tb_sesiones_aceptadas: `++id,fk_usuario_emisor,fk_usuario_receptor,llavePub_emisor,llavePub_receptor`
                
            });
    
            /*
            let flag = obj.bulkcreate(db.tb_sesiones_aceptadas,{
                fk_usuario_emisor: "marcoglz",
                fk_usuario_receptor: "mateo",
                llavePub_emisor: 6,
                llavePub_receptor: 5
            })
            console.log(flag);
            */
        
            obj.getData(db.tb_sesiones_aceptadas, (data,index)=>{
                console.log("data ", data, index);
              
                //for (const value in data) {
                    if (data.fk_usuario_receptor==receptor){
                        resultado = "si";                        
                        resolve(resultado);                                               
                    }else{
                        reject();
                    }
                    
                    //console.log("resultado adentro ", resultado);
                   
                //}
            });               
        }); //final sesiondbimport
     
  });
  return promiseObj;
  }




/*
    let sesiondbimport = await import('./module.js');
  

    let db = sesiondbimport.sesiondb("sesionesdb",{
        tb_sesiones_aceptadas: `++id,fk_usuario_emisor,fk_usuario_receptor,llavePub_emisor,llavePub_receptor`
    });

    sesiondbimport.getData(db.tb_sesiones_aceptadas, (data,index) => {
        console.log(data);
        for (const value in data) {            
            resultado = data[value];
        }
    });
    
    return resultado;
*/


/*
async function cargarIndexedDB(){
    let sesiondbimport = await import('./module.js');

    //let {bulkcreate, getData, createEle, Sortobj} = import ('./module.js');

    let db = sesiondbimport.sesiondb("sesionesdb",{
        tb_sesiones_aceptadas: `++id,fk_usuario_emisor,fk_usuario_receptor,llavePub_emisor,llavePub_receptor`
    });




}*/

/*
async function existeSesionCifradav1(){
    
    let sesiondbimport = await import('./module.js').then((obj)=>{
        let db = obj.sesiondb("sesionesdb",{
            tb_sesiones_aceptadas: `++id,fk_usuario_emisor,fk_usuario_receptor,llavePub_emisor,llavePub_receptor`
            
        });

           obj.getData(db.tb_sesiones_aceptadas, (data,index)=>{
            console.log(data);
            //userid.value = data.id + 1 || 1;
            for (const value in data) {
                resultado = data[value];
            // console.log(resultado);
            }
            //console.log(resultado);
            //return resultado;
        });
        //console.log(datosSesionCifrada);

    }); //final sesiondbimport
    return resultado;
}*/
