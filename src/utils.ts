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

export const makeQuestionLabels = () =>
  Array.from(Array(26))
    .map((e, i) => i + 'A'.charCodeAt(0))
    .map(x => String.fromCharCode(x)); // ["A", "B", "C", ... , "Z"]
