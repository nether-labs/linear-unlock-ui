import { Box, Stack, Typography } from "@mui/material";
import { Web3Button } from "@web3modal/react";
import Image from "next/image";
import netherLogo from "public/logo.svg"
import { PropsWithChildren } from "react";


const Layout = ({ children }: PropsWithChildren) => (
    <Box sx={{
        position: "fixed", top: 0, width: "100%"
    }}>
        <Stack direction="row" sx={{ bgcolor: "secondary.main", py: 2, px: 4, borderBottom: "1px solid", borderColor: "lightPurple.main" }} alignItems="center">
            <Image src={netherLogo} height={"40"} width={"160"} alt="Nether Logo" />
            <Stack flexGrow={1} />
            <Box className="connectButton">
                <Web3Button />
            </Box>

        </Stack>
        <Stack direction="column">
            {children}
        </Stack>
    </Box>
)

export default Layout