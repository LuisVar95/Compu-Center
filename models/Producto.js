import { DataTypes, STRING } from "sequelize";
import db from "../config/db.js";
import Categoria from "./Categoria.js";

const Producto = db.define('productos', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precio: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    categoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Categoria,
            key: 'id'
        }
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: false
})

Producto.belongsTo(Categoria, { foreignKey: 'categoriaId'});

export default Producto;