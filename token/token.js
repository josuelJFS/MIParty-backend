const jwt = require("jsonwebtoken");
const tokenNumberserver = "aha22ahrcharpartfest22@miparty";

exports.altenticarToken = (req, res, next) => {
  try {
    const decode = jwt.verify(
      req.params.token ||
        req.body.token ||
        req.headers.token ||
        req.query.token,
      tokenNumberserver
    );

    req.token = decode;
    next();
  } catch (error) {
    return res.json({
      mensagem: "falha na autenticação",
      error: "token errado ou não informado",
      status: false,
    });
  }
};

exports.createToken = (e = {}) => {
  var token = jwt.sign(e, tokenNumberserver, {
    expiresIn: "3d",
  });
  return token;
};
