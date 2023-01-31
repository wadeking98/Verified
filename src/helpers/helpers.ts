import {
    Agent,
    AutoAcceptCredential,
    AutoAcceptProof,
    ConnectionEventTypes,
    ConnectionInvitationMessage,
    ConnectionStateChangedEvent,
    DidExchangeState,
    HandshakeProtocol,
    HttpOutboundTransport,
    InitConfig,
    OutOfBandRecord,
    ProofRecord
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import * as schemaTemplate from '../schema/schema.json'
import * as jwt from 'jsonwebtoken'
import * as ws from 'ws'

export const initAgent = async (config: InitConfig, inPort: number) => {

    // Creating an agent instance
    const agent = new Agent(
        config,
        agentDependencies
    )

    // Registering the required in- and outbound transports
    agent.registerOutboundTransport(new HttpOutboundTransport())
    const httpInbound = new HttpInboundTransport({ port: inPort })
    agent.registerInboundTransport(httpInbound)

    // Function to initialize the agent
    await agent.initialize().catch(console.error)

    httpInbound.app.get('/', async (req, res) => {
        if (typeof req.query.c_i === 'string') {
            try {
                const invitation = await ConnectionInvitationMessage.fromUrl(req.url.replace('d_m=', 'c_i='))
                res.send(invitation.toJSON())
            } catch (error) {
                res.status(500)
                res.send({ detail: 'Unknown error occurred' })
            }
        }
    })

    return agent
}

const schemaID = (schema: typeof schemaTemplate, did: string): string => {
    return `${did}:2:${schema.name}:${schema.version}`
}

export const createCredentialInvitation = async (agent: Agent, credDef: string, soc?: ws) => {
    const oob = await agent.oob.createInvitation({ handshake: true, handshakeProtocols: [HandshakeProtocol.Connections], multiUseInvitation: true, autoAcceptConnection: true })
    setupConnectionListener(agent, oob, (connId) => { issueCredential(agent, credDef, connId, soc) })
    return oob
}

export const createProofInvitation = async (agent: Agent, credDef: string, soc?: ws) => {
    const oob = await agent.oob.createInvitation({ handshake: true, handshakeProtocols: [HandshakeProtocol.Connections], multiUseInvitation: true, autoAcceptConnection: true })
    setupConnectionListener(agent, oob, (connId) => { issueProof(agent, credDef, connId, soc) })
    return oob
}

const issueProof = async (agent: Agent, credDef: string, connId: string, soc?: ws) => {
    console.log(`Requesting proof from connection: ${connId}`)
    const proofRecord = await agent.proofs.requestProof(connId, {
        requestedAttributes: {
            group1: {
                name: 'username',
                restrictions: [{ credentialDefinitionId: credDef }]
            }
        },
    })
    soc?.send(JSON.stringify({ proofId: proofRecord.id }))
}

export const getProofStatus = async (agent: Agent, proofRecordId: string): Promise<string> => {
    const proofRecord = await agent.proofs.getById(proofRecordId)
    if (proofRecord && proofRecord.isVerified) {
        const b64Data = proofRecord.presentationMessage?.presentationAttachments?.[0].data?.base64
        if (b64Data) {
            const text = Buffer.from(b64Data, 'base64').toString('utf-8')
            const dataObj = JSON.parse(text)
            return dataObj.requested_proof.revealed_attrs.group1.raw
        }
    }
    return ""
}

export const getCredStatus = async (agent: Agent, credExchangeId: string): Promise<string> => {
    const credRecord = await agent.credentials.getById(credExchangeId)
    if (credRecord) {
        return credRecord.state
    }
    return ""
}

export const signJWT = (jwtKey: string, cred: { username: string }): string => {
    const token = jwt.sign(cred, jwtKey, { expiresIn: "24h" })
    return token
}

export const verifyJWT = (jwtKey: string, jwtToken: string) => {
    const token = jwt.verify(jwtToken, jwtKey)
    return token as jwt.JwtPayload
}

const issueCredential = async (agent: Agent, credDef: string, connId: string, soc?: ws) => {
    console.log(`Issuing credential to connection: ${connId}`)
    const credentialRecord = agent.credentials.offerCredential({
        protocolVersion: 'v1',
        connectionId: connId,
        credentialFormats: {
            indy: {
                credentialDefinitionId: credDef,
                attributes: [
                    { name: 'username', value: 'guest' },
                    { name: 'expiry_date', value: '' }
                ]
            }
        },
        autoAcceptCredential: AutoAcceptCredential.Always
    })
    soc?.send(JSON.stringify({ credId: (await credentialRecord).id }))
}

const setupConnectionListener = (agent: Agent, outOfBandRecord: OutOfBandRecord, cb: (...args: any) => void) => {
    agent.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, ({ payload }) => {
        if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return
        if (payload.connectionRecord.state === DidExchangeState.Completed) {
            // the connection is now ready for usage in other protocols!

            // Custom business logic can be included here
            // In this example we can send a basic message to the connection, but
            // anything is possible
            cb(payload.connectionRecord.id)

        }
    })
}


export const register = async (issuer: Agent, schema: any) => {
    const schemaName = schemaID(schema, issuer.publicDid?.did ?? "")
    let ledgerSchema
    try {
        ledgerSchema = await issuer.ledger.getSchema(schemaName)
    } catch {
        // pass
    }
    if (!ledgerSchema) {
        ledgerSchema = await issuer.ledger.registerSchema(schema)
        console.log(`Schema published to ledger: ${schemaName}`)
    } else {
        console.log(`Schema found on ledger: ${schemaName}`)
    }
    const credDef = await issuer.ledger.registerCredentialDefinition({ schema: ledgerSchema, supportRevocation: false, tag: "Login Credential" })
    console.log(`Credential definition published to ledger: ${credDef.id}`)
    return { schema: ledgerSchema.id, credDef: credDef.id }
}

