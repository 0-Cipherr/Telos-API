import pg, { type QueryResult } from "pg";
import type { BridgeQueryRules } from "../../interfaces/bridge-interfaces.js";
import type { BridgePost } from "../../types/BridgeTypes.js";
import pool from "../pool.js";

export default class BridgeQueries implements BridgeQueryRules {
  dbPool: pg.Pool = pool;
  queries: any = {
    postBirdge: "INSERT INTO Bridges VALUES($1,$2,$3,$4);",
    getBridgeByCondition: "SELECT * FROM Bridges where ",
    getAllBridges: "SELECT * FROM BRIDGES;",
  };
  constructor() {
    //instantly connect upon initialization
    this.dbConnect();
  }

  async dbConnect(): Promise<boolean> {
    pool.connect();
    //true indicating that connciton is successful

    return true;
  }

  //disconnect when doen
  async dbDisconnect(): Promise<boolean> {
    pool.end();
    //true value means that db has been killed and dsconnected

    return true;
  }

  //private hide

  async postBridge(
    bridgeCode: any,
    bridge: BridgePost,
    bridgeConstructor: any,
  ): Promise<boolean> {
    try {
      const result = await this.dbPool.query(this.queries.postBirdge, [
        bridge.API_KEY,
        bridge.baseUrl,
        bridge.bridgeName,
        bridge.chainsAvailable,
      ]);
      console.log("Instance posted to db!:");
      console.log(result.rows);
      console.log("====================================");
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async bridgesByChains() {}

  async getBridgeWhere() {}

  async getBridgeByCondition(
    condition: any,
    whereCollection: any[],
    params: any[],
  ): Promise<any> {
    const constructedQuery = this.constructQuery(
      this.queries.getBridgeByCondition,
      condition,
      whereCollection,
    );
    const response: any = await this.dbPool.query(constructedQuery, params);

    return response.rows;
  }

  constructQuery(query: string, condition: any, where: any[]): string {
    let parameters = query;
    let index = 0;
    for (const key in where) {
      const incrIndex: number = index++;
      parameters +=
        where[key] + index <= where.length - 1
          ? ` = $${incrIndex} `
          : "$" + incrIndex;
    }

    return parameters;
  }

  async getAllChainsAvailable(chains: number[]): Promise<any> {
    try {
      const bridgesAvailable: any = [];
      const bridges: any = await this.getAllBridges();
      for (const bridge in bridges) {
        const queriedChains: any = bridges[bridge].chainsAvailable;

        for (const queriedChain in queriedChains) {
          for (const chain in chains) {
            if (chains[chain] == queriedChains[queriedChain]) {
              bridgesAvailable.push(bridges[bridge]);
              break;
            }
          }
        }
      }

      return bridgesAvailable;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getBridgeName(id: number): Promise<any[] | null> {
    try {
      const res = await this.dbPool.query(
        "SELECT * FROM bridges WHERE id = $1",
        [id],
      );
      return res.rows;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getAllBridges(): Promise<QueryResult<any> | null> {
    try {
      const response: any = await this.dbPool.query(this.queries.getAllBridges);
      return response.rows;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
// https://user-images.githubusercontent.com/74038190/225813708-98b745f2-7d22-48cf-9150-083f1b00d6c9.gif
