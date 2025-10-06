const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const authenticate = (allowedRoles = []) => {
  return (socket, next) => {
    
    const cookies = socket.handshake?.headers?.cookie ? cookie.parse(socket.handshake.headers.cookie) : {};
    const token = cookies.token;
    if (!token) return next(new Error("Authentication error"));
    
    const secretKey = Buffer.from(process.env.JWT_SECRET_KEY,'base64')
    const decoded = jwt.verify(token, secretKey);
    
    if (!decoded) return next(new Error("Authentication error"));
    socket.auth = decoded;
    if (allowedRoles.length && !allowedRoles.includes(decoded.role?.name)) {
      return next(new Error("Forbidden"));
    }
    next();
  };
};

module.exports = {
  clientAuthenticate: authenticate(["user"]),
  adminAuthenticate: authenticate(["admin",'doctor']),
};
