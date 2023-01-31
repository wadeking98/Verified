import * as dotenv from 'dotenv'

dotenv.config()

import { createCredentialInvitation, createProofInvitation, getCredStatus, getProofStatus, initAgent, register, signJWT, verifyJWT } from './helpers/helpers'
import { agentConfig } from './agent/agent'
import * as schemaTemplate from './schema/schema.json'
import * as express from 'express'
import * as ws from 'ws'
import { spawn } from 'child_process'
import * as bodyParser from 'body-parser'


const jsonParser = bodyParser.json()

const start = async () => {

    // init agents
    const agent = await initAgent(agentConfig, (process.env.INBOUND_PORT as unknown as number) ?? 5555)
    const { credDef } = await register(agent, schemaTemplate)

    const socket = new ws.Server({ port: 7777 })
    socket.on('connection', async (soc) => {
        soc.on('message', async (msg) => {
            if (msg === "proof") {
                const proofInvite = await createProofInvitation(agent, credDef, soc)
                const proofInviteUrl = proofInvite.outOfBandInvitation.toUrl({ domain: process.env.ENDPOINT_URL ?? "" })
                soc.send(JSON.stringify({ proofUrl: proofInviteUrl }))
            } else if (msg === "cred") {
                const credentialInvite = await createCredentialInvitation(agent, credDef, soc)
                const credentialInviteUrl = credentialInvite.outOfBandInvitation.toUrl({ domain: process.env.ENDPOINT_URL ?? "" })
                soc.send(JSON.stringify({ credUrl: credentialInviteUrl }))
            }
        })
    })

    const app = express()

    app.get('/getProofStatus/:proofRecordId', async (req, res) => {
        const proofData = await getProofStatus(agent, req.params.proofRecordId)
        let token = ""
        if (proofData && process.env.JWT_SECRET) {
            token = signJWT(process.env.JWT_SECRET, { username: proofData })
        }
        res.send(token)
    })

    app.get('/getCredStatus/:credExchangeId', async (req, res) => {
        const credData = await getCredStatus(agent, req.params.credExchangeId)
        res.send(credData)
    })

    app.post('/exec', jsonParser, async (req, res) => {
        const token = req.headers.authorization
        const { command } = req.body

        const { username } = verifyJWT(process.env.JWT_SECRET ?? "", token ?? "")

        const splitCommand = command.split(" ")

        const proc = spawn("schroot", ["-c", "jammy", "-u", username, "--directory", "/", "--", ...splitCommand])
        let output = ""
        proc.stdout.on('data', (data) => {
            output += data
        })

        proc.stderr.on('data', (data) => {
            output += data
        })

        proc.on('close', () => {
            res.send(output)
        })
    })


    app.listen(8282)

}

start()