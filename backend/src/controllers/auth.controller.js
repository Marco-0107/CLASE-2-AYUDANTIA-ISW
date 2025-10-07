"use strict";
import { loginService, registerService } from "../services/auth.service.js";
import { authValidation, registerValidation } from "../validations/auth.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function login(req, res) {
  try {
    const { body } = req;

    const { error } = authValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Datos de entrada inválidos", error.message);
    }

    const [result, errorLogin] = await loginService(body);

    if (errorLogin) {
      return handleErrorClient(res, 401, "Error de autenticación", errorLogin);
    }

    const { user, accessToken } = result;

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    handleSuccess(res, 200, "Inicio de sesión exitoso", { user });
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

export async function register(req, res) {
  try {
    const { body } = req;

    const { error } = registerValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Datos de entrada inválidos", error.message);
    }

    const [user, errorRegister] = await registerService(body);

    if (errorRegister) {
      return handleErrorClient(res, 400, "Error al registrar usuario", errorRegister);
    }

    handleSuccess(res, 201, "Usuario registrado exitosamente", user);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    handleSuccess(res, 200, "Sesión cerrada exitosamente");
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}
