# Welcome to the MIParty Project backend

## necesario

**[docker e docker-compose](https://docs.docker.com/desktop/) installation is required.**

com docker instalado vamos abrir o terminal na raiz do projeto e executar

```
$ docker-compose up
```

agora só aguarda enquanto o docker configurar o cotainers com o ambientes de node e mysql

apos baixar tudo e necessario criar as tabelas utilizadas para contrucao do app e regra denegocio

**pelo navegador ou postmen ou qualquer lugar onde voce possa execultar uma api com metodo get**

metodo get: `http://localhost:3333/database/create`

essa mensagem irá aárecer

`"status": true,"mensage": "gerado"`
então tudo ocorreu bem

### agora o tudo está ok e você ja pode conectar no frontend [MIParty](https://expo.dev/)
