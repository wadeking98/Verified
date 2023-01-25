import { InitConfig } from "@aries-framework/core";

export const issuerConfig: InitConfig = {
    label: 'demo-issuer',
    walletConfig: {
        id: 'issuer-wallet',
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
    endpoints: ['http://172.17.0.1:5000'],
    autoAcceptConnections: true
}