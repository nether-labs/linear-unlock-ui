import { DECIMALS } from "./contract_constants";

export const weiToLocaleString = (number: bigint, decimals: number) => {
  return (Number(number) / 10 ** decimals).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

export const csvToWriteData = (csvData: any[]): [any[], bigint] => {
  let writeData = [];
  let approveAmount = BigInt(0);
  csvData.forEach((d) => {
    let usrObj = {
      userAddress: "",
      claimed: BigInt(0),
      claimable: BigInt(0),
      lastClaimedTimestamp: 0,
      endVestTimestamp: 0,
    };

    usrObj.userAddress = d.userAddress;
    usrObj.claimable = BigInt(d.claimable) * BigInt(10 ** DECIMALS);
    approveAmount += usrObj.claimable;
    usrObj.endVestTimestamp =
      Math.floor(Date.now() / 1000) + Number(d.vestMonths * 2592000);

    writeData.push(usrObj);
  });

  return [writeData, approveAmount];
};
