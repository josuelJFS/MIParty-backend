const express = require("express");
const router = express.Router();
const { querySync } = require("../mysql");

const { createToken, altenticarToken } = require("../token/token");

router.post("/create", async (req, res) => {
  try {
    const { nome, email, pass } = req.body;
    const result = await querySync(
      "insert into users (nome,email,pass) values (?,?,md5(?))",
      [nome, email, pass]
    );

    res.json({
      result: result,
      status: true,
      mensage: "Usuário criado com sucesso !",
    });
  } catch (error) {
    res.json({
      status: false,
      mensage: "falha ao criar usuario",
    });
  }
});

router.get("/seachUser", async (req, res) => {
  try {
    const { email, idParty } = req.query;
    const dadosScanner = email.split("|");

    const user = await querySync(
      `select u.id,u.img,u.nome,u.email,c.aceito from users as u
        join convidados as c on c.email = u.email
        where c.email = ?`,
      [dadosScanner[0], dadosScanner[1]]
    );

    if (idParty != dadosScanner[1]) {
      return res.json({
        result: user,
        status: false,
        mensage: "usuário desautorizado",
        token: "",
      });
    }
    const data = await querySync(
      `select u.id,u.img,u.nome,u.email,c.aceito from users as u
        join convidados as c on c.email = u.email
        where c.email = ?
        and c.id_party = ?`,
      [dadosScanner[0], dadosScanner[1]]
    );

    if (data.length > 0 && data[0].aceito == 1) {
      res.json({
        result: data,
        status: true,
        mensage: "usuario Autorizado",
        token: createToken({ email: email, nome: data[0].nome }),
      });
    } else {
      res.json({
        result: data,
        status: false,
        mensage: "usuário desautorizado",
        token: "",
      });
    }
  } catch (error) {
    res.json({
      status: false,
      mensage: error,
    });
  }
});
router.get("/seach", async (req, res) => {
  try {
    const { email, pass } = req.query;
    const data = await querySync(
      "select * from  users where email = ? and pass = md5(?)",
      [email, pass]
    );
    if (data.length > 0) {
      res.json({
        result: data,
        status: true,
        mensage: "usuario encontrado",
        token: createToken({ email: email, nome: data[0].nome }),
      });
    } else {
      res.json({
        result: data,
        status: false,
        mensage: "usuário Não encontrado",
        token: "",
      });
    }
  } catch (error) {
    res.json({
      status: false,
      mensage: error,
    });
  }
});

router.post("/loginSocial", async (req, res) => {
  var { nome, email, pass, img } = req.body;

  try {
    pass = Math.random().toString(36).slice(-10);
    const result = await querySync(
      "insert into users (nome,email,pass,img) values (?,?,md5(?),?)",
      [nome, email, pass, img]
    );
    const data = await querySync("select * from  users where email = ?", [
      email,
    ]);

    const wallet = await querySync(
      "insert into wallet (userId,micash) values (?,?)",
      [data[0].id, 20]
    );
    res.json({
      result: data,
      status: true,
      mensage: "Usuário criado com sucesso !",
      token: createToken({ email: email, nome: data[0].nome }),
    });
    return;
  } catch (error) {
    if (error.sqlState == 23000) {
      try {
        const data = await querySync("select * from  users where email = ?", [
          email,
        ]);
        res.json({
          result: data,
          status: true,
          mensage: "sucesso !",
          token: createToken({ email: email, nome: data[0].nome }),
        });
        return;
      } catch (error) {
        res.json({
          status: false,
          mensage: error,
        });
      }
    }
    res.json({
      status: false,
      mensage: "falha ao criar usuario",
    });
  }
});

module.exports = router;
