import { body } from "express-validator"

export const registerValidations = [
    body("email").isEmail().withMessage("Не верный E-mail").isLength({
        min: 4, max: 40
    }).withMessage("Допустимое количество символов от 4 до 40"),
    body("fullname").isString().withMessage("Введите имя").isLength({
        min: 2, max: 40
    }).withMessage("Допустимое количество символов от 2 до 40"),
    body("username").isString().withMessage("Укажите логин").isLength({
        min: 2, max: 40
    }).withMessage("Допустимое количество символов от 2 до 40"),
    body("password").isString().withMessage("Укажите пароль").isLength({
        min: 6
    }).withMessage("Минимальная длина пароля 6 символов")
        .custom((value, { req }) => {
            if (value !== req.body.password2) {
                throw new Error("Пароли не совпадают")
            } else {
                return value
            }
        })

]