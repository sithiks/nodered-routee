const Nexmo = require('nexmo');
const axios = require('axios');
const mustache = require("mustache");
const version = require('../package.json').version



module.exports = function (RED) {
  
   function sendsms(config){
    RED.nodes.createNode(this, config);
    this.creds = RED.nodes.getNode(config.creds);
    this.unicode = config.unicode;
    var node = this;
    
    node.on('input', async function (msg) {
      var debug = (this.context().global.get('nexmoDebug') | false);
      var data = dataobject(this.context(), msg)
      this.to = mustache.render(config.to, data);
      this.fr = mustache.render(config.fr, data);
      this.text = mustache.render(config.text, data);
      // const nexmo = new Nexmo({
      //   apiKey: this.creds.credentials.apikey,
      //   apiSecret: this.creds.credentials.apisecret
      // }, {debug: debug, appendToUserAgent: "nexmo-nodered/"+version}
      // );
      const smsInfo = {
        body: config.text,
        to: config.to,
        from: config.fr,
      };
      const smsToken =  await formHeaders();
      const headers = {
        authorization: `Bearer ${smsToken}`,
        "content-type": "application/json",
      };
      const { data } = await axios.post(
        "https://connect.routee.net/sms",
        smsInfo,
        { headers }
      );
      
      // const opts = {}
      // if (this.unicode == true){
      //   opts.type = "unicode";
      // } else{
      //   opts.type = "text";
      // }
      // nexmo.message.sendSms(this.fr, this.to, this.text, opts, function(err, response){
      //   if(err) { console.error(err); }
      //   else {
      //     msg.payload=response;
      //     node.send(msg)  
      //   }
      // })
    });  
    const formHeaders = async () => {
      try {
        const { data } = await axios.post(
          "https://auth.routee.net/oauth/token",
          new URLSearchParams({ grant_type: "client_credentials" }),
          { auth: {
              username: 'Basic NWY5MTM4Mjg4YjcxZGUzNjE3YTg3Y2QzOlJTajY5akxvd0o=',
              password: 'Fxf2ip6urG'
          } }
        );
        return data.access_token;
      } catch (error) {
        throw Error("Unable to get access Token");
      }
    };
  }
  

  RED.nodes.registerType("sendsms",sendsms);    
}

function dataobject(context, msg){
  data = {}
  data.msg = msg;
  data.global = {};
  data.flow = {};
  g_keys = context.global.keys();
  f_keys = context.flow.keys();
  for (k in g_keys){
    data.global[g_keys[k]] = context.global.get(g_keys[k]);
  };
  for (k in f_keys){
    data.flow[f_keys[k]] = context.flow.get(f_keys[k]);
  };
  return data
}
