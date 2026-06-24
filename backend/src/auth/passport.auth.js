"use strict";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { AppDataSource } from "../config/configDb.js";
import User from "../entity/user.entity.js";
import Piloto from "../entity/piloto.entity.js";
import { JWT_SECRET } from "../config/configEnv.js";

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.jwt;
  }
  return token;
};

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    cookieExtractor,
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
  secretOrKey: JWT_SECRET,
};

export const passportJwtSetup = () => {
  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        // Pilotos tienen su propia tabla y no tienen estado_activo
        if (payload.es_piloto) {
          const pilotoRepository = AppDataSource.getRepository(Piloto);
          const piloto = await pilotoRepository.findOne({
            where: { id_piloto: payload.id_piloto },
          });

          if (piloto) {
            return done(null, {
              id: piloto.id_piloto,
              id_piloto: piloto.id_piloto,
              email: payload.email,
              rol: "piloto",
              nombre: piloto.nombre,
              apellido: piloto.apellido,
              rut: piloto.rut,
              es_piloto: true,
            });
          }
          return done(null, false);
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: { id: payload.id },
        });

        if (user && user.estado_activo) {
          return done(null, {
            id: user.id,
            email: user.email,
            rol: user.rol,
            nombre: user.nombre,
            apellido: user.apellido
          });
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
