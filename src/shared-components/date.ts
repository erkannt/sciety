import { HtmlFragment, toHtmlFragment } from '../types/html-fragment';

const textFormatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const toString = (date: Date) => date.toISOString().split('T')[0];
const toDisplayString = (date: Date) => date.toLocaleDateString('en-US', textFormatOptions);

export const templateDate = (date: Date, className?: string): HtmlFragment => {
  const classNameAttribute = className ? ` class="${className}"` : '';
  return toHtmlFragment(`<time datetime="${toString(date)}"${classNameAttribute}>${toDisplayString(date)}</time>`);
};
