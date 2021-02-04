import { Middleware } from '@koa/router';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { NOT_FOUND } from 'http-status-codes';
import { renderErrorPage } from './render-error-page';
import { applyStandardPageLayout } from '../shared-components/apply-standard-page-layout';
import { toHtmlFragment } from '../types/html-fragment';
import { User } from '../types/user';

export const routeNotFound: Middleware<{ user: User | undefined }> = async (context, next) => {
  const user = O.fromNullable(context.state.user);
  // eslint-disable-next-line no-underscore-dangle
  if (context._matchedRoute === undefined) {
    context.status = NOT_FOUND;
    context.body = pipe(
      {
        title: 'Page not found | Sciety',
        content: renderErrorPage(toHtmlFragment('Page not found.')),
      },
      applyStandardPageLayout(user),
    );
  }
  await next();
};