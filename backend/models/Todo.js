const mongoose =
require("mongoose");

const TodoSchema =
new mongoose.Schema({

    title:{
        type:String,
        required:true,
    },

    description:{
        type:String,
    },

    completed:{
        type:Boolean,
        default:false,
    },

    dueDate:{
        type:Date,
        default:null,
    },

    priority:{
        type:String,
        enum:["low","medium","high"],
        default:"medium",
    },

    category:{
        type:String,
        trim:true,
        default:"",
    },

},{
    timestamps:true,
});

module.exports =
mongoose.model(
    "Todo",
    TodoSchema
);
