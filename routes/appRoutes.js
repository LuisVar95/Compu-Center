import express from 'express'
import { inicio, categoriaProducto } from '../controllers/appController.js'

const router = express.Router()

// Pagina de inicio admin
router.get('/', inicio)
router.get('/categoriaApp/:id', categoriaProducto)

export default router;