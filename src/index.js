"use strict";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import indexRoutes from "./routes/index.routes.js";
import session from "express-session";
import passport from "passport";
import express, { json, urlencoded } from "express";
import { cookieKey, HOST, PORT } from "./config/configEnv.js";
import { connectDB } from "./config/configDb.js";
import { createUsers } from "./config/initialSetup.js";
import { passportJwtSetup } from "./auth/passport.auth.js";

async function setupServer() {
  try {
    const app = express();

    app.disable("x-powered-by");

    app.use(cors({ 
      credentials: true, 
      origin: true 
    }));
    
    app.use(urlencoded({ extended: true, limit: "1mb" }));
    app.use(json({ limit: "1mb" }));
    app.use(cookieParser());
    app.use(morgan("dev"));

    app.use(
      session({
        secret: cookieKey,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false,
          httpOnly: true,
          sameSite: "strict",
        },
      }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    passportJwtSetup();
    
    // Ruta de salud del servidor
    app.get("/", (req, res) => {
      res.json({
        message: "¡Servidor de Rally funcionando correctamente!",
        version: "1.0.0",
        endpoints: {
          auth: "/api/auth",
          pilotos: "/api/pilotos", 
          vehiculos: "/api/vehiculos"
        }
      });
    });

    app.use("/api", indexRoutes);

    app.listen(PORT, () => {
      console.log(`=> Servidor corriendo en http://${HOST}:${PORT}`);
      console.log(`=> API disponible en http://${HOST}:${PORT}/api`);
    });
  } catch (error) {
    console.log("Error en setupServer():", error);
  }
}

async function setupAPI() {
  try {
    console.log("Iniciando servidor de Rally...");
    await connectDB();
    await createUsers();
    await setupServer();
  } catch (error) {
    console.log("Error en setupAPI():", error);
  }
}

setupAPI()
  .then(() => console.log("API de Rally iniciada exitosamente"))
  .catch((error) =>
    console.log("Error al iniciar la API:", error),
  );
