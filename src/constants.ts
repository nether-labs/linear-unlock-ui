export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "") as `0x${string}`;
export const SCALAR = BigInt(process.env.NEXT_PUBLIC_SCALAR) || 1000000n;
export const TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ||
  "") as `0x${string}`;
export const DECIMALS = Number(process.env.NEXT_PUBLIC_TOKEN_DECIMALS) || 18;
