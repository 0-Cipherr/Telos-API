import "dotenv/config"; // Loads variables into process.env automatically
import express from "express";

// Server-side code example
const url = "https://api.moonpay.com/platform/v1/sessions";

export const microserviceRoter = express.Router();

microserviceRoter.get("/create/sessionToken", async (req: any, res: any) => {
  const { userId, IPAddress } = req.body;
  const result = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.MOONPAY_SECRET,
    },
    method: "POST",
    body: JSON.stringify({
      externalCustomerId: userId,
      deviceIp: IPAddress,
    }),
  });

  const jsonRes = await result.json();
  res.status.send(jsonRes);
});
