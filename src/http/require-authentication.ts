import { Middleware, ParameterizedContext } from 'koa';
import { User } from '../types/user';

type State = {
  user?: User,
  targetFragmentId?: string,
};

const constructRedirectUrl = (context: ParameterizedContext<State>) => {
  const result = context.request.headers.referer ?? '/';
  if (context.state.targetFragmentId) {
    return `${result}#${context.state.targetFragmentId}`;
  }
  return result;
};

export const requireAuthentication: Middleware<State> = async (context, next) => {
  if (!(context.state.user)) {
    context.session.successRedirect = constructRedirectUrl(context);
    context.redirect('/log-in');
    return;
  }

  await next();
};

export const redirectAfterAuthenticating = (): Middleware => (
  async (context, next) => {
    const successRedirect = context.session.successRedirect || '/';
    delete context.session.successRedirect;
    context.redirect(successRedirect);

    await next();
  }
);
