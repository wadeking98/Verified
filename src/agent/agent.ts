import { AutoAcceptCredential, InitConfig } from "@aries-framework/core";

export const agentConfig: InitConfig = {
    label: 'demo-agent',
    walletConfig: {
        id: 'agent-wallet',
        key: process.env.AGENT_WALLET_KEY ?? "",
    },
    publicDidSeed: process.env.AGENT_SEED,
    indyLedgers: [
        {
            id: 'BCovrinTest',
            isProduction: false,
            genesisPath: '../genesis/genesis.txt',
        },
    ],
    endpoints: [process.env.ENDPOINT_URL ?? ""],
    autoAcceptConnections: true,
    autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
    useLegacyDidSovPrefix: true
}