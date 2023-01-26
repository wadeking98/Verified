import * as dotenv from 'dotenv'

dotenv.config()

import { createCredentialInvitation, createProofInvitation, initAgent, register } from './helpers/helpers'
import { agentConfig } from './agent/agent'
import * as schemaTemplate from './schema/schema.json'
import * as express from 'express'
import { startServer } from '@aries-framework/rest'





const start = async () => {

    // init agents
    const agent = await initAgent(agentConfig, (process.env.INBOUND_PORT as unknown as number) ?? 5000)
    const { credDef } = await register(agent, schemaTemplate)

    // initialize static invites
    const credentialInvite = await createCredentialInvitation(agent, credDef)
    const credentialInviteUrl = credentialInvite.outOfBandInvitation.toUrl({ domain: process.env.ENDPOINT_URL ?? "" })

    const proofInvite = await createProofInvitation(agent, credDef)
    const proofInviteUrl = proofInvite.outOfBandInvitation.toUrl({ domain: process.env.ENDPOINT_URL ?? "" })

    const app = express()

    app.get('/requestCredential', async (req, res) => {
        res.send(credentialInviteUrl)
    })

    app.get('/requestProof', async (req, res) => {
        res.send(proofInviteUrl)
    })


    startServer(agent, { port: 8282, app })

}

start()