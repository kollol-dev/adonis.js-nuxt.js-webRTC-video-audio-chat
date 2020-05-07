import Vue from 'vue'
import store from './store'
import VueSocketIO from 'vue-socket.io'
import SocketIO from "socket.io-client"
 
Vue.use(new VueSocketIO({
    debug: true,
    connection: "http://video.appifylab.com",
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    },
    options: { path: "/my-app/" } //Optional options  
}))