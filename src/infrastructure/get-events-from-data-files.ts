import { Buffer } from 'buffer';
import fs from 'fs';
import csvParseSync from 'csv-parse/lib/sync';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { taskify } from 'fp-ts/TaskEither';
import { constant, flow, pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import { DateFromISOString } from 'io-ts-types';
import { DoiFromString } from '../types/codecs/DoiFromString';
import { ReviewIdFromString } from '../types/codecs/ReviewIdFromString';
import { DomainEvent, editorialCommunityReviewedArticle } from '../types/domain-events';
import { GroupId } from '../types/group-id';

const reviews = t.readonlyArray(t.tuple([
  DateFromISOString,
  DoiFromString,
  ReviewIdFromString,
]));

export const getEventsFromDataFiles = (
  editorialCommunityIds: RNEA.ReadonlyNonEmptyArray<GroupId>,
): TE.TaskEither<unknown, RNEA.ReadonlyNonEmptyArray<DomainEvent>> => pipe(
  editorialCommunityIds,
  RNEA.map((editorialCommunityId) => pipe(
    `./data/reviews/${editorialCommunityId.value}.csv`,
    taskify(fs.readFile),
    T.map(E.orElse(() => E.right(Buffer.from('')))), // TODO skip files that don't exist
    T.map(E.chainW((fileContents) => pipe(
      csvParseSync(fileContents, { fromLine: 2 }),
      reviews.decode,
    ))),
    TE.map(RA.map(([date, articleDoi, reviewId]) => editorialCommunityReviewedArticle(
      editorialCommunityId,
      articleDoi,
      reviewId,
      date,
    ))),
  )),
  TE.sequenceArray,
  TE.map(RA.flatten),
  T.map(E.chainW(flow(
    RNEA.fromReadonlyArray,
    E.fromOption(constant('No events found')),
  ))),
);
