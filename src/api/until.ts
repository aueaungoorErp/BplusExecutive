import axios from 'axios';

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

export type Oe000304BySalesmanParams = BplusRequest & {
  slmnKey?: string;
  slmnCode?: string;
  fromDate: string;
  toDate: string;
  dtProperties: number[];
};

export type ShowIncomeBySlTeamResponse = {
  RECORD_COUNT: number | string;
  SHOWINCOMEBYSLTEAM?: SlTeamRow[];
};

export type Oe000304Row = {
  ARD_B_AMT?: string | number;
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
  primaryCount: number;
  secondaryCount: number;
  hasOe304Data: boolean;
};

export type SalesmanNetSalesResult = {
  slmnKey: string;
  sumPrimary: number;
  sumSecondary: number;
  netAmount: number;
  primaryCount: number;
  secondaryCount: number;
  hasOe304Data: boolean;
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

const postBplus = async <T>(
  url: string,
  body: Record<string, string>,
): Promise<T> => {
  const { data: json } = await axios.post<BplusApiJson>(url, body);
  if (String(json.ResponseCode) !== '200') {
    throw new Error(json.ReasonString || `API error ${json.ResponseCode}`);
  }
  if (!json.ResponseData) {
    throw new Error('Missing ResponseData');
  }
  return JSON.parse(json.ResponseData) as T;
};

const buildOe000304DateAndApprovalFilter = (
  fromDate: string,
  toDate: string,
  dtProperties: number[],
  diKeySubquery: string,
): string => {
  return (
    ` AND DT_PROPERTIES IN (${dtProperties.join(',')})` +
    ` AND ( DI_DATE  >='${fromDate}') AND ( DI_DATE  <='${toDate}')` +
    ` AND (TRH_KEY IN (SELECT TRH_KEY FROM TRANSTKH JOIN TRAPPROVE ON TRH_TAP_LIMIT=TAP_KEY AND TAP_APV_STATUS=2)` +
    ` OR TRH_KEY NOT IN (SELECT TRH_KEY FROM TRANSTKH JOIN TRAPPROVE ON TRH_TAP_LIMIT=TAP_KEY))` +
    ` AND DI_KEY IN (${diKeySubquery})`
  );
};

export const buildOe000304Filter = (
  sltCode: string,
  fromDate: string,
  toDate: string,
  dtProperties: number[],
): string => {
  return buildOe000304DateAndApprovalFilter(
    fromDate,
    toDate,
    dtProperties,
    `SELECT SLD_DI FROM SLDETAIL JOIN SALESMAN ON SLMN_KEY=SLD_SLMN JOIN SLTEAM ON SLT_KEY=SLMN_SLT AND SLT_CODE='${sltCode}'`,
  );
};

export const buildOe000304FilterBySalesman = (
  slmnKey: string | undefined,
  slmnCode: string | undefined,
  fromDate: string,
  toDate: string,
  dtProperties: number[],
): string => {
  const key = String(slmnKey ?? '').trim();
  const code = String(slmnCode ?? '').trim();
  const diKeySubquery = key
    ? `SELECT SLD_DI FROM SLDETAIL WHERE SLD_SLMN='${key}'`
    : `SELECT SLD_DI FROM SLDETAIL JOIN SALESMAN ON SLMN_KEY=SLD_SLMN AND SLMN_CODE='${code}'`;

  return buildOe000304DateAndApprovalFilter(
    fromDate,
    toDate,
    dtProperties,
    diKeySubquery,
  );
};

const oe000304Rows = (data: Oe000304Response): Oe000304Row[] => {
  const raw = data.Oe000304;
  if (!raw) {
    return [];
  }
  return Array.isArray(raw) ? raw : Object.values(raw);
};

export const sumAedBAmtFromOe000304 = (data: Oe000304Response): number => {
  return oe000304Rows(data).reduce((total, row) => {
    const amount = row.ARD_B_AMT ?? row.AED_B_AMT ?? 0;
    return total + Number(amount);
  }, 0);
};

export const oe000304RecordCount = (data: Oe000304Response): number => {
  const count = Number(data.RECORD_COUNT);
  if (!Number.isNaN(count) && count > 0) {
    return count;
  }
  return oe000304Rows(data).length;
};

const logOe000304Result = (
  logPrefix: string,
  round: '302-307' | '337-308',
  entityId: string,
  dtProperties: number[],
  filter: string,
  data: Oe000304Response,
) => {
  const rows = oe000304Rows(data);
  console.log(`${logPrefix} Oe000304 result ${round}`, {
    entityId,
    dtProperties,
    filter,
    recordCount: data.RECORD_COUNT,
    rowCount: rows.length,
    sumAedBAmt: sumAedBAmtFromOe000304(data),
    rows,
  });
};

export const fetchShowIncomeBySlTeam = async ({
  urlser,
  serviceID,
  loginGuid,
  fromDate,
  toDate,
}: ShowIncomeBySlTeamParams): Promise<ShowIncomeBySlTeamResponse> => {
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
};

export const fetchOe000304ByTeam = async ({
  urlser,
  serviceID,
  loginGuid,
  sltCode,
  fromDate,
  toDate,
  dtProperties,
}: Oe000304Params): Promise<Oe000304Response> => {
  return postBplus<Oe000304Response>(
    `${urlser}/LookupErp`,
    buildBplusBody(
      serviceID,
      loginGuid,
      'Oe000304',
      '',
      buildOe000304Filter(sltCode, fromDate, toDate, dtProperties),
      '',
    ),
  );
};

export const calculateTeamNetSales = async (
  params: Omit<Oe000304Params, 'dtProperties'>,
): Promise<TeamNetSalesResult> => {
  const primaryData = await fetchOe000304ByTeam({
    ...params,
    dtProperties: OE000304_PRIMARY_PROPERTIES,
  });

  logOe000304Result(
    '[ShowInComeTeam]',
    '302-307',
    params.sltCode,
    OE000304_PRIMARY_PROPERTIES,
    buildOe000304Filter(
      params.sltCode,
      params.fromDate,
      params.toDate,
      OE000304_PRIMARY_PROPERTIES,
    ),
    primaryData,
  );

  const primaryCount = oe000304RecordCount(primaryData);
  if (primaryCount === 0) {
    return {
      sltCode: params.sltCode,
      sumPrimary: 0,
      sumSecondary: 0,
      netAmount: 0,
      primaryCount: 0,
      secondaryCount: 0,
      hasOe304Data: false,
    };
  }

  const secondaryData = await fetchOe000304ByTeam({
    ...params,
    dtProperties: OE000304_SECONDARY_PROPERTIES,
  });

  logOe000304Result(
    '[ShowInComeTeam]',
    '337-308',
    params.sltCode,
    OE000304_SECONDARY_PROPERTIES,
    buildOe000304Filter(
      params.sltCode,
      params.fromDate,
      params.toDate,
      OE000304_SECONDARY_PROPERTIES,
    ),
    secondaryData,
  );

  const sumPrimary = sumAedBAmtFromOe000304(primaryData);
  const sumSecondary = sumAedBAmtFromOe000304(secondaryData);
  const secondaryCount = oe000304RecordCount(secondaryData);

  return {
    sltCode: params.sltCode,
    sumPrimary,
    sumSecondary,
    netAmount: sumPrimary - sumSecondary,
    primaryCount,
    secondaryCount,
    hasOe304Data: true,
  };
};

export const fetchOe000304BySalesman = async ({
  urlser,
  serviceID,
  loginGuid,
  slmnKey,
  slmnCode,
  fromDate,
  toDate,
  dtProperties,
}: Oe000304BySalesmanParams): Promise<Oe000304Response> => {
  return postBplus<Oe000304Response>(
    `${urlser}/LookupErp`,
    buildBplusBody(
      serviceID,
      loginGuid,
      'Oe000304',
      '',
      buildOe000304FilterBySalesman(
        slmnKey,
        slmnCode,
        fromDate,
        toDate,
        dtProperties,
      ),
      '',
    ),
  );
};

export const calculateSalesmanNetSales = async (
  params: Omit<Oe000304BySalesmanParams, 'dtProperties'>,
): Promise<SalesmanNetSalesResult> => {
  const slmnKey = String(params.slmnKey ?? '').trim();
  const slmnCode = String(params.slmnCode ?? '').trim();
  const entityId = slmnKey || slmnCode;

  const primaryData = await fetchOe000304BySalesman({
    ...params,
    dtProperties: OE000304_PRIMARY_PROPERTIES,
  });

  logOe000304Result(
    '[IncomeBySlmn]',
    '302-307',
    entityId,
    OE000304_PRIMARY_PROPERTIES,
    buildOe000304FilterBySalesman(
      slmnKey || undefined,
      slmnCode || undefined,
      params.fromDate,
      params.toDate,
      OE000304_PRIMARY_PROPERTIES,
    ),
    primaryData,
  );

  const primaryCount = oe000304RecordCount(primaryData);
  if (primaryCount === 0) {
    return {
      slmnKey: entityId,
      sumPrimary: 0,
      sumSecondary: 0,
      netAmount: 0,
      primaryCount: 0,
      secondaryCount: 0,
      hasOe304Data: false,
    };
  }

  const secondaryData = await fetchOe000304BySalesman({
    ...params,
    dtProperties: OE000304_SECONDARY_PROPERTIES,
  });

  logOe000304Result(
    '[IncomeBySlmn]',
    '337-308',
    entityId,
    OE000304_SECONDARY_PROPERTIES,
    buildOe000304FilterBySalesman(
      slmnKey || undefined,
      slmnCode || undefined,
      params.fromDate,
      params.toDate,
      OE000304_SECONDARY_PROPERTIES,
    ),
    secondaryData,
  );

  const sumPrimary = sumAedBAmtFromOe000304(primaryData);
  const sumSecondary = sumAedBAmtFromOe000304(secondaryData);
  const secondaryCount = oe000304RecordCount(secondaryData);

  return {
    slmnKey: entityId,
    sumPrimary,
    sumSecondary,
    netAmount: sumPrimary - sumSecondary,
    primaryCount,
    secondaryCount,
    hasOe304Data: true,
  };
};
