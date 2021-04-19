const Users = require("../models/usersModel");
const Roles = require("../models/rolesModel");
const jwt = require('jsonwebtoken');

const newUser = async (req, res) =>{
    
        const newUser = new Users({
            username: req.body.username,
            email: req.body.email})

        //username comprobation
        let error = null;
        const foundUsername = await Users.findOne({username: req.body.username})
            .catch(err => {error = err})
            if(error) return res.status(500).json({message: "Error al consultar en la base de datos"})
            else {
                if (foundUsername) return res.json({message: "El usuario ya existe"})  
            }
    
        //mail comprobation
        const foundEmail= await Users.findOne({email: req.body.email})
            .catch(err => {error = err})
            if(error) return res.status(500).json({message: "Error al consultar en la base de datos"})
            else {
                if (foundEmail) return res.json({message: "El email ya está registrado"})  
            }
    
        //roles comprobation
        if(req.body.roles){
            const foundRoles = await Roles.find({name: {$in: req.body.roles}}) // busca el nombre de rol pasado en la base de datos
            newUser.roles = foundRoles.map(role => role.id) //gaurda array de ids de los roles del usuario
        }else if (!req.body.roles){
            const role = await Roles.findOne({name:"user"}) // default user
            newUser.roles = [role._id]
        }

        //pass encrypt
      newUser.password = await Users.encryptPass(req.body.password)
        

        // token creation
        const JWTKey = require ('../config').JWTKey;
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: req.body.password
          }, JWTKey);
    
        await newUser.save();
    
        res.status(200).json({token: token, user: newUser})
    
}

const getUsers = async (req,res) =>{
    let error = null;
    const users = await Users.find()
            .catch(err => {error = err})
            if(error) return res.status(500).json({message: "Error al consultar en la base de datos"})
            else res.json({users})
}

const updateUserRoles = async (req, res) =>{
//roles omprobation
if(req.body.roles){
    const foundRoles = await Roles.find({name: {$in: req.body.roles}}) // busca el nombre de rol pasado en la base de datos
    if(foundRoles.length==0) return res.json({message:"El rol no existe"})
    newRoles = foundRoles.map(role => role.id) //gaurda array de ids de los roles del usuario
    const user = await Users.findByIdAndUpdate(req.params.userId, {roles: newRoles}, {useFindAndModify:false})        
    return res.json({message:"Rol cambiado con exito"})
}else{
    return res.json({message:"Error en la solicitud"})
}

}

const deleteUser = async (req,res) =>{
    let error=null
    const userFound = await Users.findByIdAndDelete(req.params.userId)
    .catch(err =>{error = err})
    if(error) return res.json({message: "Error al intentar eliminar el usuario"})
    else{
        if (!userFound) return res.json({message: "El usuario no existe en la base de datos"});
        else return res.json({message: "Usuario eliminado con exito"})
    }    
}

module.exports = {newUser, getUsers, updateUserRoles, deleteUser}