import {KalturaKeyValue} from './providers/response-types';

export const getKeyValue = (kalturaKeyValueArray: KalturaKeyValue[], key: string): string => {
  const kalturaKeyValue: KalturaKeyValue | undefined = kalturaKeyValueArray.find(item => {
    return item.key === key;
  });
  return kalturaKeyValue?.value || '';
};

export const generateKeyValue = (key: string, value: any): KalturaKeyValue => {
  return {key, value, objectType: 'KalturaKeyValue'};
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

/**
 * Process the input text to wrap URLs in HTML anchor tags (<a>).
 *
 * This function performs two main tasks:
 * 1. It converts patterns of the form `[title|url]` into clickable links with the provided title.
 * 2. It wraps standalone URLs in clickable links.
 *
 * Example:
 * - Input: "[my title | http://example.com]"
 *   Output: "<a target='_blank' href='http://example.com'>my title</a>"
 *
 * - Input: "http://example.com"
 *   Output: "<a target='_blank' href='http://example.com'>http://example.com</a>"
 *
 * @param text - The input string containing potential URLs or patterns to be converted.
 * @returns The processed string with URLs wrapped in <a> tags.
 */
export const wrapLinksWithTags = (text: string): string => {
  // Replace the pattern [title|url] with <a> tags
  const wrapLinksWithTitle = text.replace(/\[(\s+)?([^\|\]]*)(\|)(\s+)?((https?|ftps?):\/\/[^\s\]]+)(\s+)?(\])/gi, (url: string): string => {
    const linkInfo = url.slice(1, -1).split('|');
    const title = linkInfo[0].trim();
    const href = linkInfo[1].trim();
    return `<a target="_blank" href="${href}">${title}</a>`;
  });

  // Replace standalone URLs with <a> tags
  return wrapLinksWithTitle.replace(/((https?|ftps?):\/\/[^\s"<\]]+)(?![^<>]*>|[^"]*<\/a>)/gi, (url: string): string => {
    return `<a target="_blank" href="${url}">${url}</a>`;
  });
};
