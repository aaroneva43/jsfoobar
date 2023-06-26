import type { ValuesOf } from '../../types';
import { DOMAINURI_OEM_MAP, DOMAIN_URI_MAP } from './domain';
export const ONLINE_HELP_CONTRACTS_URL = 'https://docs.fortinet.com/document/fortiweb-cloud/latest/user-guide/513177/contracts';

export const DEMO_USER_EMAIL = 'demo@fortiweb.com';

export const USER_ROLE = {
  MSSP: 'mssp_master',
  TENANT: 'mssp_tenant',
} as const;

export const USER_PERMISSION = {
  RW: 'rw',
  RO: 'ro',
  NONE: 'none',
} as const;
export type UserPermission = ValuesOf<typeof USER_PERMISSION>;

export const REGISTER_URL = {
  default: 'https://support-dev.corp.fortinet.com/Login/CreateAccount.aspx',
  [DOMAIN_URI_MAP['prod']]: 'https://support.fortinet.com/Login/CreateAccount.aspx',
} as const;

// page size set for paginator
export const PAGENATOR_SIZE_SET = [20, 50, 100] as const;

// page size set for paginatorSimple
export const PAGENATOR_SIMPLE_SIZE_SET = [10, 20, 30] as const;

export const FILE_COMPRESS_CONTENT_TYPE = [
  'text/plain',
  'text/html',
  'application/xml(or)text/xml',
  'application/soap+xml',
  'application/x-javascript',
  'text/css',
  'application/javascript',
  'text/javascript',
  'application/json',
  'application/rss+xml',
] as const;

export const CUSTOM_RULE_CONTENT_TYPE = ['text/plain', 'text/html', 'text/xml', 'application/xml', 'application/soap+xml', 'application/json'] as const;

// frontend signature category to backend value
export const BACKEND_SIG_NAME = {
  'Cross Site Scripting': 'Cross Site Scripting',
  'SQL Injection': 'SQL Injection',
  'SQL Injection (Syntax Based Detection)': 'SQL Injection (Syntax Based Detection)',
  'Generic Attacks': 'Generic Attacks',
  'Known Exploits': 'Known Exploits',
  Trojans: 'Trojans',
  'Server Information Disclosure': 'Server Information Disclosure',
  'Personally Identifiable Information': 'Personally Identifiable Information',
  'Known Bad Bots': 'Bad Robot',
} as const;

export const MAP_AREAS = {
  'Northeast Asia': ['China', 'Japan', 'Republic Of Korea'],
  'Southeast Asia': ['Thailand', 'Philippines', "Lao People'S Democratic Republic"],
} as const;

export const SYSLOG_FORMAT_TYPE = [
  { value: 'default', label: 'Default' },
  { value: 'custom', label: 'Custom' },
  { value: 'splunk', label: 'Splunk' },
  { value: 'cef0_arcsight', label: 'CEF:0(ArcSight)' },
  // {value: 'hpe_cef0', label: 'HPE ArcSight CEF:0'},
  { value: 'azure_oms', label: 'Microsoft Azure OMS' },
  { value: 'leef1_qradar', label: 'LEEF1.0(QRadar)' },
] as const;

export const SYSLOG_FACILITY_TYPE = [
  { value: 'local0', label: 'local0' },
  { value: 'local1', label: 'local1' },
  { value: 'local2', label: 'local2' },
  { value: 'local3', label: 'local3' },
  { value: 'local4', label: 'local4' },
  { value: 'local5', label: 'local5' },
  { value: 'local6', label: 'local6' },
  { value: 'local7', label: 'local7' },
] as const;

export const USER_TYPE = {
  NORMAL: 'Normal',
  BAE: 'BAE',
} as const;

export const MSSP_MODEL = {
  MSSP_SHARED: 'mssp_shared',
  MSSP_LICENSED: 'mssp_licensed',
  MSSP_PASSIVE: 'mssp_passive',
} as const;

export const PERM_MODULES = {
  ALL: 'all',
  GLOBAL_SETTING: 'global_setting',
  USER_TENANT: 'user_tenant',
  USER_ADMIN: 'user_admin',
  TEMPLATE: 'template',
  INCIDENT_MONITOR: '/incidents',
  WAF_GATEWAYS: '/wafgateways',
  ATTACK_LOGS: '/attacklogs',
} as const;
export type PermModule = ValuesOf<typeof PERM_MODULES>;

export const STATE_TO_MODULE: Record<string, PermModule> = {
  'root.settings': PERM_MODULES.GLOBAL_SETTING,
  'root.tenantmanagement': PERM_MODULES.USER_TENANT,
  'root.tenantmanagementAdd': PERM_MODULES.USER_TENANT,
  'root.adminmanagement': PERM_MODULES.USER_ADMIN,
  'root.templates': PERM_MODULES.TEMPLATE,
  'root.template': PERM_MODULES.TEMPLATE,
  'root.incidentMonitor': PERM_MODULES.INCIDENT_MONITOR,
  'root.wafgateways': PERM_MODULES.WAF_GATEWAYS,
  'root.attacklogs': PERM_MODULES.ATTACK_LOGS,
};

export const ML_ATTACK_TYPES = [
  'Cross Site Scripting',
  'SQL Injection',
  'Code Injection',
  'Command Injection',
  'Local(Remote) File Inclusion',
  'Common Injection',
  'Remote Exploits',
  'Remote File Inclusion',
  'noSQL Injection',
  'Server-Side Template Injection',
] as const;

export const URL_TYPES = [
  {
    value: 'string',
    label: 'String Match',
  },
  {
    value: 'regex',
    label: 'Regular Expression Match',
  },
] as const;

// MATCH_OPERATORS is 1 to 1 mapping with URL_TYPES
// MATCH_OPERATORS is used when field is 'operator', URL_TYPES is used when field is 'type'
export const MATCH_OPERATORS = [
  {
    value: 'STRING_MATCH',
    label: 'String Match',
  },
  {
    value: 'REGEXP_MATCH',
    label: 'Regular Expression Match',
  },
] as const;

export const SEARCH_TYPES = [
  {
    value: 'CVE_NUMBER',
    label: 'CVE Number',
  },
  {
    value: 'KEYWORDS',
    label: 'Keywords',
  },
  {
    value: 'ATTACK_CATEGORY',
    label: 'Attack Category',
  },
  {
    value: 'SIGNATURE_ID',
    label: 'Signature ID',
  },
  {
    value: 'SENSITIVITY_LEVEL',
    label: 'Sensitivity Level',
  },
] as const;

export const SERVER_TYPE = [
  {
    value: 'faz',
    label: 'FortiAnalyzer',
  },
  {
    value: 'syslog',
    label: 'SysLog',
  },
  {
    value: 'elasticsearch',
    label: 'ElasticSearch',
  },
] as const;

export const DOMAIN_NAME_VIOLATIONS = {
  NO_DOMAIN: 'NO_DOMAIN',
  FIRST_DOMAIN_WILDCARD: 'FIRST_DOMAIN_WILDCARD',
  UPPERCASE_LETTER: 'UPPERCASE_LETTER',
  INVALID_WILDCARD_DOMAIN: 'INVALID_WILDCARD_DOMAIN',
  INVALID_DOMAIN: 'INVALID_DOMAIN',
  NOT_SAME_ROOT: 'NOT_SAME_ROOT',
  DOMAIN_INCLUDE_OTHERS: 'DOMAIN_INCLUDE_OTHERS',
} as const;

export const LINKS = (() => {
  const oem = DOMAINURI_OEM_MAP[window.location.hostname];
  let links = {};

  switch (oem) {
    case 'c8':
      links = {
        COMPANY_URL: 'https://www.continent8.com',
        PRIVACY_POLICY_URL: 'https://www.continent8.com/terms-conditions/',
        TERM_SERVICE_URL: 'https://www.continent8.com/terms-conditions/',
        GDPR_URL: false,
        CONTACT_US_URL: 'https://www.continent8.com/contact-us/',
        ONLINE_HELP_URL: '/doc/c8/online_help/index.htm',
        API_DOC_URL: '/doc/c8/apidoc/api.html',
        FAQ_URL: 'https://c8.waasonline.com/root/applications',
      };
      break;

    case 'tim':
      links = {
        COMPANY_URL: 'https://www.tim.it/',
        PRIVACY_POLICY_URL: 'http://www.telecomitalia.com/tit/it/footer/Privacy.html',
        TERM_SERVICE_URL: 'https://www.timbusiness.it/sites/nuvola.impresasemplice.it/files/documenti/terms-of-use-nuvola-it-host-protection%20(4).pdf',
        GDPR_URL: 'https://www.tim.it/assistenza/per-i-consumatori/info-consumatori-fisso/news/novita-sulla-protezione-dati-personali-gdpr',
        CONTACT_US_URL: 'https://www.gruppotim.it/en/footer/contacts.html',
        ONLINE_HELP_URL: '/doc/tim/online_help/index.htm',
        API_DOC_URL: '/doc/tim/apidoc/api.html',
        FAQ_URL: 'https://docs.fortinet.com/document/fortiweb-cloud/latest/user-guide/655461/faqs',
      };
      break;

    case 'release_qa_new':
      links = {
        COMPANY_URL: 'https://www.tim.it/',
        PRIVACY_POLICY_URL: 'http://www.telecomitalia.com/tit/it/footer/Privacy.html',
        TERM_SERVICE_URL: 'https://www.timbusiness.it/sites/nuvola.impresasemplice.it/files/documenti/terms-of-use-nuvola-it-host-protection%20(4).pdf',
        GDPR_URL: 'https://www.tim.it/assistenza/per-i-consumatori/info-consumatori-fisso/news/novita-sulla-protezione-dati-personali-gdpr',
        CONTACT_US_URL: 'https://www.gruppotim.it/en/footer/contacts.html',
        ONLINE_HELP_URL: '/doc/tim/online_help/index.htm',
        API_DOC_URL: '/doc/tim/apidoc/api.html',
        FAQ_URL: 'https://docs.fortinet.com/document/fortiweb-cloud/latest/user-guide/655461/faqs',
      };
      break;

    case 'jisc':
      links = {
        COMPANY_URL: 'https://www.jisc.ac.uk',
        PRIVACY_POLICY_URL: 'https://www.jisc.ac.uk/website/privacy-notice',
        TERM_SERVICE_URL: 'https://assets.digitalmarketplace.service.gov.uk/g-cloud-12/documents/706762/252596149347821-terms-and-conditions-2020-07-14-0931.pdf',
        GDPR_URL: 'https://www.jisc.ac.uk/gdpr/gdpr-and-our-service-terms',
        CONTACT_US_URL: 'mailto:cloud@jisc.ac.uk',
        ONLINE_HELP_URL: 'https://jisc.waasonline.com/doc/jisc/index.htm',
        API_DOC_URL: 'https://apidoc.jisc.waasonline.com/',
        FAQ_URL: 'https://docs.fortinet.com/document/fortiweb-cloud/latest/user-guide/655461/faqs',
      };

    case 't-systems':
      links = {
        COMPANY_URL: 'https://www.t-systems.com',
        PRIVACY_POLICY_URL: 'https://www.t-systems.com',
        TERM_SERVICE_URL: 'https://www.t-systems.com',
        GDPR_URL: false,
        CONTACT_US_URL: 'https://offers.t-systemsus.com/home-page-contact-me',
        ONLINE_HELP_URL: 'https://docs.fortinet.com/document/fortiweb-cloud/latest/user-guide/',
        API_DOC_URL: '/apidoc/api.html',
        FAQ_URL: 'https://docs.fortinet.com/document/fortiweb-cloud/latest/user-guide/655461/faqs',
      };
      break;

    case 'poc_product':
      links = {
        COMPANY_URL: 'https://www.fortinet.com',
        PRIVACY_POLICY_URL: 'https://www.fortinet.com/corporate/about-us/privacy.html',
        TERM_SERVICE_URL: 'https://www.fortinet.com/corporate/about-us/legal.html',
        GDPR_URL: 'https://www.fortinet.com/corporate/about-us/gdpr.html',
        CONTACT_US_URL: 'https://www.fortinet.com/corporate/about-us/contact-us.html',
        ONLINE_HELP_URL: 'https://docs.fortinet.com/document/fortiweb-cloud/latest/user-guide/',
        API_DOC_URL: '/apidoc/api.html',
        FAQ_URL: 'https://docs.fortinet.com/document/fortiweb-cloud/latest/user-guide/655461/faqs',
      };

    default:
      links = {
        COMPANY_URL: 'https://www.fortinet.com',
        PRIVACY_POLICY_URL: 'https://www.fortinet.com/corporate/about-us/privacy.html',
        TERM_SERVICE_URL: 'https://www.fortinet.com/corporate/about-us/legal.html',
        GDPR_URL: 'https://www.fortinet.com/corporate/about-us/gdpr.html',
        CONTACT_US_URL: 'https://www.fortinet.com/corporate/about-us/contact-us.html',
        ONLINE_HELP_URL: 'https://docs.fortinet.com/document/fortiweb-cloud/latest/user-guide/',
        API_DOC_URL: '/apidoc/api.html',
        FAQ_URL: 'https://docs.fortinet.com/document/fortiweb-cloud/latest/user-guide/655461/faqs',
        CONTACTSUPPORT_URL: 'https://docs.fortinet.com/document/fortiweb-cloud/latest/user-guide/796808/contacting-customer-service',
      };
      break;
  }
})();
