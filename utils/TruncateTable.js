// import fs from "fs";
export default function truncate (model){
    return async (req, res) => {
        // const images = await model.find({}).select("logo");
        // const attributes_name=['image','img','logo'];
        // const att=[]
        // attributes_name.forEach(element => {
        //     if((Object.keys(model.schema.obj)).includes(element)){
        //     att.push(element);
        //     }
        // });
        // const images = await model.find({}).select(att[0]);
        // images.forEach((image) => {
        //     fs.unlinkSync(`./uploads/${image[att]}`);});
        await model.deleteMany();
        
        res.status(200).json({ message: "success" });
    };
    } 