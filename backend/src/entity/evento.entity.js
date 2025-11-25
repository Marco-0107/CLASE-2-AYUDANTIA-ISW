"use strict";
import { EntitySchema } from "typeorm";

const EventoSchema = new EntitySchema({
  name: "Evento",
  tableName: "eventos",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    titulo: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    descripcion: {
      type: "text",
      nullable: false,
    },
    fecha_evento: {
      type: "timestamp",
      nullable: false,
    },
    lugar: {
      type: "varchar",
      length: 200,
      nullable: false,
    },
    fecha_creacion: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
  },
});

export default EventoSchema;
