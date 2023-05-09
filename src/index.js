const express = require('express');
const { restart } = require('nodemon');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const crypto = require('crypto');
const { Client } = require('pg');



//Zona de la base de datos
//Creamos la constante donde se guarda la conexion a la base de datos
var client = new Client({
  user: 'user_dev',
  host: '74.208.24.181',
  database: 'td-image',
  password: '90Y9B8yh$45',
  port: 5432 // Puerto por defecto de PostgreSQL
});

//Para crear la tabla de la base de datos
/*
client.connect();
const queryText = `
CREATE TABLE Imagenes (
  idPeticion SERIAL PRIMARY KEY,
  ipPeticion Varchar(40),
  path Varchar(255),
  tipoArchivo varchar(10),
  peso int,
  peticionValida boolean
);
`;
client.query(queryText)
  .then(() => console.log('Tabla creada exitosamente'))
  .catch(error => console.error('Error al crear tabla:', error))
  .finally(() => client.end());
*/

/*
client.connect();
const queryText = `
DROP  TABLE imagenes;
`;
client.query(queryText)
  .then(() => console.log('Tabla eliminada exitosamente'))
  .catch(error => console.error('Error al borrar tabla:', error))
  .finally(() => client.end());
*/

  //Haseado mamalon
// const message = 'Hello, world!';
// const secret = 'my_secret_key';

// const hmac = crypto.createHmac('sha256', secret);
// hmac.update(message);
// const digest = hmac.digest('hex');

// console.log(digest);


//Inicializamos el framework
const app = express();

//Para configurar el puerto
app.set('port',4000);

//Middleware
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: function (req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname).toLocaleLowerCase());
      }
});

//Multer
app.use(multer({
    storage: storage,
    dest: path.join(__dirname, 'public/uploads'),
    limits: {fileSize: 2097152},
    fileFilter: (req,file,cb) => {
        const filetype = /jpeg|jpg|png|gif/;
        const mimetype = filetype.test(file.mimetype);
        const extname = filetype.test(path.extname(file.originalname));
        if(mimetype && extname){
            return cb(null,true);
        }
        cb("Error: El archivo de ser una imagen");
    }
}).single('imagens')
);

//Rotutes


app.post('/upload', async (req,res) => {
    //Convirtiendo las variables  del hash
    var message = req.file.originalname + req.body.numeroaleatorio;
    
    //Haseado mamalon
  const secret = 'YrekcBMw2d8KI0gJL@I2cs#ng3UFIW';

  var hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  var digest = hmac.digest('hex');

  var body1 = req.body.hash

  var ip = req.connection.remoteAddress;
  //Obtenemos el tipo de archivo
  var tipoArchivo = path.extname(req.file.originalname).toLocaleLowerCase();
  //Obtenemos el peso
  var peso = parseInt(req.file.size);
  var path1 = req.file.path; 
  var esValido = false;
  var queryInsertar = "";

  if(digest != body1){
    //Abrimos la conexion
    queryInsertar = `INSERT INTO imagenes (ippeticion, path, tipoarchivo, peso, peticionValida) VALUES ($1, $2, $3, $4, $5); `;
    path1 = null;
    tipoArchivo = null;
    peso = null;    
  }
  else{
    queryInsertar = `INSERT INTO imagenes (ippeticion, path, tipoarchivo, peso, peticionValida) VALUES ($1, $2, $3, $4, $5);`;    
    esValido = true;
  }
  client.connect();
  await client.query(queryInsertar, [ip, path1, tipoArchivo, peso, esValido])
    .then(() => console.log('Dato insertado exitosamente'))
    .catch(error => console.error('Error al insertar dato:', error))

  queryInsertar = `SELECT * FROM imagenes;`;
  var algo = {};
  await client.query(queryInsertar)
  .then((data) =>    {
    algo = data;
  })
  .catch(error => 
    console.error('Error al insertar dato:', error)
    )
  .finally(() => 
    client.end()
    );

    res.send(algo);
})


//Static Files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), () => {
    console.log(`Servidor conectado en el puerto ${app.get('port')}`);
});