"use strict";
import { EntitySchema } from "typeorm";

const User = new EntitySchema({
  name: "User",
  tableName: "usuario",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    apellido: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: false
    },
    rol: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "usuario"
    },
    estado_activo: {
      type: "boolean",
      nullable: false,
      default: true
    },
    fecha_registro: {
      type: "timestamp",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP"
    },
  },
  indices: [
    {
      name: "IDX_USER",
      columns: ["id"],
      unique: true,
    },
    {
      name: "IDX_USER_EMAIL",
      columns: ["email"],
      unique: true,
    },
  ],
});

export default User;
