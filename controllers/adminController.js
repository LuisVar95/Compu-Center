import { unlink } from 'node:fs/promises'
import { check, validationResult} from 'express-validator'
import Categoria from '../models/Categoria.js'
import Producto from '../models/Producto.js';


//CATEGORIAS
const categorias = async (req, res) => {

    const categorias = await Categoria.findAll();

    res.render('admin/categorias', {
        pagina: 'categorias',
        categorias
    })
}

const categoria = async (req, res) => {

    const { id } = req.params;

    const categoria = await Categoria.findByPk(id)

    if(!categoria) {
        return res.redirect('/admin')
    }

    const productos = await Producto.findAll({ where: { categoriaId: id}});

    res.render('admin/categoria', {
        pagina: `categoria: ${categoria.nombre}`,
        categoria: categoria,
        productos: productos
    })
}

//PRODUCTOS

const formularioProducto = async (req, res) => {

    const categorias = await Categoria.findAll();
    
    res.render('admin/productos-crear', {
        pagina: 'Registra un producto',
        categorias: categorias,
    })
}

const crearProducto = async (req, res) => {

    //capturar el cuerpo de la solicitud
    const { nombre, precio, descripcion, categoriaId} = req.body;
    
    const { filename: imagen } = req.file;
    

    try {

        // Crear un nuevo producto
        const productoCreado = await Producto.create({
            nombre,
            precio,
            descripcion,
            categoriaId,
            imagen
        });
        
        const { categoriaId: id } = productoCreado

        res.redirect(`/admin/categoria/${id}`);

    } catch (error) {
        console.log(error)
    }
}

const formularioEditarProducto = async (req, res) => {

    const { id } = req.params;

    const producto = await Producto.findByPk(id);

    // Si no existe redirigimos
     if(!producto) {
        return res.redirect(`/admin`)
    }

    const {nombre} = producto

    const categorias = await Categoria.findAll();

    res.render('admin/productos-editar', {
        pagina: `Editar Producto: ${nombre}`,
        categorias: categorias,
        producto: producto
    })

}

const editarProducto = async (req, res) => {

    const { id } = req.params;

    const producto = await Producto.findByPk(id);

    // Si no existe redirigimos
    if(!producto) {
        return res.redirect('/admin')
    }

    try {

        const { nombre, precio, descripcion, categoriaId} = req.body;
        let imagen = req.file ? req.file.filename : producto.imagen;

        const productoEditado = producto.set({
            nombre,
            precio,
            descripcion,
            categoriaId,
            imagen
        })

        await producto.save();

        const { categoriaId: id } = productoEditado

        res.redirect(`/admin/categoria/${id}`);       
    } catch (error) {
        console.log(error)
    }
}

const eliminarProducto = async (req, res) => {

    const {id} = req.params;

    const producto = await Producto.findByPk(id)

    if (!producto) {
        res.redirect('/admin')
    }

    await unlink(`public/uploads/${producto.imagen}`)
    console.log(`Se elimino la imagen ${producto.imagen}`)

    await producto.destroy()
    res.redirect(`/admin/categoria/${producto.categoriaId}`)
}




export {
    categorias,
    categoria,
    formularioProducto,
    crearProducto,
    formularioEditarProducto,
    editarProducto,
    eliminarProducto
}