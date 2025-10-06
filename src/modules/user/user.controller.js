const {
  catchError
} = require("../../../utils/errors/catchError.js")
const ApiFeatures = require("../../../utils/QueryBuilders/Sequelize_API_Fetchers.js")
const dataQuery = require("../../../utils/QueryBuilders/dataQuery.js")
const {
  User,
  AccessToken,
  Role,
  Permission
} = require("../../../database/models/index.js")
const AppError = require("../../../utils/errors/AppError.js");


// Add User
const addUser = catchError(async (req, res, next) => {
  const {
    username,
    email,
    password,
    role_id
  } = req.body;
  // checks if the role exists and if the user exists
  const existingUser = await User.findOne({
    where: {
      email
    }
  });
  if (existingUser) {
    return next(new AppError("User already exists", 400));
  }
  const existingRole = await Role.findByPk(role_id);
  if (!existingRole) {
    return next(new AppError("Role not found", 404));
  }
  const user = await User.create({
    username,
    email,
    password,
    role_id
  });

  res.status(201).json({
    message: "success",
    user: {
      name: user.username,
      email: user.email
    },
  });
});

// Get All Users with filters (paginated, sortable, etc.)
const getAllUsers = catchError(async (req, res, next) => {
  const dQuery=new dataQuery();
  dQuery.include=[
    {
      model: Role,
      attributes: ['name_en','name_ar'],
      as: 'role',
      include:[
        {
          model: Permission,
          attributes: ['name','guard_name'],
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    }
  ]
  const features = new ApiFeatures(User, req.query,dQuery)
    .search(['email'])
    .sort()
    .fields()
    .pagination();

  const {
    data,
    meta
  } = await features.execute();

  if (data.length < 1) {
    return next(new AppError("No users found", 404));
  }

  res.status(200).json({
    message: "success",
    data,
    meta
  });
});

// Get Single User
const getSingleUser = catchError(async (req, res) => {
  const User = await User.findByPk(req.params.id);
  if (!User) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({
    message: "success",
    User
  });
});

// Update User
const updateUser = catchError(async (req, res, next) => {
  if (req.file) {
    req.body.image = req.file.filename;
  }

  const [updatedCount, [updatedUser]] = await User.update(req.body, {
    where: {
      id: req.params.id
    },
    returning: true,
  });

  if (updatedCount === 0) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    message: "success",
    User: updatedUser
  });
});

// Delete User
const deleteUser = catchError(async (req, res, next) => {
  const deletedUser = await User.destroy({
    where: {
      id: req.params.id
    }
  });
  const tokens = await AccessToken.findOne({
    where: {
      user_id: req.params.id
    }
  });
  if (tokens) {
    await tokens.destroy();
  }
  if (!deletedUser) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({
    message: "success",
    User: deletedUser
  });
});

// const setContactNumber=catchError(async (req,res,next)=>{
//    const {contact}=req.body;
//    if(!contact){
//        return next(new AppError("Contact information is required", 400));
//    }
//    req.contact=contact;
//    next();
// });
module.exports = {
  addUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};