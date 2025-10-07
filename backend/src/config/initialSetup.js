"use strict";
import bcrypt from "bcryptjs";
import { AppDataSource } from "./configDb.js";
import User from "../entity/user.entity.js";

async function encryptPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const count = await userRepository.count();
    if (count > 0) return;

    const now = new Date();

    // Crear usuarios iniciales para el sistema de rally
    await Promise.all([
      userRepository.save(userRepository.create({
        nombre: "Admin",
        apellido: "Sistema",
        email: "admin@rally.com",
        password: await encryptPassword("admin123"),
        rol: "admin",
        estado_activo: true,
        fecha_registro: now,
      })),
      userRepository.save(userRepository.create({
        nombre: "Organizador",
        apellido: "Rally",
        email: "organizador@rally.com", 
        password: await encryptPassword("org123"),
        rol: "organizador",
        estado_activo: true,
        fecha_registro: now,
      })),
      userRepository.save(userRepository.create({
        nombre: "Usuario",
        apellido: "Demo",
        email: "usuario@rally.com",
        password: await encryptPassword("user123"),
        rol: "usuario",
        estado_activo: true,
        fecha_registro: now,
      })),
    ]);

    console.log("* => Usuarios creados exitosamente");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}
