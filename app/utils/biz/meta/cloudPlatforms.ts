export const CLOUD_PLATFORMS = {
  PLAT_AWS: {
    value: 'AWS',
    label: 'Amazon Web Service',
    marketUrl: 'https://aws.amazon.com/marketplace/pp/B07PXMWJT1',
  },
  PLAT_MAZ: {
    value: 'Azure',
    label: 'Microsoft Azure',
    marketUrl: 'https://azuremarketplace.microsoft.com/en-us/marketplace/apps/fortinet.fortinet_waas?tab=Overview',
  },
  PLAT_GCP: {
    value: 'GCP',
    label: 'Google Cloud Platform',
    marketUrl: 'https://console.cloud.google.com/marketplace/details/fortigcp-project-001/fortiwebsaas',
  },
  PLAT_FDC: {
    value: 'FDC',
    label: 'Fortinet Data Center',
  },
  PLAT_C8T: {
    value: 'C8T',
    label: 'Continent 8 Technologies',
  },
  PLAT_OCI: {
    value: 'OCI',
    label: 'Oracle Cloud Infrastructure',
    marketUrl: 'https://cloudmarketplace.oracle.com/marketplace/en_US/adf.task-flow?adf.tfDoc=/WEB-INF/taskflow/adhtf.xml&adf.tfId=adhtf&application_id=90733279&appversion_id=90733280',
  },
} as const;
