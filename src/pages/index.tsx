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
import tokenAbi from '../abi/erc20.json';

type User = ['', 0, 0, 0, 0];

export default function Home() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [owner, setOwner] = useState('');
  const [userClaimable, setUserClaimable] = useState(0);

  const account = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected });
      readContractData();
    },
  });

  console.log('account', account);

  const readContractData = async () => {
    const _owner = await readContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: 'owner',
    });

    console.log('_owner', _owner);

    // const _startVestTimestamp = (await readContract({
    //   address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    //   abi: abi,
    //   functionName: 'startVestTimestamp',
    // })) as number;

    // console.log("_startVestTimestamp", _startVestTimestamp)

    const _user = (await readContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: 'users',
      args: [address],
    })) as User;

    console.log('user', _user);

    if (_user.length > 0) {
      //if user has claimable get the claimable amount
      if (_user[2] && _user[2] != 0) {
        const _userClaimable = (await readContract({
          address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          abi: abi,
          functionName: 'getUserClaimable',
          args: [address],
        })) as number;

        console.log('_userClaimable', _userClaimable);

        const decimals = (await readContract({
          address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`,
          abi: tokenAbi,
          functionName: 'decimals',
        })) as number;

        console.log('decimals', decimals);

        const scalar = (await readContract({
          address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          abi: abi,
          functionName: 'SCALAR',
        })) as number;

        console.log('scalar', scalar);

        const claimAmount = Number(_userClaimable) / 10 ** Number(decimals);
        const scaledClaimAmount = claimAmount / Number(scalar);

        setUserClaimable(scaledClaimAmount);

        console.log('claimAmount', scaledClaimAmount);
      }
    }

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
    //if (account && account.isConnected) readContractData();
  }, [isSuccess, account]);

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
        {address === owner && (
          <Grid sx={{ mb: 5 }}>
            {' '}
            <UploadCSV />{' '}
          </Grid>
        )}

        <Grid item xs={12}>
          <Typography>Claimable: {Number(userClaimable)}</Typography>
        </Grid>
        <Grid item sx={{ mt: 2 }}>
          <Button
            variant='contained'
            onClick={() => write?.()}
            disabled={userClaimable === 0}
          >
            Claim
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
