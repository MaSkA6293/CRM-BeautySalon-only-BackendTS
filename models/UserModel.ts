import { model, Schema } from 'mongoose'

const UserSchema = new Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
        refresh_token: { type: String },
        confirmed: { type: Boolean, default: false },
        confirmed_hash: { type: String, required: true },
    },
    { timestamps: true }
)

export const UserModel = model("User", UserSchema)