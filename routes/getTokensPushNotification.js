const express = require("express");
const router = express.Router();
const { querySync } = require("../mysql");
const { insertPersonInTheWaitingList } = require("../querys/waitingList");
const { createToken, altenticarToken } = require("../token/token");

router.post("/create", altenticarToken, async (req, res) => {
  try {
    var { usersId, tokenPush } = req.body;

    const result = await querySync(
      `INSERT INTO TokenNotification (usersId,token) VALUES (?,?)
      ON DUPLICATE KEY UPDATE token = ?`,
      [usersId, tokenPush, tokenPush]
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
    res.json({
      status: false,
      mensage: "falha do host",
    });
  }
});

router.get("/all", altenticarToken, async (req, res) => {
  try {
    const { idParty } = req.query;
    const result = await querySync(
      `select w.id as idWaitingList,u.nome,u.email,u.img,w.usersId from waitingList as w
   join users as u on u.id = w.usersId
   where idParty = ?`,
      [idParty]
    );

    if (result.length > 0) {
      res.json({
        result: result,
        status: true,
        mensage: "sucesso!",
      });
    } else {
      res.json({
        result: result,
        status: false,
        mensage: "nao existe ninguem participando",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      mensage: "falha ao criar evento",
    });
  }
});

module.exports = router;
