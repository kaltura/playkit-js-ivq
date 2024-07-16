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

export const isNumber = (value: unknown) => {
  return typeof value === 'number';
};

export const makeQuestionLabels = () =>
  Array.from(Array(26))
    .map((e, i) => i + 'A'.charCodeAt(0))
    .map(x => String.fromCharCode(x)); // ["A", "B", "C", ... , "Z"]

//Search for links and links patterns ( [text|http://exampl.com] ) and add a real link to a new tab
export const wrapLinksWithTags = (text: string): string => {
  const wrapLinksWithTitle = text.replace(/\[(\s+)?([^\|\]]*)(\|)(\s+)?((https?|ftps?):\/\/[^\s\]]+)(\s+)?(\])/gi, (url: string): string => {
    const updatedUrl = url.slice(1, -1).split('|');
    const title = updatedUrl[0].trim();
    const href = updatedUrl[1].trim();
    return `<a target="_blank" href="${href}">${title}</a>`;
  });

  return wrapLinksWithTitle.replace(/((https?|ftps?):\/\/[^"<\s]+)(?![^<>]*>|[^"]*?<\/a)/gi, (url: string): string => {
    return `<a target="_blank" href="${url}">${url}</a>`;
  });
};
