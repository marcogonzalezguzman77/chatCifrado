   
  function cifradoSustitucion(mensaje,llavePub){
  
    var mensaje_cifrado = "";
  
    var ALFABETO=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',' '];
  
    longitud_mensaje = mensaje.length;
  
    //console.log("posicion alfabeto "+ ALFABETO.indexOf('A'));
  
    for (i = 0; i < longitud_mensaje; i++) {
      //console.log(mensaje.substring(i,i+1));
      posicion = ALFABETO.indexOf(mensaje.substring(i,i+1));
      //console.log(posicion);
      nueva_posicion = (posicion + llavePub)%53;
      nueva_letra = ALFABETO[nueva_posicion];
      mensaje_cifrado = mensaje_cifrado + nueva_letra;
    }
    return mensaje_cifrado;
  }
  
  
  function descifradoSustitucion(mensajecifrado,llavePub){
  
    var mensaje_claro = "";
  
    var ALFABETO=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',' '];
  
    longitud_mensaje = mensajecifrado.length;
  
    //console.log("longitud mensaje",longitud_mensaje)
  
    //console.log("posicion alfabeto "+ ALFABETO.indexOf('A'));
  
    for (i = 0; i < longitud_mensaje; i++) {
      //console.log(mensajecifrado.substring(i,i+1));
      posicion = ALFABETO.indexOf(mensajecifrado.substring(i,i+1));
      //console.log("posicion ", posicion);
      nueva_posicion = (posicion - llavePub);
      if (nueva_posicion < 0){
        nueva_posicion = nueva_posicion + 53;
      }
      else{
        nueva_posicion = (posicion - llavePub)%53;
      }
      //console.log("nueva posicion ",nueva_posicion);
      nueva_letra = ALFABETO[nueva_posicion];
      mensaje_claro = mensaje_claro + nueva_letra;
    }
    return mensaje_claro;
  }
  