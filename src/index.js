import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import indexRoutes from "./routes/index.js";
import {mongoose} from "mongoose";
import dotenv from "dotenv";
import merchantRoutes from "./routes/merchant.js";

dotenv.config();

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(indexRoutes);
app.use(express.json())
app.use(merchantRoutes);
app.use(express.static(join(__dirname, "public")));
app.listen(process.env.PORT || 3000);
console.log("server is listening on port", process.env.PORT || 3000);

// mongodb conection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() =>console.log("conected to mongodb"))
  .catch((error) => console.log(error));