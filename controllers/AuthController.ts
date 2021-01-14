import express from "express"
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const jwt_decode = require("jwt-decode");
const User = require("../models/User");
const sendMail = require("../utils/sendEmail");
const generateMD5 = require("../utils/generateHash");
import { dictionary } from "../constants";

import { IGetUserAuthInfoRequest } from "../index"


class AuthController {
  async getUser(req: IGetUserAuthInfoRequest, res: express.Response): Promise<void> {
    try {
      // eslint-disable-next-line no-underscore-dangle
      res.status(200).json({ id: req.user._id });
    } catch {
      res.status(404).json({ message: dictionary.ERROR_MESSAGE_500 });
    }
  };


  async verify(req: express.Request, res: express.Response): Promise<void> {

    try {
      const { hash } = req.query;
      if (hash.length !== 32) {
        res.status(500).json({ message: dictionary.ERROR_MESSAGE_500 });
        return
      }
      const user = await User.findOne({ confirmed_hash: hash });
      if (user) {
        if (!user.confirmed) {
          user.confirmed = true;
          await user.save();
        }
        return res.render("confirm", {
          title: "Подтверждение учетной записи",
          status: "успешно подтверждена",
        });
      }
      res.status(404).send();
      return
    } catch {
      res.status(500).json({ message: dictionary.ERROR_MESSAGE_500 });
      return
    }
  }


  async signUp(req: express.Request, res: express.Response): Promise<void> {

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(401).json({
          errors: errors.array(),
          message: "Не корректные данные при регистрации",
        });
        return
      }
      const { email, password } = req.body;
      const candidate = await User.findOne({ email });
      if (candidate) {
        res
          .status(401)
          .json({ message: "Пользователь с таким Email уже существует" });
        return
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        password: hashedPassword,
        confirmed_hash: generateMD5(process.env.MD5SECRET_KEY),
      });
      sendMail({
        from: "admin@beautySalon.com",
        to: user.email,
        subject: "Подтверждение почты CRM",
        html: `Для того, чтобы подтвердить почту, перейдите <a href="http://localhost:${process.env.PORT}/api/auth/verify?hash=${user.confirmed_hash}">по этой ссылке</a>`,
      });
      await user.save();

      res.status(200).json({
        message: "Вы успешно зарегистрировались, теперь Вы можете войти",
      }
      );
      return
    } catch {
      res.status(500).json({ message: dictionary.ERROR_MESSAGE_500 });
      return
    }


  }



  async signIn(req: express.Request, res: express.Response): Promise<void> {

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(401).json({
          message: "Не корректные данные при входе в систему",
        });
        return
      }

      const { email, password } = req.body;
      console.log(email, password)
      const user = await User.findOne({ email });
      console.log(user)
      if (!user) {
        res.status(401).json({ message: "Не корректные данные" });
        return
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: "Не корректные данные" });
        return
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWTSECRET,
        { expiresIn: "1h" }
      );
      const refresh_token = jwt.sign(
        { userId: user.id, email: user.email, payload: token },
        process.env.JWTREFRESH,
        { expiresIn: "30 days" }
      );
      const update = { refresh_token };
      await User.findOneAndUpdate({ _id: user._id }, update);
      res.status(200).json({
        token: `Bearer ${token}`,
        refresh_token,
        user: { id: user._id },
      });
      return
    } catch {
      res.status(500).json({ message: dictionary.ERROR_MESSAGE_500 });
      return
    }
  }

  async refresh(req: express.Request, res: express.Response): Promise<void> {

    try {
      const { refresh_token } = req.body;
      const { userId } = jwt_decode(refresh_token);
      const user = await User.findOne({ _id: userId });
      if (!user) {
        res.status(400).json({ message: "Error token" });
        return
      }
      const decodedToken = jwt.verify(
        refresh_token,
        process.env.JWTREFRESH,
        (err: express.Errback, decoded: string) => {
          if (err) {
            return false;
          }
          return decoded;
        }
      );
      if (!decodedToken) {
        res.status(400).json({ message: "Error token" });
        return
      }

      if (user.refresh_token === refresh_token) {
        const newToken = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWTSECRET,
          { expiresIn: "1h" }
        );
        const newRefresh_token = jwt.sign(
          { userId: user.id, email: user.email, payload: newToken },
          process.env.JWTREFRESH,
          { expiresIn: "30 days" }
        );
        const update = { refresh_token: newRefresh_token };
        await User.findOneAndUpdate({ _id: user._id }, update);
        res.status(200).json({
          token: `Bearer ${newToken}`,
          refresh_token: newRefresh_token,
        });
        return
      }
      res.status(400).json({ message: "Error token" });
      return
    } catch {
      res.status(500).json({ message: dictionary.ERROR_MESSAGE_500 });
      return
    }
  }
}


export const AuthContr = new AuthController()