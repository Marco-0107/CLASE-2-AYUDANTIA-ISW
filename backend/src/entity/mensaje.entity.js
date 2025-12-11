"use strict";
import { EntitySchema } from "typeorm";

const MensajeSchema = new EntitySchema({
  name: "Mensaje",
  tableName: "mensajes",
  columns: {
    id_mensaje: {
      type: "int",
      primary: true,
      generated: true,
    },
    contenido: {
      type: "text",
      nullable: false,
    },
    tipo_usuario: {
      type: "varchar",
      length: 20,
      nullable: false,
      comment: "admin o piloto",
    },
    id_usuario: {
      type: "int",
      nullable: false,
    },
    id_piloto: {
      type: "int",
      nullable: true,
      comment: "ID del piloto con quien se está chateando (solo para mensajes admin)",
    },
    leido: {
      type: "boolean",
      default: false,
    },
    fecha_envio: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});

export default MensajeSchema;
