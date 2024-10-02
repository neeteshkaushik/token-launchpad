import { PinataSDK } from "pinata-web3";

const pinataWeb3 = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
});


export default pinataWeb3;


//diq916hSvMwjpETGcPkjH4nulN1GHEaRy6CinINywY2-VnJEJGT_f_6rU-eLbgCN