"use strict";
import { EntitySchema } from "typeorm";

const Vehiculo = new EntitySchema({
  name: "Vehiculo",
  tableName: "vehiculo",
  columns: {
    id_vehiculo: {
      type: "int",
      primary: true,
      generated: true,
    },
    patente: {
      type: "varchar",
      length: 10,
      nullable: false,
      unique: true,
    },
    marca: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    modelo: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    año: {
      type: "int",
      nullable: false,
    },
    id_piloto: {
      type: "int",
      nullable: true,
    },
    fecha_registro: {
      type: "timestamp",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    piloto: {
      type: "many-to-one",
      target: "Piloto",
      joinColumn: {
        name: "id_piloto",
      },
    },
  },
  indices: [
    {
      name: "IDX_VEHICULO_PATENTE",
      columns: ["patente"],
      unique: true,
    },
  ],
});

export default Vehiculo;
