"use strict";
import { EntitySchema } from "typeorm";

const Piloto = new EntitySchema({
  name: "Piloto",
  tableName: "piloto",
  columns: {
    id_piloto: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    apellido: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    edad: {
      type: "int",
      nullable: false,
    },
    nacionalidad: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    rut: {
      type: "varchar",
      length: 15,
      nullable: false,
      unique: true,
    },
    fecha_registro: {
      type: "timestamp",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  indices: [
    {
      name: "IDX_PILOTO_RUT",
      columns: ["rut"],
      unique: true,
    },
  ],
});

export default Piloto;
