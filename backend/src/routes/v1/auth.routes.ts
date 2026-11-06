import { Router } from "express";
import * as authController from "../../controllers/auth-controller.js";

export const authRouter = Router();

authRouter.post("/register", (req, res, next) => void authController.postRegister(req, res).catch(next));
authRouter.post("/login", (req, res, next) => void authController.postLogin(req, res).catch(next));
authRouter.post("/logout", (req, res, next) => void authController.postLogout(req, res).catch(next));
authRouter.get("/me", (req, res, next) => void authController.getMe(req, res).catch(next));
authRouter.get("/csrf", (req, res, next) => void authController.getCsrf(req, res).catch(next));
