//Requires importacion de librerias
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const  cron = require("node-cron");
const fs = require("fs");
const fetch = require("node-fetch");
const Pusher = require("pusher");
const socketIo = require('socket.io');
const http = require('http');
require("dotenv").config();
var Noticia = require('./models/noticias');

//---------------------------------
 

//inicializar variables
var app = express();
//Habilitando CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods" , "POST, GET, PUT, DELETE, OPTIONS");
    next();
  });

//Body parser
app.use(bodyParser.urlencoded({extended : false}))
app.use(bodyParser.json())

//importe de rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var noticiasRoutes = require('./routes/noticias');



//CONEXION A LA BASE DE DATOS
mongoose.connection.openUri('mongodb://raul:raulmtz1@ds131954.mlab.com:31954/kriblet' , (err , res)=>{
    if(err) throw err;
    console.log('Base de datos MongoDB : \x1b[32m%s\x1b[0m' , 'Online');   
});

//Rutas
app.use('/usuario' , usuarioRoutes);
app.use('/login' , loginRoutes);
app.use('/noticias' , noticiasRoutes);

app.use('/' , appRoutes);



//Escuchar peticiones
//-----------------------------------------------------


//---------------------------------------------------------------

//TAREA PROGRAMADA 
//-----------------------------------------------------------------

cron.schedule("* * * * *", function() {
    console.log("running a task every minute");
    (async () => {
        const fetchResult = await fetch('http://localhost:3000/noticias')
        const data = await fetchResult.text();
        return data;
    })()
  });

//----------------------------------------

//--------------
const server = http.Server(app);

server.listen(process.env.PORT || 3000 , () => {
    console.log('Express server puerto 3000 : \x1b[32m%s\x1b[0m' , 'Online');
});

//----------------------------------------------------------------
app.put ('/update/:numero',(req , res) => {
    var numero = req.params.numero;
    var body  = req.body;
    const io = socketIo(server);
    //console.log(body);
    Noticia.findOne({_id:body._id} , (err , state)=>{
        if (err) {
            return res.status(500).json({
                 ok : false ,
                 mensaje : 'Error al buscar usuario',
                 errors: err
             });
         }
        state.likes = state.likes + 1;
        state.save( (err , likeGuardado) =>{
            if (err) {
                return res.status(400).json({
                     ok : false ,
                     mensaje : 'Like Hecho',
                     errors: err
                 });
             }
            io.on('connection' , (socket) =>{
                socket.emit('hola' , {
                    hola : likeGuardado.likes
                })
            });
             if(likeGuardado){

                res.status(201).json({
                    ok : true ,
                     like:likeGuardado 
                });
             } 
        }); 
    });
    
});