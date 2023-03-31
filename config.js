// config.js
import "dotenv/config";

const MYPORT = process.env.MYPORT;
const BCACCESSTOKEN = process.env.BCACCESSTOKEN;
const BCCLIENTID = process.env.BCCLIENTID;
const NGROKTOKEN = process.env.NGROKTOKEN;
const NGROKAPIKEY = process.env.NGROKAPIKEY;
const environment = process.env.NODE_ENV;
const BCSTOREHASH = process.env.BCSTOREHASH;
const MONDAYTOKEN = process.env.MONDAYTOKEN;

export {
  MYPORT,
  BCSTOREHASH,
  BCACCESSTOKEN,
  BCCLIENTID,
  NGROKTOKEN,
  NGROKAPIKEY,
  MONDAYTOKEN,
  environment,
};
