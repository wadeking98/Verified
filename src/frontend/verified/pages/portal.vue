<template>
    <v-row justify="center" align="center">
        <v-col cols="12" sm="8" md="6">
            <v-card>
                <v-card-title class="headline">
                    Welcome to verified.htb user portal
                </v-card-title>
                <v-card-text>
                    <p>
                        You have successfully authenticated with your verifiable credential and you now have access to
                        the verified.htb user portal
                    </p>
                    <p>This portal allows you to execute commands in a jailed environment as the user defined in
                        your credential</p>
                    <p>Simply enter the command you want to run and press the RUN button below</p>
                    <v-text-field clearable label="command" v-model="command"></v-text-field>
                    <v-textarea v-if="output" label="output" readonly filled auto-grow :value="output"></v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="exec" color="primary"> RUN </v-btn>
                </v-card-actions>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
export default {
    name: 'PortalPage',
    data() {
        return {
            token: "",
            command: "",
            output: ""
        }
    },
    methods: {
        exec() {
            this.$axios.post('http://localhost/api/exec', { command: this.command }, { headers: { 'Authorization': this.token } }).then(res => {
                this.output = res.data
            })
        }
    },
    mounted() {
        const token = localStorage.getItem('token')
        if (!token) {
            this.$router.push('/')
        } else {
            this.token = token
        }
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
