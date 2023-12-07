const express = require("express");
const router = express.Router();
const { querySync } = require("../mysql");

const { createToken, altenticarToken } = require("../token/token");

router.post("/create", altenticarToken, async (req, res) => {
  try {
    var {
      name,
      date,
      maxGuests,
      address,
      city,
      state,
      postalCod,
      valueParty,
      usersId,
      cordenates,
      time,
      categorias,
      obs,
    } = req.body;
    if (categorias) categorias = JSON.stringify(categorias);
    date = date.replace(/\//g, "");
    date = date.replace(/(\d{2})(\d{2})(\d{4})(.*)/g, "$3-$2-$1");
    const result = await querySync(
      "insert into party (name,date,maxGuests,address,city,state,postalCod,valueParty,usersId,cordenades,time,categorias,obs) values (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        name,
        date,
        maxGuests,
        address,
        city,
        state,
        postalCod,
        valueParty,
        usersId,
        cordenates,
        time,
        categorias,
        obs,
      ]
    );

    if (result.affectedRows > 0) {
      const codInvite = result.insertId + Math.random().toString(36).slice(-10);
      const resultInviteCod = await querySync(
        "update party set codInvite=? where id=?",
        [codInvite, result.insertId]
      );
      if (resultInviteCod.affectedRows === 0) {
        return res.json({
          result: resultInviteCod,
          status: false,
          mensage: "nao foi possivel gravar",
        });
      }
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
      mensage: "falha ao criar evento",
    });
  }
});

router.put("/update", altenticarToken, async (req, res) => {
  try {
    var {
      id,
      name,
      date,
      maxGuests,
      address,
      city,
      state,
      postalCod,
      time,
      cordenates,
      categorias,
      obs,
    } = req.body;
    if (categorias) categorias = JSON.stringify(categorias);
    date = date.replace(/\//g, "");
    date = date.replace(/(\d{2})(\d{2})(\d{4})/g, "$3-$2-$1");

    const result = await querySync(
      "update party set name=?,date=?,maxGuests=?,address=?,city=?,state=?,postalCod=?, time=?,cordenades=?,categorias=?,obs=? where id = ?",
      [
        name,
        date,
        maxGuests,
        address,
        city,
        state,
        postalCod,
        time,
        cordenates,
        categorias,
        obs,
        id,
      ]
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
    res.status(500).json({
      status: false,
      mensage: "falha ao atualziar evento",
    });
  }
});

router.get("/all", altenticarToken, async (req, res) => {
  try {
    const { usersId } = req.query;
    if (!usersId)
      return res.json({
        result: [],
        status: false,
        mensage: "id dp usuario precisa ser pasado!",
      });
    const result = await querySync(
      "select id,name,DATE_FORMAT(date,'%d/%m/%Y') date,date as dateObj,maxGuests,address,city,state,postalCod,valueParty,usersId,active,cordenades,codInvite,time,categorias,obs from party where usersId = ?",
      [usersId]
    );

    result.forEach((e) => (e.categorias = JSON.parse(e.categorias)));

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
    res.status(500).json({
      status: false,
      mensage: "falha ao criar evento",
    });
  }
});

router.get("/conviteParty", altenticarToken, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return console.log("id precisa ser passado");
    const result = await querySync(
      `select p.id,p.name,DATE_FORMAT(p.date,'%d/%m/%Y') as date,p.maxGuests,p.address,p.city,p.state,p.postalCod,p.valueParty,p.usersId,p.active,u.img 
    from party as p 
    left join users as u on u.id = p.usersId
    where p.id=?`,
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

router.get("/active", altenticarToken, async (req, res) => {
  try {
    const { usersId } = req.query;
    if (!usersId) return console.log("id rpecisa ser passado");
    const result = await querySync(
      `select id,name,DATE_FORMAT(date,'%d/%m/%Y %H:%i') date,date as dateObj,maxGuests,address,city,state,postalCod,valueParty,usersId,active 
    from party 
    where active = true  and usersId = ?`,
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

router.get("/seachPartyForCod", altenticarToken, async (req, res) => {
  try {
    const { codInvite, usersId } = req.query;
    if (!codInvite) return console.log("id precisa ser passado");

    const result = await querySync(
      `select id,name,codInvite,DATE_FORMAT(date,'%d/%m/%Y') date from party where codInvite = ?`,
      [codInvite]
    );

    if (result.length > 0) {
      const isParticiping = await querySync(
        `select id from waitingList where usersId = ? and idParty = ?`,
        [usersId, result[0].id]
      );

      const ExistUserConvidados = await querySync(
        `select id from convidados 
          where usersId = ?
          and id_party = ?`,
        [usersId, result[0].id]
      );
      console.log(isParticiping.length > 0 || ExistUserConvidados.length > 0);
      res.json({
        result: result,
        status: true,
        isParticiping:
          isParticiping.length > 0 || ExistUserConvidados.length > 0,
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
    res.status(500).json({
      status: false,
      mensage: "falha ao criar evento",
    });
  }
});

router.delete("/delete", altenticarToken, async (req, res) => {
  try {
    var { id } = req.query;
    const result = await querySync(`delete from party where id =?`, [id]);

    res.json({
      result: result,
      status: true,
      mensage: "sucesso!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      mensage: "falha ao deleta",
    });
  }
});

module.exports = router;
