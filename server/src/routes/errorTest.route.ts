import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  testForbidden,
  testValidation,
  testPrismaUnique,
  testJwtExpired,
  testJsonInvalid,
  testUnknown,
  testOk,
} from "../controllers/errorTest.controller";

const router = Router();

router.get("/ok", asyncHandler(testOk));
router.get("/forbidden", asyncHandler(testForbidden));
router.get("/validation", asyncHandler(testValidation));
router.get("/prisma", asyncHandler(testPrismaUnique));
router.get("/jwt-expired", asyncHandler(testJwtExpired));
router.get("/unknown", asyncHandler(testUnknown));
// 🔥 test JSON invalide → nécessite un POST avec un JSON cassé
router.post("/json-invalid", asyncHandler(testJsonInvalid));

export default router;
