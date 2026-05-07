import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    status: "ok",
    env: {
      APP_REGION: !!process.env.APP_REGION,
      APP_ACCESS_KEY_ID: !!process.env.APP_ACCESS_KEY_ID,
      APP_SECRET_ACCESS_KEY: !!process.env.APP_SECRET_ACCESS_KEY,
    },
  });
}
