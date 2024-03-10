import { Grid, Typography, Button, Stack, Box, Link, Container } from "@mui/material";
import * as React from "react";
import { Web3Button } from "@web3modal/react";

import UploadCSV from "../components/UploadCSV";
import useVestingContract from "hooks/useVestingContract";
import Claim from "components/Claim";
import Head from "next/head";
import { useAccount } from "wagmi";

export default function Home() {
  const {
    userIsOwner,
    userClaimableAmount,
    userTotalClaimedAmount,
    userTotalVestedAmount,
    userEndVestTimestamp,
    switchChain,
    desiredChain,
  } = useVestingContract();

  const { isConnected } = useAccount();

  return (
    <>
      <Head>
        <title>NFI Token Claim</title>
        <meta name="description" content="Claim your vested NFI Tokens" />
      </Head>
      <Container maxWidth="xl">
        <Grid
          container
          sx={{
            justifyContent: "center",
            my: 4,
          }}
        >
          {userIsOwner && (
            <Grid item sx={{ mb: 5 }}>
              <UploadCSV />
            </Grid>
          )}

          <Grid item xs={12} md={8} lg={6}>
            {isConnected && (
              <Stack direction="column" gap={2}>
                <Stack
                  justifyContent={"center"}
                  direction="row"
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "lightPurple.main",
                    backgroundColor: "lightPurple.dark",
                  }}
                >
                  <Typography variant="h4" fontWeight={500}>
                    {" "}
                    {"Vesting has ended"}
                  </Typography>
                </Stack>
                <Box>
                  <Typography variant="body1" paragraph>
                    Token vesting is now complete. If you have not claimed all your tokens yet, the remainder will be
                    airdropped to your wallet momentarily. No further action is required.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {"Thank you for your participation in the pre-seed and seed rounds <3"}
                  </Typography>
                  <Typography variant="caption" paragraph>
                    {"If you have any questions, please reach out to us on our"}{" "}
                    <Link
                      href="https://discord.gg/netherlabs"
                      target="_blank"
                      sx={{
                        color: "inherit",
                        textDecoration: "underline",
                      }}
                    >
                      <Typography variant="body1" component={"span"}>
                        Discord
                      </Typography>
                    </Link>{" "}
                  </Typography>
                </Box>
              </Stack>
            )}
            {!isConnected && (
              <Stack
                justifyContent={"center"}
                direction="row"
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "lightPurple.main",
                  backgroundColor: "lightPurple.dark",
                }}
              >
                <Typography variant="h4" fontWeight={500}>
                  {" "}
                  Connect your wallet to continue
                </Typography>
              </Stack>
            )}
          </Grid>
          {/* <Claim
            userClaimableAmount={userClaimableAmount}
            userTotalClaimedAmount={userTotalClaimedAmount}
            userTotalVestedAmount={userTotalVestedAmount}
            userEndVestTimestamp={userEndVestTimestamp}
            switchChain={switchChain}
            desiredChain={desiredChain}
          /> */}
        </Grid>
      </Container>
    </>
  );
}
