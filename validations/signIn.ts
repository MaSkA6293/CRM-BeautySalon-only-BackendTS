// const { check } = require("express-validator");

// const signInValidation = [
//   check("email", "Введите корректный email").normalizeEmail().isEmail(),
//   check("password", "Введите пароль").exists(),
// ];

// module.exports = signInValidation;
import { body } from "express-validator"

export const signInValidation = [
  body("email").normalizeEmail().isEmail().withMessage("Введите корректный email"),
  body("password").isString().withMessage("Укажите пароль").isLength({
    min: 6
  }).withMessage("Минимальная длина пароля 6 символов")
]