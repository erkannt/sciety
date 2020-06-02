import { createFetchAbstractFromCrossref, MakeHttpRequest } from '../../src/api/fetch-article';
import Doi from '../../src/data/doi';

describe('fetch-abstract-from-crossref', (): void => {
  it('extracts the abstract text from the XML response', async () => {
    const doi = new Doi('10.1101/339747');
    const makeHttpRequest: MakeHttpRequest = async () => `
<?xml version="1.0" encoding="UTF-8"?>
<doi_records>
  <doi_record>
    <crossref>
      <posted_content>
        <abstract>
          Some random nonsense.
        </abstract>
      </posted_content>
    </crossref>
  </doi_record>
</doi_records>
`;
    const abstract = await createFetchAbstractFromCrossref(makeHttpRequest)(doi);

    expect(abstract).toStrictEqual(expect.stringContaining('Some random nonsense.'));
  });

  it('removes the title if present', async () => {
    const doi = new Doi('10.1101/339747');
    const makeHttpRequest: MakeHttpRequest = async () => `
<?xml version="1.0" encoding="UTF-8"?>
<doi_records>
  <doi_record>
    <crossref>
      <posted_content>
        <abstract>
          <title>Abstract</title>
          Some random nonsense.
        </abstract>
      </posted_content>
    </crossref>
  </doi_record>
</doi_records>
`;
    const abstract = await createFetchAbstractFromCrossref(makeHttpRequest)(doi);

    expect(abstract).toStrictEqual(expect.not.stringContaining('Abstract'));
  });

  it('removes the <abstract> element', async () => {
    const doi = new Doi('10.1101/339747');
    const makeHttpRequest: MakeHttpRequest = async () => `
<?xml version="1.0" encoding="UTF-8"?>
<doi_records>
  <doi_record>
    <crossref>
      <posted_content>
        <abstract>
          Some random nonsense.
        </abstract>
      </posted_content>
    </crossref>
  </doi_record>
</doi_records>
`;
    const abstract = await createFetchAbstractFromCrossref(makeHttpRequest)(doi);

    expect(abstract).toStrictEqual(expect.not.stringContaining('<abstract>'));
    expect(abstract).toStrictEqual(expect.not.stringContaining('</abstract>'));
  });

  it('renders italic if present', async () => {
    const doi = new Doi('10.1101/339747');
    const makeHttpRequest: MakeHttpRequest = async () => `
<?xml version="1.0" encoding="UTF-8"?>
<doi_records>
  <doi_record owner="10.1101" timestamp="2020-06-02 07:46:31">
    <crossref>
      <posted_content type="preprint" language="en" metadata_distribution_opts="any">
        <abstract>
          <title>Abstract</title>
          <p>
            The spread of antimicrobial resistance continues to be a priority health concern worldwide, necessitating exploration of alternative therapies.
            <italic>Cannabis sativa</italic>
            has long been known to contain antibacterial cannabinoids, but their potential to address antibiotic resistance has only been superficially investigated. Here, we show that cannabinoids exhibit antibacterial activity against MRSA, inhibit its ability to form biofilms and eradicate pre-formed biofilms and stationary phase cells persistent to antibiotics. We show that the mechanism of action of cannabigerol is through targeting the cytoplasmic membrane of Gram-positive bacteria and demonstrate
            <italic>in vivo</italic>
            efficacy of cannabigerol in a murine systemic infection model caused by MRSA. We also show that cannabinoids are effective against Gram-negative organisms whose outer membrane is permeabilized, where cannabigerol acts on the inner membrane. Finally, we demonstrate that cannabinoids work in combination with polymyxin B against multi-drug resistant Gram-negative pathogens, revealing the broad-spectrum therapeutic potential for cannabinoids.
          </p>
        </abstract>
      </posted_content>
    </crossref>
  </doi_record>
</doi_records>
`;
    const abstract = await createFetchAbstractFromCrossref(makeHttpRequest)(doi);

    expect(abstract).toStrictEqual(expect.stringContaining('<i>Cannabis sativa</i>'));
    expect(abstract).toStrictEqual(expect.stringContaining('<i>in vivo</i>'));
  });
});
