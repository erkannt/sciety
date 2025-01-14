import { HtmlFragment } from './html-fragment';

export type RenderPageError = {
  type: 'not-found' | 'unavailable',
  message: HtmlFragment,
};
