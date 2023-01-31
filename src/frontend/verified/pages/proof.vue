<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">
          Congratulations!
        </v-card-title>
        <v-card-text>
          <p>
            If you followed the previous step, you should now have your first verifiable credential!
          </p>
          <p>Now we're going to use the credential that we just got to authenticate to the user portal</p>
          <p>When you're ready click the button below to copy your invitation URL and prove your identity using your
            credential.</p>
          <p v-if="!done">After you verify your identity, you will be able to proceed to the user portal</p>
          <p v-else>Congratulations, you've verified your identity using verifiable credentials, you may not continue</p>
          <div class="center">
            <v-btn v-if="!proofId" @click="copy" color="primary">Copy invitation URL</v-btn>
            <v-progress-circular v-else-if="proofId && !done" indeterminate color="primary"></v-progress-circular>
            <v-btn v-else color="success" nuxt to="/portal"> Continue </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'ProofPage',
  data() {
    return {
      invitationLink: "",
      proofId: "",
      token: "",
      interval: 0,
      conn: null,
      done: false
    }
  },
  methods: {
    copy() {
      navigator.clipboard.writeText(this.invitationLink)
    },
    async checkProof() {
      if (this.proofId) {
        const resp = await this.$axios.get(`http://localhost/api/getProofStatus/${this.proofId}`)
        const token = resp.data
        if (token) {
          this.token = token
          clearInterval(this.interval)
          localStorage.setItem("token", token)
          this.done = true
        }
      }
    }
  },
  mounted() {

    this.interval = setInterval(() => {
      this.checkProof()
    }, 2000)

    this.conn = new WebSocket("ws://localhost:7777")
    this.conn.onopen = () => {
      this.conn.send("proof")
    }
    this.conn.onmessage = (event) => {
      const { proofUrl, proofId } = JSON.parse(event.data)
      if (proofUrl) {
        this.invitationLink = proofUrl
      }

      if (proofId) {
        this.proofId = proofId
      }

    }
  },
  beforeDestroy() {
    clearInterval(this.interval)
    this.conn.close()
  }
}
</script>

<style>
.center {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
