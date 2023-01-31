import { AutoAcceptCredential, InitConfig } from "@aries-framework/core";

export const agentConfig: InitConfig = {
    label: 'demo-agent',
    walletConfig: {
        id: 'agent-wallet-demo-1',
        key: process.env.AGENT_WALLET_KEY ?? "",
    },
    publicDidSeed: process.env.AGENT_SEED,
    indyLedgers: [
        {
            id: 'von-network',
            isProduction: false,
            genesisPath: '../genesis/genesis.txt',
        },
    ],
    endpoints: [process.env.ENDPOINT_URL ?? ""],
    autoAcceptConnections: true,
    autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
    useLegacyDidSovPrefix: true
}