const express = require("express");
const router = express.Router();
const { querySync } = require("../mysql");
const { insertPersonInTheWaitingList } = require("../querys/waitingList");
const sendNotification = require("./pushNotification");
const { createToken, altenticarToken } = require("../token/token");
router.post("/create", altenticarToken, async (req, res) => {
  try {
    var { usersId, idParty } = req.body;

    const ExistUser = await querySync(
      `select id from convidados 
        where usersId = ?
        and id_party = ?`,
      [usersId, idParty]
    );

    if (ExistUser.length > 0) {
      return res.json({
        result: [],
        status: false,
        mensage: "usuario ja existe!",
      });
    }

    const result = await querySync(
      "insert into waitingList(usersId ,idParty) values (?,?)",
      [usersId, idParty]
    );

    const EventUser = await querySync(
      `select usersID from party where id = ?`,
      [idParty]
    );

    const users = await querySync(
      `select u.nome,u.img,t.token from users as u
    left join TokenNotification as t on t.usersId = ?
     where u.id = ?`,
      [EventUser[0].usersID, usersId]
    );
    if (users.length > 0) {
      sendNotification(
        users[0].nome,
        "Acabou de entrar na lista de espera do seu evento",
        [users[0].token]
      );
    }

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
    console.log(error.sqlMessage);

    res.json({
      status: false,
      mensage: "falha ao criar evento",
    });
  }
});

router.delete("/delete", altenticarToken, async (req, res) => {
  try {
    var { usersID, idParty, notification } = req.query;
    const result = await querySync(
      `delete from waitingList where usersId =? and idParty =?`,
      [usersID, idParty]
    );

    const resultConvidados = await querySync(
      `delete from convidados where usersID =? and id_party =?`,
      [usersID, idParty]
    );
    //notificao de posh

    const EventUser = await querySync(
      `select usersID,name from party where id = ?`,
      [idParty]
    );

    if (notification == "true") {
      const users = await querySync(
        `select u.nome,u.img,t.token from users as u
      left join TokenNotification as t on t.usersId = ?
       where u.id = ?`,
        [usersID, EventUser[0].usersID]
      );

      if (users.length > 0) {
        sendNotification(EventUser[0].name, `você foi removido deste evento`, [
          users[0].token,
        ]);
      }
    } else {
      const users = await querySync(
        `select u.nome,u.img,t.token from users as u
      left join TokenNotification as t on t.usersId = ?
       where u.id = ?`,
        [EventUser[0].usersID, usersID]
      );

      if (users.length > 0) {
        sendNotification(
          users[0].nome,
          `Acabou de sair do ${EventUser[0].name}`,
          [users[0].token]
        );
      }
    }

    //fim da notificacao

    res.json({
      result: result,
      status: true,
      mensage: "sucesso!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      mensage: "falha ao deleta",
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
    res.status(500).json({
      status: false,
      mensage: "falha ao criar ",
    });
  }
});

module.exports = router;
