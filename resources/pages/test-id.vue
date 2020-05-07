<template>
  <section class="container">
    <img src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo" />
    <h1 class="title">
      Universal Vue.js Applications Framework
    </h1>
    <button @click="onClickAudioCall">Audio Call</button>
    <button @click="onClickVideoCall">Video Call</button>
    <div class="col-12 col-sm-6 d-flex justify-content-center">
        <div class="embed-responsive embed-responsive-16by9">
            <video class="embed-responsive-item" muted></video>
        </div>
    </div>
    <div class="col-12 col-sm-6 d-flex justify-content-center">
        <div id="peerDiv" class="embed-responsive embed-responsive-16by9">
        </div>
    </div>
  </section>
</template>
<script>
import Peer from 'simple-peer'
let client = {}
let currentFilter
import io from "socket.io-client";
var socket = io.connect("http://localhost:3000");
export default {
  data(){
    return {
      text: ''
    }
  },

  methods: {


    async onClickAudioCall(){
      const io = socket('http://localhost');
      try {
          const stream = await this.openMediaDevices({'video':false,'audio':true});
          console.log('Got Audio Stream:', stream);
          const audioDevices = await this.getConnectedDevices('audioinput');
          console.log('Audio Device found:', audioDevices)

          navigator.mediaDevices.addEventListener('devicechange', event => {
              const newCameraList = this.getConnectedDevices('audio');
              this.updateAudioDeviceList(newCameraList);
          });
      } catch(error) {
          console.error('Error accessing media devices.', error);
          alert('No audio found!')
      }
    },

    async onClickVideoCall(){
      try {
          const stream = await this.openMediaDevices({'video':true,'audio':true});
          console.log('Got video Stream:', stream);
          const videoDevices = await this.getConnectedDevices('videoinput');
          console.log('video device found:', videoDevices)

          navigator.mediaDevices.addEventListener('devicechange', event => {
              const newCameraList = this.getConnectedDevices('video');
              this.updateVideoDeviceList(newCameraList);
          });

      } catch(error) {
          console.error('Error accessing media devices.', error);
          alert('No Video found!')
      }
    },
    // open media device
    async openMediaDevices(constraints) {
        return navigator.mediaDevices.getUserMedia(constraints);
    },

    // get connected device list
    async getConnectedDevices(type) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === type)
    },

    updateAudioDeviceList(audioDeviceLists){
          console.log('Audio Device changes:', audioDeviceLists)
    },

    updateVideoDeviceList(videoDeviceLists){
          console.log('video device changes:', videoDeviceLists)
    },

    //used to initialize a peer
    InitPeer(type) {
        let peer = new Peer({ initiator: (type == 'init') ? true : false, stream: stream, trickle: false })
        peer.on('stream', function (stream) {
            this.CreateVideo(stream)
        })
        //This isn't working in chrome; works perfectly in firefox.
        peer.on('close', function () {
            document.getElementById("peerVideo").remove();
            peer.destroy()
        })
        peer.on('data', function (data) {
            let decodedData = new TextDecoder('utf-8').decode(data)
            let peervideo = document.querySelector('#peerVideo')
            peervideo.style.filter = decodedData
        })
        return peer
    },

    //for peer of type init
    MakePeer() {
        client.gotAnswer = false
        let peer = this.InitPeer('init')
        peer.on('signal', function (data) {
            if (!client.gotAnswer) {
                socket.emit('Offer', data)
            }
        })
        client.peer = peer
    },
    CreateVideo(stream) {
        this.CreateDiv()

        let video = document.createElement('video')
        video.id = 'peerVideo'
        video.srcObject = stream
        video.setAttribute('class', 'embed-responsive-item')
        document.querySelector('#peerDiv').appendChild(video)
        video.play()
        //wait for 1 sec
        setTimeout(() => SendFilter(currentFilter), 1000)

        video.addEventListener('click', () => {
            if (video.volume != 0)
                video.volume = 0
            else
                video.volume = 1
        })

    },

     //for peer of type not init
    FrontAnswer(offer) {
        let peer = this.InitPeer('notInit')
        peer.on('signal', (data) => {
            // socket.emit('Answer', data)
        })
        peer.signal(offer)
        client.peer = peer
    },

    SignalAnswer(answer) {
        client.gotAnswer = true
        let peer = client.peer
        peer.signal(answer)
    },


    RemovePeer() {
        document.getElementById("peerVideo").remove();
        document.getElementById("muteText").remove();
        if (client.peer) {
            client.peer.destroy()
        }
    },

    CreateDiv() {
        let div = document.createElement('div')
        div.id = "muteText"
        div.innerHTML = "Click to Mute/Unmute"
        document.querySelector('#peerDiv').appendChild(div)
        if (checkboxTheme.checked == true)
            document.querySelector('#muteText').style.color = "#fff"
    },

    
  }
}

</script>
<style scoped>
.title
{
  margin: 50px 0;
}
</style>
