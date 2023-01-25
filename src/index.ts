import { initAgent, initServer, register } from './helpers/helpers'
import { issuerConfig } from './issuer/issuer'
import { verifierConfig } from './verifier/verifier'
import * as schema from './schema/schema.json'





const start = async () => {
    // init agents

    const issuer = await initAgent(issuerConfig, 5000)
    const verifier = await initAgent(verifierConfig, 5001)

    await register(issuer, schema)


    console.log("Starting issuer server...")
    initServer(issuer, 8282)

    console.log("Starting verifier server...")
    initServer(verifier, 8383)
}

start()