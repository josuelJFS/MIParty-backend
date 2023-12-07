const express = require("express");
const router = express.Router();
const { querySync } = require("../mysql");

const { createToken, altenticarToken } = require("../token/token");

router.put("/update", altenticarToken, async (req, res) => {
  try {
    const { micash, userId, obs, micashGasto, titulo } = req.body;

    const result = await querySync(
      `update wallet set micash=? where userId = ?`,
      [micash, userId]
    );

    const moviment = await querySync(
      `insert into walletMovimentos (userId,micash,obs,titulo) values (?,?,?,?)`,
      [userId, micashGasto, obs, titulo]
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
      throw new Error("nada foi alterado");
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      mensage: "falha",
    });
  }
});

router.get("/getMiCash", altenticarToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const result = await querySync(
      `select micash from wallet where userId = ?`,
      [userId]
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
        mensage: "erro",
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
