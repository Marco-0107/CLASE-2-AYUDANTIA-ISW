"use strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import User from "../entity/user.entity.js";
import Piloto from "../entity/piloto.entity.js";
import { JWT_SECRET } from "../config/configEnv.js";

// Función auxiliar para detectar si es un RUT
function esRUT(str) {
  // Formato: 12345678-9 o 12.345.678-9
  const rutPattern = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/;
  return rutPattern.test(str);
}

export async function loginService(user) {
  try {
    const { email, password } = user;

    // Detectar si es un RUT (login de piloto)
    if (esRUT(email)) {
      return await loginPilotoService(email);
    }

    // Login normal de usuario
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: { email }
    });

    if (!userFound) {
      return [null, "El usuario no existe"];
    }

    if (!userFound.estado_activo) {
      return [null, "El usuario está inactivo"];
    }

    const isPasswordCorrect = await bcrypt.compare(password, userFound.password);

    if (!isPasswordCorrect) {
      return [null, "La contraseña es incorrecta"];
    }

    const payload = {
      id: userFound.id,
      email: userFound.email,
      rol: userFound.rol,
      nombre: userFound.nombre,
      apellido: userFound.apellido
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1d",
    });

    return [{ user: payload, accessToken }, null];
  } catch (error) {
    console.error("Error en loginService:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Login específico para pilotos usando solo RUT
 */
export async function loginPilotoService(rut) {
  try {
    const pilotoRepository = AppDataSource.getRepository(Piloto);

    const piloto = await pilotoRepository.findOne({
      where: { rut }
    });

    if (!piloto) {
      return [null, "No existe un piloto con este RUT"];
    }    const payload = {
      id: piloto.id_piloto,
      id_piloto: piloto.id_piloto,
      email: rut, // Usar RUT como email
      rol: "piloto",
      nombre: piloto.nombre,
      apellido: piloto.apellido,
      rut: piloto.rut,
      edad: piloto.edad,
      nacionalidad: piloto.nacionalidad,
      es_piloto: true
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1d",
    });

    return [{ user: payload, accessToken }, null];
  } catch (error) {
    console.error("Error en loginPilotoService:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function registerService(user) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const { nombre, apellido, email, password } = user;

    const existingUser = await userRepository.findOne({
      where: { email }
    });

    if (existingUser) {
      return [null, "Ya existe un usuario con este email"];
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      rol: "usuario",
      estado_activo: true,
      fecha_registro: new Date()
    });

    await userRepository.save(newUser);

    const userResponse = {
      id: newUser.id,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      email: newUser.email,
      rol: newUser.rol
    };

    return [userResponse, null];
  } catch (error) {
    console.error("Error en registerService:", error);
    return [null, "Error interno del servidor"];
  }
}
