const express = require("express");
const router = express.Router();
const { querySync } = require("../mysql");

const { createToken, altenticarToken } = require("../token/token");

router.post("/create", altenticarToken, async (req, res) => {
  try {
    const { id_party, userID } = req.body;

    const verifyUser = await querySync(
      `select * from checklist 
            where userID = ? and idParty =?`,
      [userID, id_party]
    );

    if (verifyUser.length > 0) {
      return res.json({
        result: [],
        status: false,
        mensage: "usuario já está neste evento",
      });
    }

    const result = await querySync(
      `insert into checklist (idParty,userID) values (?,?)`,
      [id_party, userID]
    );

    if (result.affectedRows > 0) {
      res.json({
        result: result,
        status: true,
        mensage: "gravado com sucesso!",
      });
    } else {
      res.json({
        result: result,
        status: false,
        mensage: "nao foi possivel gravar",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      mensage: "falha",
    });
  }
});

router.get("/list", async (req, res) => {
  try {
    const { idParty } = req.query;

    const data = await querySync(
      `select u.id,c.id as idChecklist,u.nome,u.email,u.img from checklist as c
            join users as u on u.id = c.userId
           where c.idParty = ?`,
      [idParty]
    );

    if (data.length > 0) {
      res.json({
        result: data,
        status: true,
        mensage: "existe listagem",
      });
    } else {
      res.json({
        result: data,
        status: false,
        mensage: "neum usuario fez check in",
      });
    }
  } catch (error) {
    res.json({
      status: false,
      mensage: error,
    });
  }
});

router.delete("/delete", altenticarToken, async (req, res) => {
  try {
    const { id } = req.query;

    const result = await querySync("delete from checklist where id = ?", [id]);

    if (result.affectedRows > 0) {
      res.json({
        result: result,
        status: true,
        mensage: "Deletado com sucesso!",
      });
    } else {
      res.json({
        result: result,
        status: false,
        mensage: "nao foi possivel Deletar",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      mensage: "falha verifique se o e-mail ja foi cadastrado",
    });
  }
});

module.exports = router;
