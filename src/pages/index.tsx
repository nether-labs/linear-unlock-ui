import { Grid } from '@mui/material';
import * as React from 'react';
import { Web3Button } from '@web3modal/react';
import { readContract } from '@wagmi/core';
import { useAccount } from 'wagmi';
import abi from '../abi/linear-unlock-abi.json';
import { useState } from 'react';

export default function Home() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [owner, setOwner] = useState('');

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

    setOwner(_owner as string);
    console.log('owner', _owner);
  };
  return (
    <>
      <Grid container justifyContent='end' sx={{ p: 2 }}>
        <Web3Button />
      </Grid>

      <Grid container justifyContent='center' sx={{ p: 10 }}>
        {address === owner && (
          <div>bye</div>
        )} 
        Hello
      </Grid>
    </>
  );
}
