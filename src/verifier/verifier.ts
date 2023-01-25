import { InitConfig } from "@aries-framework/core";

export const verifierConfig: InitConfig = {
    label: 'demo-verifier',
    walletConfig: {
        id: 'verifier-wallet',
        key: 'L&A$daCRTRoFH9ixxbXE&U&@*PAK%Cxv',
    },
    publicDidSeed: 'S6!63h432RqRYsy6gKRE2gYx%HSvM2qS',
    indyLedgers: [
        {
            id: 'von-network',
            isProduction: false,
            genesisPath: '../genesis/genesis.txt',
            transactionAuthorAgreement: {
                version: '1',
                acceptanceMechanism: 'EULA',
            },
        },
    ],
    endpoints: ['http://localhost:5001'],
    autoAcceptConnections: true
}