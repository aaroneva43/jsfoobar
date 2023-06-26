export const domains = {
  old: { uri: 'www.fortiwebcloud.com', api: 'https://api.fortiwebcloud.com/v2' },
  dev: { uri: 'www.fortiwebcloudmgt.com', api: 'https://api.fortiwebcloudmgt.com/v2' },
  dev_new: { uri: 'www.fortiweb-cloud-dev.com', api: 'https://api.fortiweb-cloud-dev.com/v2' },
  dev2_new: { uri: 'www.fortiweb-cloud-dev-02.com', api: 'https://api.fortiweb-cloud-dev-02.com/v2' },
  dev3_new: { uri: 'www.fortiweb-cloud-dev-03.com', api: 'https://api.fortiweb-cloud-dev-03.com/v2' },
  prod: { uri: 'www.fortiweb-cloud.com', api: 'https://api.fortiweb-cloud.com/v2' },
  qa: { uri: 'www.fortiweb-cloud-test.com', api: 'https://api.fortiweb-cloud-test.com/v2' },
  qa_new: { uri: 'www.fortiweb-cloud-qa.com', api: 'https://api.fortiweb-cloud-qa.com/v2' },
  poc: { uri: 'www.fortiweb-cloud-poc.com', api: 'https://api.fortiweb-cloud-poc.com/v2' },
  dev_private: { uri: 'dev.waasonline.com', api: 'https://api.dev.waasonline.com/v2' },
  qa_private: { uri: 'qa.waasonline.com', api: 'https://api.qa.waasonline.com/v2' },

  // 'poc_private': {uri: 'poc.waasonline.com', api: 'api.poc.waasonline.com'}, // poc private site
  c8: { uri: 'c8.waasonline.com', api: 'https://api.waasonline.com' },
  't-systems': { uri: 't-systems.waasonline.com', api: 'https://api.waasonline.com/v2' },
  poc_product: { uri: 'poc.waasonline.com', api: 'https://api.waasonline.com/v2' },
  emea1: { uri: 'emea1.waasonline.com', api: 'https://api.waasonline.com/v2' },
  tim: { uri: 'tim.waasonline.com', api: 'https://api.waasonline.com/v2' },
  tim_qa: { uri: 'release.waasonline.com', api: 'https://api.qa.waasonline.com/v2' },
  jisc: { uri: 'jisc.waasonline.com', api: 'https://api.waasonline.com/v2' },
  jisc_qa: { uri: 'jisc-qa.waasonline.com', api: 'https://api.qa.waasonline.com/v2' },
  c8_qa_new: { uri: 'c8.waasonline2.com', api: 'https://api.waasonline2.com/v2' },
  release_qa_new: { uri: 'release.waasonline2.com', api: 'https://api.waasonline2.com/v2' }, // c8 qa private site
} as const;

export const OEM_DOMAIN_MAP = {
  c8: ['c8', 'dev_private', 'qa_private', 'c8_qa_new', 'poc_private'],
  tim: ['tim', 'tim_qa'],
  release_qa_new: ['release_qa_new'],
  jisc: ['jisc', 'jisc_qa'],
  't-systems': ['t-systems'],
  poc_product: ['poc_product', 'emea1'],
} as const;

export const DOMAIN_URI_MAP = Object.keys(domains).reduce((acc, name) => Object.assign(acc, { name: domains[name].uri }), {});

export const DOMAIN_API_MAP = Object.keys(domains).reduce(
  (acc, name) => {
    const domain = domains[name];
    return Object.assign(acc, { [domain.uri]: domain.api });
  },
  { default: 'https://api.fortiwebcloudmgt.com/v2' },
);

export const DOMAINURI_OEM_MAP = Object.keys(DOMAIN_URI_MAP).reduce((acc, name) => {
  const oem = Object.keys(OEM_DOMAIN_MAP).find((oem) => OEM_DOMAIN_MAP[oem].includes(name)) || false;
  return Object.assign(acc, { [DOMAIN_URI_MAP[name]]: oem });
}, {});

export const getApiLocation = () => {
  return DOMAIN_API_MAP[window.location.hostname] || DOMAIN_API_MAP['default'];
};


