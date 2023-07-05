import { storage } from '../../utils/storage';

export const isTemplate = ($state) => $state.includes('root.template');
export const isInTenant = () => !!storage.session.get('tenant_id');

