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

export const createCredentialInvitation = async (agent: Agent, credDef: string) => {
    const oob = await agent.oob.createInvitation({ handshake: true, handshakeProtocols: [HandshakeProtocol.Connections], multiUseInvitation: true, autoAcceptConnection: true })
    setupConnectionListener(agent, oob, (connId) => { issueCredential(agent, credDef, connId) })
    return oob
}

export const createProofInvitation = async (agent: Agent, credDef: string) => {
    const oob = await agent.oob.createInvitation({ handshake: true, handshakeProtocols: [HandshakeProtocol.Connections], multiUseInvitation: true, autoAcceptConnection: true })
    setupConnectionListener(agent, oob, (connId) => { issueProof(agent, credDef, connId) })
    return oob
}

const issueProof = async (agent: Agent, credDef: string, connId: string): Promise<ProofRecord> => {
    console.log(`Requesting proof from connection: ${connId}`)
    const proofRecord = await agent.proofs.requestProof(connId, {
        requestedAttributes: {
            group1: {
                name: 'username',
                restrictions: [{ credentialDefinitionId: credDef }]
            }
        },
    })
    console.log(proofRecord.id)
    return proofRecord
}

const issueCredential = async (agent: Agent, credDef: string, connId: string) => {
    console.log(`Issuing credential to connection: ${connId}`)
    agent.credentials.offerCredential({
        protocolVersion: 'v1',
        connectionId: connId,
        credentialFormats: {
            indy: {
                credentialDefinitionId: credDef,
                attributes: [
                    { name: 'username', value: 'nobody' },
                    { name: 'expiry_date', value: '' }
                ]
            }
        },
        autoAcceptCredential: AutoAcceptCredential.Always
    })
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

