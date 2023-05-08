const express = require('express');
const { restart } = require('nodemon');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const crypto = require('crypto');
const { Client } = require('pg');



//Zona de la base de datos
//Creamos la constante donde se guarda la conexion a la base de datos
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'D@sarfire13',
  port: 5432 // Puerto por defecto de PostgreSQL
});


/*
client.connect();
const queryText = `
CREATE TABLE Imagenes (
  idPeticion SERIAL PRIMARY KEY,
  ipPeticion Varchar(40),
  peticionEstatus boolean,
  peso int,
  path Varchar(255)
);
`;
client.query(queryText)
  .then(() => console.log('Tabla creada exitosamente'))
  .catch(error => console.error('Error al crear tabla:', error))
  .finally(() => client.end());
*/

//Haseado mamalon
const message = 'Hello, world!';
const secret = 'my_secret_key';

const hmac = crypto.createHmac('sha256', secret);
hmac.update(message);
const digest = hmac.digest('hex');

console.log(digest);


//Inicializamos el framework
const app = express();

//Para configurar el puerto
app.set('port',4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


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
app.get('/', (req,res) => {
    res.render('index');
} )

app.post('/upload', (req,res)=>{
  client.connect();

  const ip = req.connection.remoteAddress;
  console.log(ip);

  const queryInsertar = `
  INSERT INTO users (name, email)
  VALUES (12, 'juan@example.com');
`;
client.query(queryInsertar)
  .then(() => console.log('Dato insertado exitosamente'))
  .catch(error => console.error('Error al insertar dato:', error))
  .finally(() => client.end());
  console.log(req.file);
  console.log(req.file.originalname);
  console.log(req.file.path);
  res.send('uploaded');
})

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), () => {
    console.log(`Servidor conectado en el puerto ${app.get('port')}`);
});