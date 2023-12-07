const { querySync } = require("../mysql");
const sendNotification = require("../routes/pushNotification");
async function removeEventIn5DaysExpitation() {
  console.log("checando eventos para ser excluido");

  const result3 = await querySync(
    `select p.name,t.token, 5 - (DATEDIFF(NOW(), p.date)) as days from party as p 
    join TokenNotification as t on t.usersId = p.usersId
    where DATEDIFF(NOW(), p.date) >= 0`
  );

  result3.forEach((element) => {
    element.days > 0 &&
      sendNotification(
        "Aviso!",
        `Seu Evento ${element.name} vai ser excluido em ${element.days} dias`,
        [element.token]
      );
  });

  const excluir = await querySync(
    `DELETE FROM party WHERE DATEDIFF(NOW(), date) >= 5`
  );

  excluir.affectedRows > 0 &&
    result3.forEach((element) => {
      sendNotification("Aviso!", `Seu Evento ${element.name} foi excluido`, [
        element.token,
      ]);
    });
}

module.exports = removeEventIn5DaysExpitation;
