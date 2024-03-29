import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Usuario from "../models/Usuario.js"
import { generarId, generarJWT } from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword  } from '../helpers/emails.js'

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesion',
    })
}

const autenticar = async (req, res) => {

    await check('email').isEmail().withMessage('El email es Obligatorio').run(req)
    await check('password').notEmpty().withMessage('El password es Obligaotorio').run(req)

    let resultado = validationResult(req)
    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Errores 
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            errores: resultado.array()
        })
    }

    const {email, password } = req.body
    const usuario = await Usuario.findOne({ where: { email }})
    if(!usuario){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            errores: [{msg: 'El Usuario No Existe'}]
        })
    }

    if(!usuario.confirmado){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            errores: [{msg: 'Tu Cuenta no ha sido confirmada'}]
        })
    }

    // Revisar el password 
    if(!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            errores : [{msg: 'El Password es Incorrecto'}]
        })
    }

    // Autenticar el usuario

    const token = generarJWT({ id: usuario.id, nombre: usuario.nombre })

    console.log(token)

    // Almacenar en un cookie
    const isAdmin = usuario.admin === 1;

    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true,
        // sameSite: true
    }).redirect(isAdmin ? '/admin' : '/')
}

const cerrarSesion = async (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
    })
}

const registrar = async (req, res) => {
    
    // validacion 
    await check('nombre').notEmpty().withMessage('El Nombre no puede ir vacio').run(req)
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    await check('password').isLength({ min: 6 }).withMessage('El password debe ser al menos 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los passwords no son iguales').run(req)

    let resultado = validationResult(req)
    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Errores 
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //Extraer los datos
    const {nombre, email, password } = req.body

    // Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({ where : { email : req.body.email }})
    if(existeUsuario){
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{msg: 'El Usuario ya esta Registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    // Envia email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // Mostrar mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos Enviado un Email de Confirmacion, presiona en el enlace'
    })
}

const confirmar = async (req, res) => {
    
    const { token } = req.params;

    // Verificar si el token es valido
    const usuario = await Usuario.findOne({ where: {token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    //Confirmar La cuenta 
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save()

    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmo Correctamente'
    })

}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Compu-Center',
    })
}

const resetPassword = async (req, res) => {

    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
 
    let resultado = validationResult(req)
    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Errores 
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Compu-Center',
            errores: resultado.array()
        })
    }

    // Buscar el usuario 

    const { email } = req.body

    const usuario = await Usuario.findOne({ where: { email}})
    if(!usuario){
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Compu-Center',
            errores: [{msg: 'El Email no Pertenece a ningun usuario'}]
        })
    }

    usuario.token = generarId();
    await usuario.save();

    //Enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    // Renderizar un mensaje
    res.render('templates/mensaje', {
        pagina: 'Restablece tu Password',
        mensaje: 'Hemos enviado un email con las instrucciones'
    })

}


const comprobarToken = async (req, res) => {

    const { token } = req.params;

    const usuario = await Usuario.findOne({where: {token}})
    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Restablece tu Password',
            mensaje: 'Hubo un error al validar tu informacion, intenta de nuevo',
            error : true
        })
    }

    // Mostrar formulario para modificar el password
    res.render('auth/reset-password', {
        pagina: 'Restablece Tu Password',
    })
}

const nuevoPassword = async (req, res) => {

    // Validar el password
    await check('password').isLength({ min: 6 }).withMessage('El password debe de ser al menos de 6 caracteres').run(req)
    let resultado = validationResult(req)

    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        return res.render('auth/reset-password', {
            pagina: 'Restablece tu Password',
            errores: resultado.array()
        })
    }

    const { token } = req.params
    const { password } = req.body;

    // Identificar quien hace el cambio 
    const usuario = await Usuario.findOne({where: {token}})
    
    // Hashear el nuevo password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash( password, salt)
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Restablecido', 
        mensaje: 'El password se guardo correctamente'
    })
}


export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}