export function sesiondb(dbname,table) {
    //create database
    const db= new Dexie(dbname);
    db.version(1).stores(table);
    db.open();
    /*
    const db = new Dexie('myDB');
    db.version(1).stores({
        friends: `name,age`
    })
    */
    return db;
}

//Get data from database
export function getData(dbname, fn) {
    let index = 0;
    let obj = {};
     dbname.count((count)=>{
        console.log("count ", count);
       if(count){
           dbname.each(table=>{
               console.log("table ",table);
               obj = Sortobj(table);
               console.log("obj ",obj);
               fn(obj, index++);
           });
       }else{
           fn(0);
       }
    })
}

//sort object
export function Sortobj(sortobj){
    let obj = {};
    obj = {
        id: sortobj.id,
        fk_usuario_emisor: sortobj.fk_usuario_emisor,
        fk_usuario_receptor: sortobj.fk_usuario_receptor,
        llavePub_emisor: sortobj.llavePub_emisor,
        llavePub_receptor: sortobj.llavePub_receptor
    }
    return obj;
}

export function bulkcreate (dbtable,data) {
    //let flag=empty(data);
    let flag=true;
    if(flag){
        dbtable.bulkAdd([data]);
        console.log("data inserted susscessfully...!");
    }else{
        console.log("Please provide data");
    }
    return flag;
  }


/*
//insert function
const bulkcreate = (dbtable,data) => {
  let flag=empty(data);
  if(flag){
      dbtable.bulkAdd([data]);
      console.log("data inserted susscessfully...!");
  }else{
      console.log("Please provide data");
  }
  return flag;
}

//create dynamic elements
const createEle = (tagname,appendTo,fn) =>{
    const element = document.createElement(tagname);
    if(appendTo) appendTo.appendChild(element);
    if(fn) fn(element);

};


//check textbox validation
const empty = object => {
    let flag = false;
    for (const value in object){
        if(object[value] != "" && object.hasOwnProperty(value)){
            flag=true;
        }else{
            flag=false;
        }
    }
    return flag;
}

//Get data from database
const getData = (dbname, fn)=>{
    let index = 0;
    let obj = {};
    dbname.count((count)=>{
       // console.log(count);
       if(count){
           dbname.each(table=>{
               //console.log(table);
               obj = Sortobj(table);
               //console.log(obj);
               fn(obj, index++);
           });
       }else{
           fn(0);
       }
    })
}

//sort object
const Sortobj = sortobj =>{
    let obj = {};
    obj = {
        id: sortobj.id,
        name: sortobj.name,
        seller: sortobj.seller,
        price: sortobj.price
    }
    return obj;
}

/*
export default sesiondb;
export {
    bulkcreate,
    getData,
    createEle,
    Sortobj
}*/