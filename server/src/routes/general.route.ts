import { Router } from "express";
import { status } from "../controllers/general.controller.js"; // IMPORT 
const r = Router();

// Liaison du segment d'url avec la méthode de contrôleur à executer
r.get("/health", status);

export default r;