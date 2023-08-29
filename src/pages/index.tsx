import { Grid, Typography, Button } from '@mui/material';
import * as React from 'react';
import { Web3Button } from '@web3modal/react';
import { readContract } from '@wagmi/core';
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import abi from '../abi/linear-unlock-abi.json';
import { useEffect, useState } from 'react';
import UploadCSV from '../components/UploadCSV';
import tokenAbi from '../abi/erc20antiMev.json';

export default function Home() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [owner, setOwner] = useState('');
  const [userClaimable, setUserClaimable] = useState(BigInt(0));

  const account = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected });
      readContractData();
    },
  });

  console.log('account', account);

  const readContractData = async () => {
    console.log("NEXT_PUBLIC_CONTRACT_ADDRESS", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)
    const _owner = await readContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: 'owner',
    });

    const _userClaimable = (await readContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: 'getUserClaimable',
      args: [address],
    })) as number;

    const decimals = (await readContract({
      address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`,
      abi: tokenAbi,
      functionName: 'decimals',
    })) as number;

    const scalar = (await readContract({
      address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`,
      abi: tokenAbi,
      functionName: 'SCALAR',
    })) as number;

    console.log('userClaimable', _userClaimable);

    setUserClaimable(
      BigInt(_userClaimable) / BigInt(10 ** decimals) / BigInt(10 ** scalar)
    );

    setOwner(_owner as string);
    console.log('owner', _owner);
  };

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'claim',
  });

  const { data, write, error, isError } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
   
    if (!account && account.isConnected) readContractData();
  }, [isSuccess]);

  return (
    <>
      <Grid container justifyContent='end' sx={{ p: 2 }}>
        <Web3Button />
      </Grid>

      <Grid
        container
        justifyContent='center'
        alignItems='center'
        direction='column'
        sx={{ p: 10 }}
      >
        {address === owner && <UploadCSV />}

        <Grid item xs={12}>
          <Typography>Claimable: {Number(userClaimable)}</Typography>
        </Grid>
        <Grid item sx={{ mt: 2 }}>
          <Button variant='contained' onClick={() => write?.()}>
            Claim
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
