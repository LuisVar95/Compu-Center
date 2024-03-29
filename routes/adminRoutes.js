import express from 'express'
import { categorias, categoria, formularioProducto, crearProducto, formularioEditarProducto, editarProducto, eliminarProducto} from '../controllers/adminController.js'
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const router = express.Router()

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function(req, file, cb){
        cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
    if(tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

let upload = multer({ storage, fileFilter})

// Pagina de inicio admin
router.get('/', categorias)
router.get('/categoria/:id', categoria)
router.get('/productos', formularioProducto)
router.post('/productos', upload.single('imagen'), crearProducto)
router.get('/productos/editar/:id', formularioEditarProducto)
router.post('/productos/editar/:id', upload.single('imagen'), editarProducto)
router.post('/productos/eliminar/:id', eliminarProducto)

export default router;