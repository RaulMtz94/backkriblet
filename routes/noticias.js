var express = require('express');
var app = express();
var Noticia = require('../models/noticias');
const fetch = require("node-fetch");
var http = require('http');

//require("jsdom").jsdom;
//Rutas
app.get('/', (req , res , next) =>{
    let Parser = require('rss-parser');
    let parser = new Parser({
        customFields : {
            item : [
                'media:content' , 'media:content' , {keepArray:true},
            ]
        }
    });
    //INICIO DEL FETCH




    //FIN DEL FETCH
    (async () => {
     
      let feed = await parser.parseURL('http://rss.nytimes.com/services/xml/rss/nyt/World.xml');
    
     //-------------------------------------------------------
     let s = '$';
     
      feed.items.forEach(item => {
          var img;
          if(item['media:content']){
             
            //console.log('');
            img = item['media:content'][s].url;
              
          }else{
              //console.log('No tiene');
              img = 'http://vollrath.com/ClientCss/images/VollrathImages/No_Image_Available.jpg';
          }
            
          var noticia = new Noticia({
            titulo : item.title,
            link : item.link,
            likes : 0,
            description : item.content,
            pubDate : item.pubDate,
            img : img
          });

            Noticia.findOne({ 'titulo': item.title }, function (err, nt) {
            if (err) return handleError(err);
               // console.log('Repetida');
                //console.log(noticia);
                if(nt){
                   
                }else{
                    noticia.save(function (err) {
                        if (err) return handleError(err);
                        // saved!
                    })
                }
            });

          

      });
      
        //RESPONSE
        res.status(200).json({
            ok : true ,
            mensaje : 'Peticion Realizada Correctamente',
        });
    })();
});

app.get('/notice', (req , res , next) =>{

    
    Noticia.find({  } )
        
        .exec(
         (err, noticia) => {
        if (err) {
           return res.status(500).json({
                ok : false ,
                mensaje : 'Error cargando noticias',
                errors: err
            });
        }
            res.status(200).json({
                ok : true ,
                mensaje : 'Noticias',
                noticias : noticia,
               
            });
       
       
    })
});
//-----------------------------------------------------
app.put ('/update/:numero',(req , res) => {
    var numero = req.params.numero;
    var body  = req.body;
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
             if(likeGuardado){
                
                res.status(201).json({
                    ok : true ,
                     like:likeGuardado 
                });
             } 
        }); 
    });
    
});

//---------------------------------------------------------------

module.exports = app;