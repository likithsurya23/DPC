import app from "./app.js";
import { envConfig } from "./config/env.js";

app.listen(envConfig.port, envConfig.host, () => {
    console.log(
        `DPC Backend running on ${envConfig.host}:${envConfig.port}`
    );
});