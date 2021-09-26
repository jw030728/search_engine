import express from 'express';
import { createServer, Server } from 'http';
import { initialize } from "koalanlp/Util";
import database from "./config/database";
import controller from "./controller";

(async () => {
    database.sync(); //alter가 없음 얘는 데이터베이스 변경못함

    await initialize({
        packages: { KMR: "2.0.4", KKMA: "2.0.4" },
        verbose: true,
    });

    const app = express();

    app.use(controller);

    const server = createServer(app);
    server.listen(process.env.PORT || 5000);

})();
