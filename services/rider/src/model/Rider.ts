import mongoose,{Document,Schema} from "mongoose";

export interface IRider extends Document{
    userId:string;
    picture:string;
    phoneNumber:string;
    aadharNumber:string;
    drivingLicenceNumber:string;
    isVerified:boolean;
    location:{
        type:"Point";
        coordinates:[number,number];
    }
    isAvailable:boolean;
    lastActiveAt:Date;
    createdAt:Date;
    updateAt:Date;
}

const schema = new Schema({
    userId:{
        type:String,
        required:true,
        unique:true,
    },
    picture:{
        type:String,
        required:true,
    },
    phoneNumber:{
        type:String,
        require:true, 
        trim:true,
    },
    aadharNumber:{
        type:String,
        require:true,
    },
    drivingLicenseNumber:{
        type:Boolean,
        default:false,
    },
    location:{
        type:{
            type:String,
            enum:["Point"],
            default:"Point"
        },
        coordinates:{
            type:[Number],
            require:true,
        }
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    isAvailable:{
        type:Boolean,
        default:false,
    },
    lastActiveAt:{
        type:Date,
        default:Date.now,
    }
},{
    timestamps:true,
})

schema.index({location:"2dsphere"});

export const Rider = mongoose.model<IRider>("Rider",schema);