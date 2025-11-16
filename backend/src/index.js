"use strict";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import indexRoutes from "./routes/index.routes.js";
import session from "express-session";
import passport from "passport";
import express, { json, urlencoded } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { cookieKey, HOST, PORT } from "./config/configEnv.js";
import { connectDB } from "./config/configDb.js";
import { createUsers } from "./config/initialSetup.js";
import { passportJwtSetup } from "./auth/passport.auth.js";
import { saveMensajeService } from "./services/chat.service.js";

async function setupServer() {
  try {
    const app = express();
    const httpServer = createServer(app);
    
    // Configurar Socket.IO
    const io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:443",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    app.disable("x-powered-by");

    app.use(cors({ 
      credentials: true, 
      origin: true 
    }));

    // Servir archivos estáticos subidos ANTES de middlewares de caché
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsPath = path.resolve(__dirname, '../../uploads');
    try {
      if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
      console.log('=> Carpeta uploads (static):', uploadsPath);
    } catch (err) {
      console.error('No se pudo crear uploads dir:', err);
    }
    app.use('/uploads', express.static(uploadsPath));

    // Middleware para desactivar caché (excepto /uploads)
    app.use((req, res, next) => {
      if (!req.path.startsWith('/uploads')) {
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'ETag': false
        });
      }
      next();
    });
    
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
          vehiculos: "/api/vehiculos",
          chat: "/api/chat"
        }
      });
    });app.use("/api", indexRoutes);

    // Configurar eventos de Socket.IO
    io.on("connection", (socket) => {
      console.log(`[Socket.IO] Usuario conectado: ${socket.id}`);

      // Usuario se une a una sala (admin o piloto)
      socket.on("join-room", (data) => {
        const { userId, userType, pilotoId } = data;
        const room = userType === "admin" ? `admin-${userId}` : `piloto-${pilotoId}`;
        socket.join(room);
        console.log(`[Socket.IO] Usuario ${userId} (${userType}) se unio a la sala: ${room}`);
      });

      // Enviar mensaje
      socket.on("send-message", async (data) => {
        try {
          const { contenido, tipo_usuario, id_usuario, id_piloto } = data;

          console.log(`[Chat] Enviando mensaje de ${tipo_usuario} (${id_usuario}) a piloto ${id_piloto}`);

          // Guardar mensaje en BD
          const [mensaje, error] = await saveMensajeService({
            contenido,
            tipo_usuario,
            id_usuario,
            id_piloto,
          });

          if (error) {
            console.error('[Chat] Error al guardar mensaje:', error);
            socket.emit("error", { message: "Error al guardar mensaje" });
            return;
          }

          console.log('[Chat] Mensaje guardado en BD con ID:', mensaje.id_mensaje);

          // Emitir mensaje a ambas partes
          if (tipo_usuario === "admin") {
            // Enviar al piloto
            io.to(`piloto-${id_piloto}`).emit("receive-message", mensaje);
            console.log(`[Chat] Mensaje enviado a sala piloto-${id_piloto}`);
            
            // Enviar confirmación al admin (para que vea su propio mensaje)
            socket.emit("receive-message", mensaje);
            console.log(`[Chat] Confirmacion enviada al admin`);
          } else {
            // Enviar al admin (cuando el piloto responda)
            const adminId = data.idAdmin || 1; // Por defecto admin con id 1
            io.to(`admin-${adminId}`).emit("receive-message", mensaje);
            console.log(`[Chat] Mensaje enviado a sala admin-${adminId}`);
            
            // Enviar confirmación al piloto
            socket.emit("receive-message", mensaje);
            console.log(`[Chat] Confirmacion enviada al piloto`);
          }
        } catch (err) {
          console.error("[Chat] Error al enviar mensaje:", err);
          socket.emit("error", { message: "Error al enviar mensaje" });
        }
      });

      // Usuario escribe (typing indicator)
      socket.on("typing", (data) => {
        const { tipo_usuario, id_piloto, idAdmin } = data;
        if (tipo_usuario === "admin") {
          io.to(`piloto-${id_piloto}`).emit("user-typing", { tipo_usuario: "admin" });
        } else {
          io.to(`admin-${idAdmin}`).emit("user-typing", { tipo_usuario: "piloto" });
        }
      });

      socket.on("disconnect", () => {
        console.log(`[Socket.IO] Usuario desconectado: ${socket.id}`);
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`=> Servidor corriendo en http://${HOST}:${PORT}`);
      console.log(`=> API disponible en http://${HOST}:${PORT}/api`);
      console.log(`=> Socket.IO habilitado`);
    });
  } catch (error) {
    console.log("Error en setupServer():", error);
  }
}

async function setupAPI() {
  try {
    console.log("Iniciando servidor de Rally...");
    try {
      await connectDB();
      await createUsers();
    } catch (dbError) {
      console.warn("⚠️  Base de datos no disponible. Continuando sin BD...");
    }
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
