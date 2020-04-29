import { BAD_REQUEST, SEE_OTHER } from 'http-status-codes';
import request from 'supertest';
import createServer from './server';
import Doi from '../../src/data/doi';
import createReviewReferenceRepository from '../../src/data/review-references';

describe('reviews handler', (): void => {
  it.each([
    '10.5281/zenodo.3678326',
    'doi:10.5281/zenodo.3678326',
    'http://dx.doi.org/10.5281/zenodo.3678326',
    'https://dx.doi.org/10.5281/zenodo.3678326',
    'http://doi.org/10.5281/zenodo.3678326',
    'https://doi.org/10.5281/zenodo.3678326',
  ])('returns a created response (%s)', async (reviewDoi: string): Promise<void> => {
    const articleDoi = '10.1101/2000.1234';
    const response = await request(createServer())
      .post('/reviews')
      .type('form')
      .send({ articledoi: articleDoi, reviewdoi: reviewDoi });

    expect(response.status).toBe(SEE_OTHER);
    expect(response.header.location).toBe(`/articles/${articleDoi}`);
  });

  it.skip.each([
    ['10.5281/zenodo.3678326', '10.5281/zenodo.3678326'],
    ['doi:10.5281/zenodo.3678326', '10.5281/zenodo.3678326'],
    ['http://dx.doi.org/10.5281/zenodo.3678326', '10.5281/zenodo.3678326'],
    ['https://dx.doi.org/10.5281/zenodo.3678326', '10.5281/zenodo.3678326'],
    ['http://doi.org/10.5281/zenodo.3678326', '10.5281/zenodo.3678326'],
    ['https://doi.org/10.5281/zenodo.3678326', '10.5281/zenodo.3678326'],
  ])('adds the review reference to the repository (%s)', async (reviewDoi: string, expected: string): Promise<void> => {
    const articleDoi = '10.1101/2000.1234';
    await request(createServer())
      .post('/reviews')
      .type('form')
      .send({ articledoi: articleDoi, reviewdoi: reviewDoi });

    expect(createReviewReferenceRepository().findReviewDoisForArticleDoi(new Doi(articleDoi))).toContain(expected);
  });

  it.each([
    '10..1000/journal.pone.0011111',
    '1.1/1.1',
    '10/134980',
    '10.001/001#00',
  ])('requires a possible review DOI (%s)', async (reviewDoi: string): Promise<void> => {
    const response = await request(createServer())
      .post('/reviews')
      .type('form')
      .send({ articledoi: '10.1101/2000.1234', reviewdoi: reviewDoi });

    expect(response.status).toBe(BAD_REQUEST);
    expect(response.text).toBe('Not a possible DOI.');
  });

  it.each([
    '10.1000/journal.pone.0011111',
    'doi:10.1000/journal.pone.0011111',
    'http://dx.doi.org/10.1016/j.neuron.2014.09.004',
    'https://dx.doi.org/10.1016/j.neuron.2014.09.004',
    'http://doi.org/10.1016/j.neuron.2014.09.004',
    'https://doi.org/10.1016/j.neuron.2014.09.004',
  ])('requires a Zenodo review DOI (%s)', async (reviewDoi: string): Promise<void> => {
    const response = await request(createServer())
      .post('/reviews')
      .type('form')
      .send({ articledoi: '10.1101/2000.1234', reviewdoi: reviewDoi });

    expect(response.status).toBe(BAD_REQUEST);
    expect(response.text).toBe('Not a Zenodo DOI.');
  });
});
