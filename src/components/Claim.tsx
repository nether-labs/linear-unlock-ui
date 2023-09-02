import { Grid, Typography, Button, Paper, Box, Stack, Link } from "@mui/material";
import * as React from "react";
import { CONTRACT_ADDRESS, DECIMALS } from "constants";
import { weiToLocaleString } from "utils";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import UNLOCK_ABI from "abi/linear-unlock-abi.json";
import Image from "next/image";
import { useWeb3Modal } from "@web3modal/react";

interface IClaimProps {
  userClaimableAmount: bigint;
  userTotalClaimedAmount: bigint;
  userTotalVestedAmount: bigint;
  userEndVestTimestamp: number;
}

interface ClaimRowProps {
  label: string,
  value: string,
}
const ClaimRow = ({ label, value }: ClaimRowProps) => {
  return <Stack direction="row">
    <Typography sx={{
      color: "#8e88aa",
      fontSize: "1rem",
      fontFamily: "Inter"
    }}>{label}</Typography>
    <Stack flexGrow={1} />
    <Typography>{value}</Typography>
  </Stack>
}

const Claim: React.FC<IClaimProps> = (props) => {
  // === CLAIM CONFIG === //
  const {
    config: claimConfig,
    error: claimPrepareError,
    isError: isClaimPrepareError,
  } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: UNLOCK_ABI,
    functionName: "claim",
  });

  const {
    data: claimData,
    write: claimWrite,
    error: claimError,
    isError: isClaimError,
  } = useContractWrite(claimConfig);
  const { isLoading: isClaimLoading, isSuccess: isSuccessLoading } =
    useWaitForTransaction({
      hash: claimData?.hash,
    });

  const { isConnected } = useAccount();

  const { open } = useWeb3Modal()

  // console.log("claimWrite", claimWrite);

  return (
    <>

      <Box sx={{
        borderRadius: "5px",
        minWidth: "450px",
        bgcolor: "secondary.main",

        border: "1px solid", borderColor: "lightPurple.main"
      }}>
        <Stack direction="column">
          <Stack justifyContent={"center"} direction="row" sx={{
            p: 2,
            border: "1px solid", borderColor: "lightPurple.main"
          }}>
            <Typography variant="h5" fontWeight={500}> Your Claim Details</Typography>
          </Stack>
          <Stack direction="column" sx={{ p: 2, position: "relative" }}>
            {isConnected ? (
              <>
                <Stack direction="column">
                  <ClaimRow label={"Total Vested"} value={weiToLocaleString(props.userTotalVestedAmount, DECIMALS)} />
                  <ClaimRow label={"Vest ends"} value={props.userEndVestTimestamp ? new Date(props.userEndVestTimestamp).toLocaleDateString() : "N/A"} />
                  <ClaimRow label={"Claimed so far"} value={weiToLocaleString(props.userTotalClaimedAmount, DECIMALS)} />
                  <ClaimRow label={"Claimable"} value={weiToLocaleString(props.userClaimableAmount, DECIMALS)} />

                  <Box textAlign={"center"} sx={{ marginTop: "10px" }}>
                    <Typography variant="subtitle1" sx={{
                      fontSize: ".9rem"
                    }}>Having issues? <br />Reach out to us on <Link sx={{
                      color: "pink",
                      fontWeight: 500,
                    }} href="https://discord.gg/netherlabs"> Discord</Link> for support. </Typography>
                  </Box>
                </Stack>
              </>) : <Box textAlign="center"> <Typography onClick={() => {
                open()
              }} variant="h6" color="purple.main" sx={{
                cursor: "pointer",
                ":hover": {
                  color: "purple.light"
                }
              }}> Connect Your Wallet to View</Typography></Box>}
          </Stack>
        </Stack>
      </Box>
      <Grid item sx={{ mt: 2 }}>
        {isConnected &&
          <Button
            variant="contained"
            color="primary"
            onClick={() => claimWrite?.()}
            disabled={props.userClaimableAmount === 0n}
          >
            Claim
          </Button>
        }
      </Grid>

    </>
  );
};

export default Claim;
