import fetch from "node-fetch";


const handlePortalAPIs = async (req, res, cfg) => {
  const {publish_server_addr, username, password} = cfg;
  
  if (/.*\/connections/.test(req.path)) {
    const conn = await fetch(`http://${publish_server_addr}:6443/api/proxy/tcp`, {
      headers: {
        Authorization: `Basic ${btoa(username + ':' + password)}`,
      },
    }).then((r) => r.json());
    
    return conn;
  }
  
};

export default handlePortalAPIs;
