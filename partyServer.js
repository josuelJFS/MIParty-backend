const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const removeEvent5Days = require("./utils/func");
const login = require("./routes/login");
const evento = require("./routes/evento");
const tokenValidate = require("./routes/tokenValidate");
const convidados = require("./routes/convidados");
const meusConvites = require("./routes/meusConvites");
const waitingList = require("./routes/waitingList");
const createDataBases = require("./routes/createDataBases");
const checklist = require("./routes/checklist");
const wallet = require("./routes/wallet");
const getTokensPushNotification = require("./routes/getTokensPushNotification");
const CepCoords = require("coordenadas-do-cep");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/login", login);
app.use("/evento", evento);
app.use("/tokenValidate", tokenValidate);
app.use("/convidados", convidados);
app.use("/meusConvites", meusConvites);
app.use("/database", createDataBases);
app.use("/checklist", checklist);
app.use("/waitingList", waitingList);
app.use("/tokenPush", getTokensPushNotification);
app.use("/wallet", wallet);

setInterval(() => {
  removeEvent5Days();
}, 1000 * 60 * 60 * 24);

app.use((req, res, next) => {
  res.status(500).send({
    error: "rota não encontrada123",
  });
});

app.listen(3333, "0.0.0.0");
