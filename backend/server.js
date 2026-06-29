require("dotenv").config();

const express =
require("express");

const cors =
require("cors");

const connectDB =
require("./config/db");

const todoRoutes =
require("./routes/todoRoutes");

const app =
express();

connectDB();

app.use(cors());

app.use(express.json());

app.use("/todos",todoRoutes);

app.listen(

    process.env.PORT,

    ()=>{

        console.log(

            `Server Running on Port ${process.env.PORT}`

        );

    }

);