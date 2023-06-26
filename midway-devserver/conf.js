/* eslint-disable */
export default {
  /** gui dir -- will be set to '../' if left empty */
  proj: null,
  
  proj_dist: "http://127.0.0.1:9000",
  
  /** assets will be served on 4002 if left empty */
  dev_server_addr: "http://127.0.0.1:9000",
  
  // mock_server_addr: "http://127.0.0.1:3001",
  // api_server_addr: "http://127.0.0.1:3001",

  /** server_ip_addr is needed when DNS is not working */
  server_ip_addr: null,

  /** w2 proxy rules -- see: ./whistle/profiles/ -- customize as needed */
  w2_profile: "fwbcloud",

  publish: {
    to: {
      publish_server_addr: "66.42.50.13",
      publish_server_port: 5445,
      token: "WmQNoHp1maXaKXzn",
      username: "admin",
      password: "985849"
    },
    info: {
      project: null,
      developer: 'anonymous',
    },
    portal: {
      project: null,
      developer: 'anonymous',
    }
  },
  run_frp_portal: false
};