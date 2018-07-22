var express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser')

var app = express()

//configuration du body-parser pour supporter les JSON et url encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// moteur de template ejs
app.set('view engine','ejs')

// Designer le dossier public comme static,
// ce qui permet d'accéder aux différents fichiers qui existent dans ce dossier
app.use(express.static('public'))

/// configuration du module session
app.use(session({
    secret: 'keyboard cat', // code de cryptage
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))

//récupération de la connexion à la base de données 
var connection = require('./config/db')


app.get('/login', (req,resp) => {        
        resp.render('login');
})

app.post('/login', (req,resp) => {        
   if(req.method=='POST'){
      connection.query('SELECT * from user where email= ? and password = ?',[req.body.email, req.body.password] , function (error, results) {
        if (error) throw error;
        if(results.length > 0 )  {
            req.session.iduser=results[0].id
            req.session.nom=results[0].nom
            resp.redirect('/')
        }  else
        resp.redirect('/login')
      }); 
   }
    
})

app.get('/logout',(req, resp) => {
    req.session.destroy ( () =>{
        resp.redirect('/login')
    } )
})

app.get('/', (req,resp) => {
    connection.query('SELECT * from produit', function (error, results) {
        if (error) throw error;        
        resp.locals.user= req.session.nom; // pour que cette variable peut etre utilser dans ejs        
        resp.render('index',{'produits':results});
      }); 
})

app.get('/ajouter', (req,resp) => {
    resp.locals.user= req.session.nom
    resp.render('ajouter');
})

app.get('/delete/:id', (request, response) => {
    connection.query('delete from produit where id = ? ', [request.params.id] , (error, results) => {
        if (error) throw error;
        console.log("Produit supprimé avec succès ")        
        response.redirect('/' )
    })    
})

app.post('/addproduit', (req,resp) => {

    if(req.method=="POST"){       
        var data = req.body  // récupérer le body de la requête envoyée     
        connection.query('insert into produit values (null, ? , ? , ?) ', [data.lib, data.prix, data.qte ] , (error, results) => {
           if (error) throw error;          
           resp.redirect('/')
         }) 
    }

})


app.listen(3000)


