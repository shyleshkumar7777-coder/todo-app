const express =
require("express");

const router =
express.Router();

const Todo =
require("../models/Todo");


// GET ALL TODOS

router.get("/", async(req,res)=>{

    try{

        const todos =
        await Todo.find().sort({
            completed:1,
            dueDate:1,
            createdAt:-1,
        });

        res.json(todos);

    }

    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});


// GET SINGLE TODO

router.get("/:id", async(req,res)=>{

    try{

        const todo =
        await Todo.findById(
            req.params.id
        );

        if(!todo){

            return res.status(404).json({
                message:"Todo Not Found"
            });

        }

        res.json(todo);

    }

    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});


// CREATE TODO

router.post("/", async(req,res)=>{

    try{

        const todo =
        await Todo.create({

            title:req.body.title,

            description:req.body.description,

            completed:req.body.completed,

            dueDate:req.body.dueDate || null,

            priority:req.body.priority || "medium",

            category:req.body.category || "",

        });

        res.status(201).json(todo);

    }

    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});


// UPDATE TODO

router.put("/:id", async(req,res)=>{

    try{

        const todo =
        await Todo.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new:true,
            }

        );

        if(!todo){

            return res.status(404).json({

                message:"Todo Not Found"

            });

        }

        res.json(todo);

    }

    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});


// DELETE TODO

router.delete("/:id", async(req,res)=>{

    try{

        const todo =
        await Todo.findByIdAndDelete(
            req.params.id
        );

        if(!todo){

            return res.status(404).json({
                message:"Todo Not Found"
            });

        }

        res.json({

            message:
            "Todo Deleted Successfully"

        });

    }

    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});

module.exports = router;
