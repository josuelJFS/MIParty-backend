const express = require("express");
const router = express.Router();
const { querySync } = require("../mysql");

const { altenticarToken } = require("../token/token");

router.get("/all", altenticarToken, async (req, res) => {
  try {
    const { email } = req.query;
    const result = await querySync(
      `
     select c.id,c.categoria,c.permissao,c.nome,c.email,c.obs,c.id_party,c.pessoas,c.aceito,p.name as nomeEvento
     from convidados  as c
      join  party as p on p.id = c.id_party
     where c.email = ?`,
      [email]
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
        mensage: "neum evento criado",
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

router.put("/updateAceito", altenticarToken, async (req, res) => {
  try {
    var { id, aceito } = req.body;
    const result = await querySync(
      "update convidados set aceito = ? where id = ?",
      [aceito, id]
    );

    if (result.affectedRows > 0) {
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
      mensage: "falha ao atualziar evento",
    });
  }
});

module.exports = router;
