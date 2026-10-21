//flow for selecting ehich bridge to se is a adapter interfaces of different bridges
//  all following same standard and functioins like wr doing on solifity
//but instead we doing in typescript
//index.ts
import type { Application, Request, Response } from "express";
import express from "express";
import { registryRouter } from "./vaults/registryRouter.js";

const app: Application = express();
app.use("/registry", registryRouter);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World the api works !");
});

app.listen(3000, () => {
  console.log(`Listening at port ${3000}`);
});
//set up classses for bridge follwinf interface standard

// every thing mus have a type thats why we using ts
//micro services

export default app;
