import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer'
// //Declare IPFS
// const { create: ipfsClient }= require('ipfs-http-client')
// const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

const projectId='xxxxxx';
const projectSecret='xxxxxxxx';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const ipfs=create({host: 'ipfs.infura.io:5001', port: 5001, protocol: 'https',headers:{
  authorization:auth
},
apiPath:"/api/v0"})

class App extends Component {
  
  async componentWillMount(){
    await this.loadWeb3()
    await this.loadBlockChainData()
  }

  //load web3 library to connect frontend with blockchain
    async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockChainData(){
    const web3=window.web3
    //load account
    const accounts=await web3.eth.getAccounts()
    this.setState({account:accounts[0]})
    //get network id
    const networkId=await web3.eth.net.getId()
    //get network data
    const networkData=Decentragram.networks[networkId]
    if(networkData){
    const decentragram=new web3.eth.Contract(Decentragram.abi,networkData.address)
    this.setState({decentragram})
    const imagesCount=await Decentragram.methods.imagesCount().call()
    this.setState({imagesCount})
    //load image
    for (var i = 1; i <= imagesCount; i++) {
        const image = await decentragram.methods.images(i).call()
        this.setState({
          images: [...this.state.images, image]
        })
      }

    // Sort images. Show highest tipped images first
      this.setState({
        images: this.state.images.sort((a,b) => b.tipAmount - a.tipAmount )
      })

    this.setState({loading:false})
    }
    else{
      window.alert('Decentagram contract not deployed to network')
    }
  }
//capture file function
    captureFile = event => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  //upload image to ipfs
     uploadImage =async (description)=>   {
    console.log("Submitting file to ipfs...")
    //console.log(typeof this.state.buffer)
    //adding file to the IPFS
    //  ipfs.add(this.state.buffer, (error,result)=>{
    //   console.log(result);
    //   if(error) {
    //     console.error(error);
    //     return
    //   }
    //   this.setState({ loading: true })
    //   this.state.decentragram.methods.uploadImage(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
    //     this.setState({ loading: false })
    //   })
    // })
    try{
      const cid=await ipfs.add(this.state.buffer)
      console.log(cid)
      //this.setState({ loading: true })
      this.state.decentragram.methods.uploadImage(cid.hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    }
    catch(err){
      console.log(err)
    }
    // const id=ipfs.add(this.state.buffer);
    // console.log(id)
  }

  //tip image owner
  tipImageOwner(id, tipAmount) {
    this.setState({ loading: true })
    this.state.decentragram.methods.tipImageOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      decentragram:null,
      images:[],
      //loading:true //cant set the following to false.check line 45
    }

  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
            images={this.state.images}
            captureFile={this.captureFile}
            uploadImage={this.uploadImage}
            tipImageOwner={this.tipImageOwner}
            />
          }
      </div>
    );
  }
}

export default App;
// import React, { useState, useEffect } from 'react';
// import Web3 from 'web3';
// import Identicon from 'identicon.js';
// import './App.css';
// import Decentragram from '../abis/Decentragram.json';
// import Navbar from './Navbar';
// import Main from './Main';
// import { create } from 'ipfs-http-client';

// const projectId = '2QEO5EwQKOiXediYhXDbW2Q5dNn';
// const projectSecret = 'f0dca80af13ef4a49d052dbf919e5783';
// const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
// const ipfs = create({
//   host: 'ipfs.infura.io',
//   port: 5001,
//   protocol: 'https',
//   headers: {
//     authorization: auth,
//   },
//   apiPath: "/api/v0"
// });

// const App = () => {
//   const [account, setAccount] = useState('');
//   const [decentragram, setDecentragram] = useState(null);
//   const [imagesCount, setImagesCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [buffer, setBuffer] = useState(null);

//   useEffect(() => {
//     loadWeb3();
//     loadBlockchainData();
//   }, []);

//   const loadWeb3 = async () => {
//     if (window.ethereum) {
//       window.web3 = new Web3(window.ethereum);
//       await window.ethereum.enable();
//     } else if (window.web3) {
//       window.web3 = new Web3(window.web3.currentProvider);
//     } else {
//       window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
//     }
//   };

//   const loadBlockchainData = async () => {
//     const web3 = window.web3;
//     const accounts = await web3.eth.getAccounts();
//     setAccount(accounts[0]);

//     const networkId = await web3.eth.net.getId();
//     const networkData = Decentragram.networks[networkId];
//     if (networkData) {
//       const decentragram = new web3.eth.Contract(Decentragram.abi, networkData.address);
//       setDecentragram(decentragram);
//       const count = await decentragram.methods.imagesCount().call();
//       setImagesCount(count);
//       setLoading(false);
//     } else {
//       window.alert('Decentagram contract not deployed to network');
//     }
//   };

//   const captureFile = event => {
//     event.preventDefault();
//     const file = event.target.files[0];
//     const reader = new window.FileReader();
//     reader.readAsArrayBuffer(file);

//     reader.onloadend = () => {
//       const buffer = Buffer.from(reader.result);
//       setBuffer(buffer);
//       console.log('buffer', buffer);
//     };
//   };

//   const uploadImage = async description => {
//     console.log('Submitting file to IPFS...');
//     try {
//       const { cid } = await ipfs.add(buffer);
//       console.log(cid);
//       setLoading(true);
//       await decentragram.methods.uploadImage(cid.string, description).send({ from: account });
//       setLoading(false);
//     } catch (error) {
//       console.log(error);
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <Navbar account={account} />
//       {loading ? (
//         <div id="loader" className="text-center mt-5">
//           <p>Loading...</p>
//         </div>
//       ) : (
//         <Main captureFile={captureFile} uploadImage={uploadImage} />)}
//         </div>);
// }

// export default App;
