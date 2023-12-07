# Welcome to the MIParty Project Backend

## Requirements

**[Docker and Docker Compose](https://docs.docker.com/desktop/) installation is required.**

With Docker installed, let's open the terminal in the project's root and run

```bash
$ docker-compose up
```

Now just wait while Docker sets up the containers with the Node and MySQL environments.

Once everything is downloaded, it is necessary to create the tables used for building the app and business rules.

**Through the browser, Postman, or any tool where you can execute an API with the GET method**

GET method: `http://localhost:3333/database/create`

This message will appear:

`"status": true,"mensage": "gerado"`

Then everything went well.

### Now everything is okay, and you can connect to the frontend [MIParty](https://github.com/josuelJFS/MIParty-Project).
