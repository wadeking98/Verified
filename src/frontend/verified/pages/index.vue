<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">
          Welcome to verified.htb
        </v-card-title>
        <v-card-text>
          <p>
            Verified.htb is providing demo access to it's verifiable credential infrastructure.
          </p>
          <p>To start the demo, simply copy the below invitation into your holder agent. Verified.htb will then send you
            your first verifiable credential!</p>
          <p v-if="!done">After you receive your credential click continue to access the user portal</p>
          <p v-else>Congratulations! You've received your first verifiable credential. You may now continue to the user
            portal</p>
          <div class="center">
            <v-btn v-if="!credId" @click="copy" color="primary">Copy invitation URL</v-btn>
            <v-progress-circular v-else-if="credId && !done" indeterminate color="primary"></v-progress-circular>
            <v-btn v-else color="success" nuxt to="/proof"> Continue </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      invitationLink: "",
      credId: "",
      conn: null,
      done: false,
      interval: 0
    }
  },
  methods: {
    copy() {
      navigator.clipboard.writeText(this.invitationLink)
    },
    async checkCred() {
      if (this.credId) {
        const resp = await this.$axios.get(`http://localhost/api/getCredStatus/${this.credId}`)
        this.done = resp.data === "done"
        if (this.done) {
          clearInterval(this.interval)
        }
      }
    }
  },
  mounted() {
    this.interval = setInterval(() => {
      this.checkCred()
    }, 2000)

    this.conn = new WebSocket("ws://localhost:7777")
    this.conn.onmessage = (event) => {
      const { credUrl, credId } = JSON.parse(event.data)
      if (credUrl) {
        this.invitationLink = credUrl
      }

      if (credId) {
        this.credId = credId
      }

    }
    this.conn.onopen = () => {
      this.conn.send("cred")
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
}
</style>
