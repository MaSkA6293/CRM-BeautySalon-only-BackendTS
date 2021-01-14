const { Router } = require("express");
const passport = require("passport");

const router = Router();

import { AuthContr } from "../controllers/AuthController";
const signUpValidation = require("../validations/signUp");
import { signInValidation } from "../validations/signIn";

router.post("/signUp", signUpValidation, AuthContr.signUp);
router.post("/signIn", signInValidation, AuthContr.signIn);
router.get("/verify", AuthContr.verify);
router.post("/refresh", AuthContr.refresh);
router.get(
  "/getUser",
  passport.authenticate("jwt", {
    session: false,
  }),
  AuthContr.getUser
);

module.exports = router;
