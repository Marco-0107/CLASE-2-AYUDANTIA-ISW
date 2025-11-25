"use strict";
import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config/configEnv.js";

export const sendEmail = async (to, subject, text, html) => {
    try {
        // Validate credentials before creating transporter
        if (!EMAIL_USER || !EMAIL_PASS) {
            throw new Error("EMAIL_USER o EMAIL_PASS no están configurados en el archivo .env");
        }

        console.log("[Email Service] Configurando transporter con usuario:", EMAIL_USER);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Sistema de Rally" <${EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Correo enviado exitosamente:", info.messageId);
        
        return {
            success: true,
            messageId: info.messageId,
            mailOptions: mailOptions
        };
    } catch (error) {
        console.error("❌ Error enviando el correo:", error.message);
        throw new Error("Error enviando el correo: " + error.message);
    }
};
