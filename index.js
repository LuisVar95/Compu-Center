import express from 'express'

import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import appRoutes from './routes/appRoutes.js'

import db from './config/db.js';

// Crear la app
const app = express()

// Habilitar la lectura de datos de formulario
app.use( express.urlencoded({extended: true}))

// Habilitar Cookie Parser
app.use( cookieParser())



// Conexion a la base de datos 
try {
    await db.authenticate();
    db.sync()
    console.log('Conexion Correcta a la base de datos')
} catch (error) {
    console.log(error)
}

//Habilitar Pug
app.set('view engine', 'pug')
app.set('views','./views' )

// Carpeta Publica
app.use( express.static('public'));
app.use( express.static('build'))

//Routing
app.use('/auth', usuarioRoutes)
app.use('/admin', adminRoutes)
app.use('/', appRoutes)


// Definir un puerto y arrancar el proyecto
const port = 3000;
app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})