type BplusRequest = {
  urlser: string;
  serviceID: string;
  loginGuid: string;
};

type BplusApiJson = {
  ResponseCode?: string | number;
  ResponseData?: string;
  ReasonString?: string;
};

export type SlTeamRow = {
  SLT_CODE: string;
  SLT_NAME: string;
  SUMSLTSELL: string;
};

export type ShowIncomeBySlTeamParams = BplusRequest & {
  fromDate: string;
  toDate: string;
};

export type Oe000304Params = BplusRequest & {
  sltCode: string;
  fromDate: string;
  toDate: string;
  dtProperties: number[];
};

export type ShowIncomeBySlTeamResponse = {
  RECORD_COUNT: number | string;
  SHOWINCOMEBYSLTEAM?: SlTeamRow[];
};

export type Oe000304Row = {
  AED_B_AMT?: string | number;
  [key: string]: unknown;
};

export type Oe000304Response = {
  RECORD_COUNT: number | string;
  Oe000304?: Oe000304Row[];
  [key: string]: unknown;
};

export type TeamNetSalesResult = {
  sltCode: string;
  sumPrimary: number;
  sumSecondary: number;
  netAmount: number;
};

export const OE000304_PRIMARY_PROPERTIES = [302, 307];
export const OE000304_SECONDARY_PROPERTIES = [337, 308];

const buildBplusBody = (
  serviceID: string,
  loginGuid: string,
  fn: string,
  param: string,
  filter: string,
  orderBy = '',
) => ({
  'BPAPUS-BPAPSV': serviceID,
  'BPAPUS-LOGIN-GUID': loginGuid,
  'BPAPUS-FUNCTION': fn,
  'BPAPUS-PARAM': param,
  'BPAPUS-FILTER': filter,
  'BPAPUS-ORDERBY': orderBy,
  'BPAPUS-OFFSET': '0',
  'BPAPUS-FETCH': '0',
});

async function postBplus<T>(url: string, body: Record<string, string>): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const json = (await response.json()) as BplusApiJson;
  if (String(json.ResponseCode) !== '200') {
    throw new Error(json.ReasonString || `API error ${json.ResponseCode}`);
  }
  if (!json.ResponseData) {
    throw new Error('Missing ResponseData');
  }
  return JSON.parse(json.ResponseData) as T;
}

export function buildOe000304Filter(
  sltCode: string,
  fromDate: string,
  toDate: string,
  dtProperties: number[],
): string {
  return (
    ` AND DT_PROPERTIES IN (${dtProperties.join(',')})` +
    ` AND (DI_DATE >= '${fromDate}') AND (DI_DATE <= '${toDate}')` +
    ` AND (TRH_KEY IN (SELECT TRH_KEY FROM TRANSTKH JOIN TRAPPROVE ON TRH_TAP_LIMIT=TAP_KEY AND TAP_APV_STATUS=2)` +
    ` OR TRH_KEY NOT IN (SELECT TRH_KEY FROM TRANSTKH JOIN TRAPPROVE ON TRH_TAP_LIMIT=TAP_KEY))` +
    ` AND DI_KEY IN (SELECT SLD_DI FROM SLDETAIL JOIN SALESMAN ON SLMN_KEY=SLD_SLMN JOIN SLTEAM ON SLT_KEY=SLMN_SLT AND SLT_CODE='${sltCode}')`
  );
}

export function sumAedBAmtFromOe000304(data: Oe000304Response): number {
  const rows = data.Oe000304 ?? [];
  return rows.reduce((total, row) => total + Number(row.AED_B_AMT ?? 0), 0);
}

export async function fetchShowIncomeBySlTeam({
  urlser,
  serviceID,
  loginGuid,
  fromDate,
  toDate,
}: ShowIncomeBySlTeamParams): Promise<ShowIncomeBySlTeamResponse> {
  return postBplus<ShowIncomeBySlTeamResponse>(
    `${urlser}/Executive`,
    buildBplusBody(
      serviceID,
      loginGuid,
      'SHOWINCOMEBYSLTEAM',
      `{"FROM_DATE": "${fromDate}","TO_DATE": ${toDate}}`,
      '',
    ),
  );
}

export async function fetchOe000304ByTeam({
  urlser,
  serviceID,
  loginGuid,
  sltCode,
  fromDate,
  toDate,
  dtProperties,
}: Oe000304Params): Promise<Oe000304Response> {
  return postBplus<Oe000304Response>(
    `${urlser}/LookupErp`,
    buildBplusBody(
      serviceID,
      loginGuid,
      'Oe000304',
      '',
      buildOe000304Filter(sltCode, fromDate, toDate, dtProperties),
      'ORDER BY DI_DATE DESC',
    ),
  );
}

export async function calculateTeamNetSales(
  params: Omit<Oe000304Params, 'dtProperties'>,
): Promise<TeamNetSalesResult> {
  const [primaryData, secondaryData] = await Promise.all([
    fetchOe000304ByTeam({
      ...params,
      dtProperties: OE000304_PRIMARY_PROPERTIES,
    }),
    fetchOe000304ByTeam({
      ...params,
      dtProperties: OE000304_SECONDARY_PROPERTIES,
    }),
  ]);

  const sumPrimary = sumAedBAmtFromOe000304(primaryData);
  const sumSecondary = sumAedBAmtFromOe000304(secondaryData);

  return {
    sltCode: params.sltCode,
    sumPrimary,
    sumSecondary,
    netAmount: sumPrimary - sumSecondary,
  };
}
