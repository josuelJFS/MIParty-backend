const express = require("express");
const router = express.Router();
const { querySync } = require("../mysql");
const sendNotification = require("./pushNotification");

const { createToken, altenticarToken } = require("../token/token");

router.post("/create", altenticarToken, async (req, res) => {
  try {
    const { usersId, permissao, categoria, id_party } = req.body;

    const ExistUser = await querySync(
      `select id from convidados 
        where usersId = ?
        and id_party = ?`,
      [usersId, id_party]
    );

    if (ExistUser.length > 0) {
      return res.json({
        result: [],
        status: false,
        mensage: "usuario ja existe!",
      });
    }

    //verifica quantos convidados o usuario pode ter
    const limitedeusuarios = await querySync(
      `select maxGuests from party where id = ?`,
      [id_party]
    );

    const quantosConvidadosjatemNoevento = await querySync(
      `select id from convidados where id_party = ?`,
      [id_party]
    );

    if (
      quantosConvidadosjatemNoevento.length >= limitedeusuarios[0].maxGuests
    ) {
      return res.json({
        result: [],
        status: false,
        mensage: `você atingiu o valor máximo de ${limitedeusuarios[0].maxGuests} Convidados`,
      });
    }

    const result = await querySync(
      `insert into convidados (usersId,permissao,categoria,id_party) values (?,?,?,?)`,
      [usersId, permissao, categoria, id_party]
    );

    const deleteConvidados = await querySync(
      `delete from waitingList where usersId = ? and idParty=? `,
      [usersId, id_party]
    );
    // area do dotken notification
    const EventUser = await querySync(
      `select usersID,name from party where id = ?`,
      [id_party]
    );

    const users = await querySync(
      `select u.nome,u.img,t.token from users as u
      left join TokenNotification as t on t.usersId = ?
       where u.id = ?`,
      [usersId, EventUser[0].usersID]
    );

    if (users.length > 0) {
      sendNotification(
        "Solicitação Aceita ",
        `${users[0].nome} Acabou de Aprovar sua participação no ${EventUser[0].name}`,
        [users[0].token]
      );
    }
    // fin token notification
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
    res.status(500).json({
      status: false,
      mensage: "falha com o host",
    });
  }
});

router.put("/update", altenticarToken, async (req, res) => {
  try {
    const { id, permissao, categoria, id_party, usersId } = req.body;
    let premissaoNomes = "comun";
    if (permissao == 1) premissaoNomes = "Operador";
    if (permissao == 2) premissaoNomes = "Admin";
    const result = await querySync(
      "update convidados set  permissao=?,categoria=? where id = ?",
      [permissao, categoria, id]
    );

    if (result.affectedRows > 0) {
      // area do dotken notification
      const EventUser = await querySync(
        `select usersID,name from party where id = ?`,
        [id_party]
      );

      const users = await querySync(
        `select u.nome,u.img,t.token from users as u
      left join TokenNotification as t on t.usersId = ?
       where u.id = ?`,
        [usersId, EventUser[0].usersID] // 1 id de quem vai ser mandando a mensagem 2 id de quem e o usuario que esta fazendo a acao
      );

      if (users.length > 0) {
        sendNotification(
          EventUser[0].name,
          `você foi promovido para ${premissaoNomes}`,
          [users[0].token]
        );
      }
      // fin token notification
      res.json({
        result: result,
        status: true,
        mensage: "Atualizado com sucesso!",
      });
    } else {
      res.json({
        result: result,
        status: false,
        mensage: "nao foi possivel Atualizar",
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

router.delete("/delete", altenticarToken, async (req, res) => {
  try {
    const { id } = req.query;

    const result = await querySync("delete from convidados where id = ?", [id]);

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

router.get("/peopleInvited", altenticarToken, async (req, res) => {
  try {
    const { id } = req.query;

    const result = await querySync(
      "SELECT SUM(pessoas) AS value FROM convidados where id_party = ?",
      [id]
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
        mensage: "0",
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

router.get("/all", altenticarToken, async (req, res) => {
  try {
    const { id_party } = req.query;

    const result = await querySync(
      `select c.id as idConvite,u.nome,u.email,u.img,c.usersId,c.permissao,c.categoria from convidados as c
      join users as u on u.id = c.usersId
      where c.id_party = ?`,
      [id_party]
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
        mensage: "sem convidados para este evento",
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

router.get("/allForUserId", altenticarToken, async (req, res) => {
  try {
    const { usersId } = req.query;

    const result = await querySync(
      `select c.id,u.nome,u.email,u.img,c.usersId,p.name,p.cordenades from convidados as c
      join party as p on p.id = c.id_party
      join users as u on u.id = p.usersId
      where c.usersId = ?`,
      [usersId]
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
        mensage: "sem convidados para este evento",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      mensage: "falha",
    });
  }
});

router.get("/MeusConvites", altenticarToken, async (req, res) => {
  try {
    const { usersId } = req.query;

    const result = await querySync(
      `select c.id,c.categoria,c.permissao,c.id_party,u.nome,u.email,u.img,u.id as userByCreate,c.usersId,p.name as nameParty,p.address,p.city,p.state,p.date,p.time,p.obs from convidados as c
      join party as p on p.id = c.id_party
      join users as u on u.id = p.usersId
      where c.usersId = ?`,
      [usersId]
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
        mensage: "sem convidados para este evento",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      mensage: "falha",
    });
  }
});

router.get("/qrscenner", altenticarToken, async (req, res) => {
  try {
    const { email, idParty } = req.query;

    const result = await querySync(
      `select u.id,u.nome, u.email, u.img,c.categoria from users as u
      join convidados as c on c.usersId = u.id
      where u.email = ? and c.id_party = ?`,
      [email, idParty]
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
        mensage: "nao autorizado",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      mensage: "falha",
    });
  }
});

module.exports = router;
