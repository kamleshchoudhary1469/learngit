import express, { json } from "express";
import cors from "cors";
import 'express-async-errors';
import { NotFoundError } from './errors/not-found-error';
import { errorHandler } from "./middlewares/error-handler";
import routes from "./routes";
import fileUpload from 'express-fileupload';
import { CORS_ORIGINS, DB_CONNECTION_TYPE, DEBUG_DB, ORACLE_CLIENT_EXEC_PATH, PORT } from "./config/envConfig";
import { dbConfigParms, setUpConnection } from "./config/dbconfig";
import oracledb from "oracledb";
import fs from "fs";
import axios from "axios";
import { reqEncryt } from "./common/reqEncryption";

export let dbPools: any = {};

const port = parseInt(PORT || "4000") + 14;

const app = express();

let libPath;

if (process.platform == "win32") libPath = ORACLE_CLIENT_EXEC_PATH;
else if (process.platform === "darwin") libPath = process.env.HOME + "";
else if (process.platform === "linux") libPath = ORACLE_CLIENT_EXEC_PATH;
if (libPath && fs.existsSync(libPath)) oracledb.initOracleClient({ libDir: libPath });

app.use(json());

app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: CORS_ORIGINS,
    methods: ["POST", "GET"]
}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    createParentPath: true
}));

app.use(reqEncryt);
app.use("/", routes);



app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
    try {
        axios.defaults.proxy = false;
        // DB_CONNECTION_TYPE == "CONTEMPORARY" && await setUpConnection(dbPools);
    } catch (err) {
        console.error(err);
    } finally {
        app.listen(port, "0.0.0.0", async () => {
            console.log(`🚀 Server Started at PORT: ${port}`);
        });

    }
}
start();