App={
    load:async ()=>{
        console.log("app loading...");
        await App.loadWeb3()
    }
}
$(()=>{
    $(window).load(()=>{
        App.load()
    })
})