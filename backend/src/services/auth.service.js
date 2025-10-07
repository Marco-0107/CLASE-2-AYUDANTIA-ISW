"use strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import User from "../entity/user.entity.js";
import { JWT_SECRET } from "../config/configEnv.js";

export async function loginService(user) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const { email, password } = user;

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
      rol: userFound.rol
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
