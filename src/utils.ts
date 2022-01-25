import {KalturaKeyValue} from './providers/response-types';

export const getKeyValue = (kalturaKeyValueArray: KalturaKeyValue[], key: string): string => {
  const kalturaKeyValue: KalturaKeyValue | undefined = kalturaKeyValueArray.find(item => {
    return item.key === key;
  });
  return kalturaKeyValue?.value || '';
};

export const stringToBoolean = (value: string) => {
  return value === 'true';
};
