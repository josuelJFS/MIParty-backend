const express = require("express");
const router = express.Router();
const { querySync } = require("../mysql");

router.get("/create", async (req, res) => {
  try {
    const users = await querySync(`CREATE TABLE IF NOT EXISTS users (
        id int NOT NULL AUTO_INCREMENT,
        nome varchar(100) DEFAULT NULL,
        email varchar(200) DEFAULT NULL,
        pass char(32) DEFAULT NULL,
        img varchar(250) DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY email (email)
      ) ENGINE=InnoDB`);
    //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
    const party = await querySync(`CREATE TABLE IF NOT EXISTS party (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(30) DEFAULT NULL,
        date date DEFAULT NULL,
        time time DEFAULT NULL,
        codInvite varchar(200) DEFAULT NULL,
        cordenades json DEFAULT NULL,
        categorias json DEFAULT NULL,
        maxGuests int DEFAULT NULL,
        address varchar(30) DEFAULT NULL,
        city varchar(150) DEFAULT NULL,
        obs varchar(200) DEFAULT NULL,
        state varchar(20) DEFAULT NULL,
        postalCod int DEFAULT NULL,  
        valueParty float DEFAULT NULL,
        usersId int DEFAULT NULL,
        active tinyint(1) DEFAULT NULL,
        peopleInvited int DEFAULT NULL,
        PRIMARY KEY (id),
        KEY usersId (usersId),
        FOREIGN KEY (usersId) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB `);

    const convidados = await querySync(`CREATE TABLE IF NOT EXISTS convidados (
        id int AUTO_INCREMENT primary key,
        usersId int,
        permissao int,
        categoria varchar(30),
        id_party int,
        FOREIGN KEY (id_party) REFERENCES party (id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (usersId) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
      )`);

    const wallet = await querySync(`CREATE TABLE IF NOT EXISTS wallet (
        id int AUTO_INCREMENT primary key,
        userId int,
        micash int,
        UNIQUE KEY userId (userId),
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
      )`);

    const walletMovimento =
      await querySync(`CREATE TABLE IF NOT EXISTS walletMovimentos (
        id int AUTO_INCREMENT primary key,
        userId int,
        micash int,
        titulo varchar(100),
	      obs varchar(255),
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
      )`);

    const chekelist = await querySync(`create table IF NOT EXISTS checklist (
          id int auto_increment primary key,
          idParty int,
          userID int,
          FOREIGN KEY (userID) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (idParty) REFERENCES party (id) ON DELETE CASCADE ON UPDATE CASCADE
      )`);

    const waitingList =
      await querySync(`CREATE TABLE IF NOT EXISTS waitingList (
        id int  auto_increment primary key,
         usersId int,
         idParty int,
         FOREIGN KEY (usersId) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
        )`);

    const tokenPush = await querySync(`create table TokenNotification (
          id int primary key auto_increment,
          usersId int,
          token varchar(200),
          UNIQUE KEY usersId (usersId),
          FOREIGN KEY (usersId) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE)`);

    res.json({
      result: {
        users: users,
        party: party,
        convidados: convidados,
        chekelist: chekelist,
        waitingList: waitingList,
        tokenPush: tokenPush,
        wallet: wallet,
        walletMovimentos: walletMovimento,
      },
      status: true,
      mensage: "gerado",
    });
  } catch (error) {
    res.json({
      status: false,
      mensage: error,
    });
  }
});

module.exports = router;
