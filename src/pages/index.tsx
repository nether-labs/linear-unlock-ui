import { Grid, Typography, Button } from "@mui/material";
import * as React from "react";
import { Web3Button } from "@web3modal/react";

import UploadCSV from "../components/UploadCSV";
import useVestingContract from "hooks/useVestingContract";
import Claim from "components/Claim";
import Head from "next/head";

export default function Home() {
  const {
    userIsOwner,
    userClaimableAmount,
    userTotalClaimedAmount,
    userTotalVestedAmount,
    userEndVestTimestamp,
  } = useVestingContract();

  return (
    <>
      <Head>
        <title>NFI Token Claim</title>
        <meta name="description" content="Claim your vested NFI Tokens" />
      </Head>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        direction="column"
        sx={{ p: 10 }}
      >
        {userIsOwner && (
          <Grid sx={{ mb: 5 }}>
            <UploadCSV />
          </Grid>
        )}

        <Claim
          userClaimableAmount={userClaimableAmount}
          userTotalClaimedAmount={userTotalClaimedAmount}
          userTotalVestedAmount={userTotalVestedAmount}
          userEndVestTimestamp={userEndVestTimestamp}
        />
      </Grid>
    </>
  );
}
