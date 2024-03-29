import Categoria from "../models/Categoria.js"
import Producto from "../models/Producto.js";

const inicio = async (req, res) => {

    const categorias = await Categoria.findAll();

    res.render('pagina/inicio', {
        pagina: 'Categorias',
        categorias: categorias
    })
}

const categoriaProducto = async (req, res) => {

    const { id } = req.params;

    const categoria = await Categoria.findByPk(id)

    const productos = await Producto.findAll({ where: { categoriaId: id}});

    res.render('pagina/categoriaApp', {
        pagina: `Categoria: ${categoria.nombre}`,
        productos: productos

    })
}

export {
    inicio,
    categoriaProducto
}