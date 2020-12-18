import { Result } from 'true-myth';
import { HtmlFragment, toHtmlFragment } from '../../types/html-fragment';

export type RenderPage = (filename: string) => Promise<Result<{
  title: string,
  content: HtmlFragment,
}, never>>;

export type GetHtml = (filename: string) => Promise<string>;

export default (
  getHtml: GetHtml,
): RenderPage => async (filename) => Result.ok({
  title: 'Community and Outreach Manager',
  content: toHtmlFragment(`
    <div class="about-page-wrapper">
      <header class="page-header">
        <h1>
          Community and Outreach Manager
        </h1>
      </header>
      ${await getHtml(filename)}
    </div>
  `),
});