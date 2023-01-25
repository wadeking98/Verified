import {
    Agent,
    ConnectionEventTypes,
    ConnectionStateChangedEvent,
    DidExchangeState,
    HttpOutboundTransport,
    InitConfig,
    OutOfBandRecord
} from '@aries-framework/core'
import * as express from 'express'
import { startServer } from '@aries-framework/rest'
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
    agent.registerInboundTransport(new HttpInboundTransport({ port: inPort }))

    // Function to initialize the agent
    await agent.initialize().catch(console.error)

    return agent
}

const schemaID = (schema: typeof schemaTemplate, did: string): string => {
    return `${did}:2:${schema.name}:${schema.version}`
}

export const initServer = (agent: Agent, port: number) => {
    startServer(agent, { port })
}

export const register = async (issuer: Agent, schema: any) => {
    const schemaExists = await issuer.ledger.getSchema(schemaID(schema, issuer.publicDid?.did ?? ""))
    let ledgerSchema = schemaExists
    if (!ledgerSchema) {
        ledgerSchema = await issuer.ledger.registerSchema(schema)
        console.log(`Schema published to ledger: ${ledgerSchema.id}`)
    } else {
        console.log(`Schema found on ledger: ${ledgerSchema.id}`)
    }
    const credDef = await issuer.ledger.registerCredentialDefinition({ schema: ledgerSchema, supportRevocation: false, tag: "Login Credential" })
    console.log(`Credential definition published to ledger: ${credDef.id}`)
    return ledgerSchema
}

