//const JwtStrategy = require("passport-jwt").Strategy;
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserModel } from "../models/UserModel";
const config = require("../config");

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWTSECRET || config.jwtSecret,
}
module.exports = (passport: any) => {
    passport.use(
        // new JwtStrategy(opts, async (payload: { userId: string }, done: any) => {
        new Strategy(opts, async (payload: { userId: string }, done: any) => {
            try {
                const user = await UserModel.findOne({ _id: payload.userId });
                if (user) {
                    done(undefined, user);
                } else {
                    done(undefined, false);
                }
            } catch (error) {
                done(error, false);
            }
        })
    );
};