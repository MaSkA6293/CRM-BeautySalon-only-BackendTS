import dotenv from "dotenv"
import express from 'express'
import { UserC } from "./controllers/UserController"
import { registerValidations } from './validations/register'
const morgan = require("morgan");
const authRoutes = require("./routes/auth.routes");
const clientRoutes = require("./routes/client.routes");
const colorRoutes = require("./routes/color.routes");
const serviceRoutes = require("./routes/service.routes");
const serviceCategoryesRoutes = require("./routes/serviceCategory.routes");
const eventsRoutes = require("./routes/eventsRoutes.routes");
import passport from "passport"
dotenv.config()
import "./core/db"

const app = express()
app.use(express.json())
app.use(morgan("tiny"));
app.use(express.static(`${__dirname}/public`));

app.use(passport.initialize());
require("./core/passport")(passport);

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});


app.get("/users", UserC.index)
app.post("/users", registerValidations, UserC.create)

app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/color", colorRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/services/categories", serviceCategoryesRoutes);
app.use("/api/calendar/events", eventsRoutes);


app.listen(process.env.PORT, (): void => {
  console.log(`Server has been started on port: ${process.env.PORT}`);
})
