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

export type Oe000304ByArParams = BplusRequest & {
  arKey: string;
  fromDate: string;
  toDate: string;
  dtProperties: number[];
};

export type Oe000304GlobalParams = BplusRequest & {
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
  DI_DATE?: string | number;
  DI_KEY?: string | number;
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

export type ArMonthlySalesRow = {
  year: number;
  month: number;
  sellAmount: number;
};

export type ArNetSalesByMonthResult = {
  arKey: string;
  rows: ArMonthlySalesRow[];
  sumPrimary: number;
  sumSecondary: number;
  primaryCount: number;
  secondaryCount: number;
  hasOe304Data: boolean;
};

export type GlobalNetSalesByMonthResult = {
  rows: ArMonthlySalesRow[];
  sumPrimary: number;
  sumSecondary: number;
  primaryCount: number;
  secondaryCount: number;
  hasOe304Data: boolean;
};

export type DailySalesRow = {
  date: string;
  sellAmount: number;
};

export type GlobalNetSalesByDayResult = {
  rows: DailySalesRow[];
  sumPrimary: number;
  sumSecondary: number;
  primaryCount: number;
  secondaryCount: number;
  hasOe304Data: boolean;
};

export type GlobalNetTrdGSellTotalResult = {
  netAmount: number;
  sumPrimary: number;
  sumSecondary: number;
  primaryCount: number;
  secondaryCount: number;
  hasOe304Data: boolean;
};

export type FinanceRatioDateRange = {
  fromDate: string;
  toDate: string;
};

export type FinanceRatioDateRanges = {
  lastMonth: FinanceRatioDateRange;
  thisYear: FinanceRatioDateRange;
  lastYear: FinanceRatioDateRange;
};

export type TranstkdRow = {
  GOODS_CODE?: string;
  GOOD_CODE?: string;
  TRD_B_AMT?: string | number;
  TRD_G_SELL?: string | number;
  [key: string]: unknown;
};

export type InvoiceDocinfoResponse = {
  RECORD_COUNT: number | string;
  TRANSTKD?: TranstkdRow[];
  DOCINFO?: unknown;
  TRANSTKH?: unknown;
  [key: string]: unknown;
};

export type GetInvoiceDocinfoParams = BplusRequest & {
  diKey: string;
};

export type GoodsMasterRow = {
  GOODS_CODE?: string;
  ICDEPT_CODE?: string;
  ICDEPT_THAIDESC?: string;
  [key: string]: unknown;
};

export type SkuInfoByGoodsCodeResponse = {
  RECORD_COUNT: number | string;
  GOODSMASTER?: GoodsMasterRow[] | Record<string, GoodsMasterRow>;
  DOCINFO?: GoodsMasterRow | GoodsMasterRow[] | Record<string, unknown>;
  ICDEPT?: GoodsMasterRow[] | Record<string, GoodsMasterRow>;
  ICDEPT_CODE?: string;
  ICDEPT_THAIDESC?: string;
  [key: string]: unknown;
};

export type GetSkuInfoByGoodsCodeParams = BplusRequest & {
  goodsCode: string;
};

export type IcDeptInfo = {
  icdeptCode: string;
  icdeptThaiDesc: string;
};

export type IcDeptSalesRow = {
  icdeptCode: string;
  icdeptThaiDesc: string;
  sellAmount: number;
};

export type ArSalesByGoodsResult = {
  arKey: string;
  rows: IcDeptSalesRow[];
  diKeyCount: number;
  lineCount: number;
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

export const buildOe000304FilterByAr = (
  arKey: string,
  fromDate: string,
  toDate: string,
  dtProperties: number[],
): string => {
  const key = String(arKey ?? '').trim().replace(/'/g, "''");
  return buildOe000304DateAndApprovalFilter(
    fromDate,
    toDate,
    dtProperties,
    `SELECT DI_KEY FROM DOCINFO WHERE AR_KEY='${key}'`,
  );
};

export const buildOe000304LookupBodyByAr = (
  serviceID: string,
  loginGuid: string,
  arKey: string,
  fromDate: string,
  toDate: string,
  dtProperties: number[],
) =>
  buildBplusBody(
    serviceID,
    loginGuid,
    'Oe000304',
    '',
    buildOe000304FilterByAr(arKey, fromDate, toDate, dtProperties),
    '',
  );

export const buildOe000304FilterGlobal = (
  fromDate: string,
  toDate: string,
  dtProperties: number[],
): string => {
  return buildOe000304DateAndApprovalFilter(
    fromDate,
    toDate,
    dtProperties,
    'SELECT DI_KEY FROM DOCINFO',
  );
};

export const buildOe000304LookupBodyGlobal = (
  serviceID: string,
  loginGuid: string,
  fromDate: string,
  toDate: string,
  dtProperties: number[],
) =>
  buildBplusBody(
    serviceID,
    loginGuid,
    'Oe000304',
    '',
    buildOe000304FilterGlobal(fromDate, toDate, dtProperties),
    '',
  );

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

const parseYearMonthFromDiDate = (
  diDate: unknown,
): { year: number; month: number } | null => {
  const raw = String(diDate ?? '').trim();
  if (!raw) {
    return null;
  }
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 6) {
    return null;
  }
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  if (year <= 0 || month < 1 || month > 12) {
    return null;
  }
  return { year, month };
};

export const groupOe000304ByYearMonth = (
  data: Oe000304Response,
): Map<string, number> => {
  const map = new Map<string, number>();
  for (const row of oe000304Rows(data)) {
    const ym = parseYearMonthFromDiDate(row.DI_DATE);
    if (!ym) {
      continue;
    }
    const key = `${ym.year}-${ym.month}`;
    const amount = Number(row.ARD_B_AMT ?? row.AED_B_AMT ?? 0);
    map.set(key, (map.get(key) ?? 0) + amount);
  }
  return map;
};

const parseDiDateKey = (diDate: unknown): string | null => {
  const raw = String(diDate ?? '').trim();
  if (!raw) {
    return null;
  }
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8) {
    return null;
  }
  return digits.slice(0, 8);
};

export const groupOe000304ByDate = (
  data: Oe000304Response,
): Map<string, number> => {
  const map = new Map<string, number>();
  for (const row of oe000304Rows(data)) {
    const key = parseDiDateKey(row.DI_DATE);
    if (!key) {
      continue;
    }
    const amount = Number(row.ARD_B_AMT ?? row.AED_B_AMT ?? 0);
    map.set(key, (map.get(key) ?? 0) + amount);
  }
  return map;
};

const mapToDailyRows = (
  primaryMap: Map<string, number>,
  secondaryMap: Map<string, number>,
): DailySalesRow[] => {
  const allKeys = new Set([...primaryMap.keys(), ...secondaryMap.keys()]);
  const rows: DailySalesRow[] = [];
  for (const key of allKeys) {
    const primaryAmount = primaryMap.get(key) ?? 0;
    const secondaryAmount = secondaryMap.get(key) ?? 0;
    rows.push({
      date: key,
      sellAmount: primaryAmount - secondaryAmount,
    });
  }
  return rows.sort((a, b) => b.date.localeCompare(a.date));
};

const formatYyyymmdd = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const isEndOfMonth = (date: Date): boolean => {
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return (
    date.getFullYear() === monthEnd.getFullYear() &&
    date.getMonth() === monthEnd.getMonth() &&
    date.getDate() === monthEnd.getDate()
  );
};

const resolveLastMonthRange = (toDate: Date): FinanceRatioDateRange => {
  let targetYear: number;
  let targetMonthIndex: number;

  if (isEndOfMonth(toDate)) {
    targetYear = toDate.getFullYear();
    targetMonthIndex = toDate.getMonth();
  } else {
    const previousMonthEnd = new Date(
      toDate.getFullYear(),
      toDate.getMonth(),
      0,
    );
    targetYear = previousMonthEnd.getFullYear();
    targetMonthIndex = previousMonthEnd.getMonth();
  }

  const lastMonthStart = new Date(targetYear, targetMonthIndex, 1);
  const lastMonthEnd = new Date(targetYear, targetMonthIndex + 1, 0);

  return {
    fromDate: formatYyyymmdd(lastMonthStart),
    toDate: formatYyyymmdd(lastMonthEnd),
  };
};

export const resolveFinanceRatioDateRanges = (
  toDateYyyymmdd: string,
): FinanceRatioDateRanges => {
  const digits = String(toDateYyyymmdd).replace(/\D/g, '').slice(0, 8);
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6)) - 1;
  const day = Number(digits.slice(6, 8));
  const toDate = new Date(year, month, day);

  return {
    lastMonth: resolveLastMonthRange(toDate),
    thisYear: {
      fromDate: formatYyyymmdd(new Date(year, 0, 1)),
      toDate: formatYyyymmdd(toDate),
    },
    lastYear: {
      fromDate: formatYyyymmdd(new Date(year - 1, 0, 1)),
      toDate: formatYyyymmdd(new Date(year - 1, 11, 31)),
    },
  };
};

const mapToMonthlyRows = (
  primaryMap: Map<string, number>,
  secondaryMap: Map<string, number>,
): ArMonthlySalesRow[] => {
  const allKeys = new Set([...primaryMap.keys(), ...secondaryMap.keys()]);
  const rows: ArMonthlySalesRow[] = [];
  for (const key of allKeys) {
    const primaryAmount = primaryMap.get(key) ?? 0;
    const secondaryAmount = secondaryMap.get(key) ?? 0;
    const [yearStr, monthStr] = key.split('-');
    rows.push({
      year: Number(yearStr),
      month: Number(monthStr),
      sellAmount: primaryAmount - secondaryAmount,
    });
  }
  return rows.sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month,
  );
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

export const fetchOe000304ByAr = async ({
  urlser,
  serviceID,
  loginGuid,
  arKey,
  fromDate,
  toDate,
  dtProperties,
}: Oe000304ByArParams): Promise<Oe000304Response> => {
  return postBplus<Oe000304Response>(
    `${urlser}/LookupErp`,
    buildOe000304LookupBodyByAr(
      serviceID,
      loginGuid,
      arKey,
      fromDate,
      toDate,
      dtProperties,
    ),
  );
};

export const calculateArNetSalesByMonth = async (
  params: Omit<Oe000304ByArParams, 'dtProperties'>,
): Promise<ArNetSalesByMonthResult> => {
  const arKey = String(params.arKey ?? '').trim();

  const primaryData = await fetchOe000304ByAr({
    ...params,
    arKey,
    dtProperties: OE000304_PRIMARY_PROPERTIES,
  });

  const primaryCount = oe000304RecordCount(primaryData);
  if (primaryCount === 0) {
    return {
      arKey,
      rows: [],
      sumPrimary: 0,
      sumSecondary: 0,
      primaryCount: 0,
      secondaryCount: 0,
      hasOe304Data: false,
    };
  }

  const secondaryData = await fetchOe000304ByAr({
    ...params,
    arKey,
    dtProperties: OE000304_SECONDARY_PROPERTIES,
  });

  const primaryMap = groupOe000304ByYearMonth(primaryData);
  const secondaryMap = groupOe000304ByYearMonth(secondaryData);
  const sumPrimary = sumAedBAmtFromOe000304(primaryData);
  const sumSecondary = sumAedBAmtFromOe000304(secondaryData);
  const secondaryCount = oe000304RecordCount(secondaryData);

  return {
    arKey,
    rows: mapToMonthlyRows(primaryMap, secondaryMap),
    sumPrimary,
    sumSecondary,
    primaryCount,
    secondaryCount,
    hasOe304Data: true,
  };
};

export const fetchOe000304Global = async ({
  urlser,
  serviceID,
  loginGuid,
  fromDate,
  toDate,
  dtProperties,
}: Oe000304GlobalParams): Promise<Oe000304Response> => {
  return postBplus<Oe000304Response>(
    `${urlser}/LookupErp`,
    buildOe000304LookupBodyGlobal(
      serviceID,
      loginGuid,
      fromDate,
      toDate,
      dtProperties,
    ),
  );
};

export const calculateGlobalNetSalesByMonth = async (
  params: Omit<Oe000304GlobalParams, 'dtProperties'>,
): Promise<GlobalNetSalesByMonthResult> => {
  const primaryData = await fetchOe000304Global({
    ...params,
    dtProperties: OE000304_PRIMARY_PROPERTIES,
  });

  console.log('[ShowInCome] Oe000304 response full primary', {
    recordCount: primaryData.RECORD_COUNT,
    rowCount: oe000304Rows(primaryData).length,
    response: primaryData,
  });

  const primaryCount = oe000304RecordCount(primaryData);
  if (primaryCount === 0) {
    return {
      rows: [],
      sumPrimary: 0,
      sumSecondary: 0,
      primaryCount: 0,
      secondaryCount: 0,
      hasOe304Data: false,
    };
  }

  const secondaryData = await fetchOe000304Global({
    ...params,
    dtProperties: OE000304_SECONDARY_PROPERTIES,
  });

  const primaryResult = await groupOe000304YearMonthByTrdGSell(
    params,
    primaryData,
  );
  const secondaryResult = await groupOe000304YearMonthByTrdGSell(
    params,
    secondaryData,
  );
  const secondaryCount = oe000304RecordCount(secondaryData);

  return {
    rows: mapToMonthlyRows(primaryResult.amountMap, secondaryResult.amountMap),
    sumPrimary: primaryResult.totalSum,
    sumSecondary: secondaryResult.totalSum,
    primaryCount,
    secondaryCount,
    hasOe304Data: true,
  };
};

export const sumNetSalesFromMonthlyResult = (
  result: GlobalNetSalesByMonthResult,
): number =>
  result.rows.reduce(
    (total, row) => total + Number(row.sellAmount ?? 0),
    0,
  );

export const getNetForMonthRange = (
  result: GlobalNetSalesByMonthResult,
  fromDate: string,
  toDate: string,
): number => {
  const y1 = Number(fromDate.slice(0, 4));
  const m1 = Number(fromDate.slice(4, 6));
  const y2 = Number(toDate.slice(0, 4));
  const m2 = Number(toDate.slice(4, 6));

  if (y1 === y2 && m1 === m2) {
    const row = result.rows.find(r => r.year === y1 && r.month === m1);
    return row ? Number(row.sellAmount ?? 0) : 0;
  }

  return sumNetSalesFromMonthlyResult(result);
};

export const calculateGlobalNetSalesByDay = async (
  params: Omit<Oe000304GlobalParams, 'dtProperties'>,
): Promise<GlobalNetSalesByDayResult> => {
  const primaryData = await fetchOe000304Global({
    ...params,
    dtProperties: OE000304_PRIMARY_PROPERTIES,
  });

  const primaryCount = oe000304RecordCount(primaryData);
  if (primaryCount === 0) {
    return {
      rows: [],
      sumPrimary: 0,
      sumSecondary: 0,
      primaryCount: 0,
      secondaryCount: 0,
      hasOe304Data: false,
    };
  }

  const secondaryData = await fetchOe000304Global({
    ...params,
    dtProperties: OE000304_SECONDARY_PROPERTIES,
  });

  console.log('[ShowSellBook] Oe000304 response full secondary', {
    recordCount: secondaryData.RECORD_COUNT,
    rowCount: oe000304Rows(secondaryData).length,
    response: secondaryData,
  });

  const primaryResult = await groupOe000304DateByTrdGSell(
    params,
    primaryData,
    'primary',
  );
  const secondaryResult = await groupOe000304DateByTrdGSell(
    params,
    secondaryData,
    'secondary',
  );
  const secondaryCount = oe000304RecordCount(secondaryData);

  const rows = mapToDailyRows(primaryResult.amountMap, secondaryResult.amountMap);

  console.log('[ShowSellBook] net TRD_G_SELL', {
    sumPrimary: primaryResult.totalSum,
    sumSecondary: secondaryResult.totalSum,
    netTotal: primaryResult.totalSum - secondaryResult.totalSum,
    primaryCount,
    secondaryCount,
    rowCount: rows.length,
  });

  return {
    rows,
    sumPrimary: primaryResult.totalSum,
    sumSecondary: secondaryResult.totalSum,
    primaryCount,
    secondaryCount,
    hasOe304Data: true,
  };
};

export const calculateGlobalNetTrdGSellTotal = async (
  params: Omit<Oe000304GlobalParams, 'dtProperties'>,
): Promise<GlobalNetTrdGSellTotalResult> => {
  const monthly = await calculateGlobalNetSalesByMonth(params);
  return {
    netAmount: sumNetSalesFromMonthlyResult(monthly),
    sumPrimary: monthly.sumPrimary,
    sumSecondary: monthly.sumSecondary,
    primaryCount: monthly.primaryCount,
    secondaryCount: monthly.secondaryCount,
    hasOe304Data: monthly.hasOe304Data,
  };
};

const transtkdRows = (data: InvoiceDocinfoResponse): TranstkdRow[] => {
  const raw = data.TRANSTKD;
  if (!raw) {
    return [];
  }
  return Array.isArray(raw) ? raw : Object.values(raw);
};

const TRANSTKD_AMOUNT_FIELDS = [
  'TRD_B_AMT',
  'TRD_N_SELL',
  'TRD_G_SELL',
  'TRD_K_U_PRC',
  'TRD_TDSC_KEYINV',
] as const;

const sumTranstkdField = (lines: TranstkdRow[], field: string): number => {
  return lines.reduce((total, line) => total + Number(line[field] ?? 0), 0);
};

const pickTranstkdAmountFields = (line: TranstkdRow): Record<string, number> => {
  const picked: Record<string, number> = {};
  for (const field of TRANSTKD_AMOUNT_FIELDS) {
    picked[field] = Number(line[field] ?? 0);
  }
  return picked;
};

const MAX_TRANSTKD_SNAPSHOT_LOGS = 2;

const logTranstkdAmountSnapshot = (
  diKey: string,
  lines: TranstkdRow[],
  snapshotLogCount: { value: number },
): void => {
  console.log('[GetInvoiceDocinfo]', {
    diKey,
    lineCount: lines.length,
  });

  if (lines.length === 0) {
    return;
  }

  const shouldLogDetail = snapshotLogCount.value < MAX_TRANSTKD_SNAPSHOT_LOGS;
  if (!shouldLogDetail) {
    return;
  }

  snapshotLogCount.value += 1;
  const firstLine = lines[0];
  const trdBAmt = Number(firstLine.TRD_B_AMT ?? 0);
  const trdNSell = Number(firstLine.TRD_N_SELL ?? 0);
  const trdGSell = Number(firstLine.TRD_G_SELL ?? 0);

  console.log('[GetInvoiceDocinfo] TRANSTKD snapshot', {
    diKey,
    goodsCode: resolveGoodsCode(firstLine),
    amountFields: pickTranstkdAmountFields(firstLine),
    rowKeys: Object.keys(firstLine),
  });

  if (
    (firstLine.TRD_B_AMT === undefined || trdBAmt === 0) &&
    (trdNSell !== 0 || trdGSell !== 0)
  ) {
    console.warn(
      '[GetInvoiceDocinfo] TRD_B_AMT empty but other amount fields have value',
      {
        diKey,
        TRD_N_SELL: trdNSell,
        TRD_G_SELL: trdGSell,
      },
    );
  }
};

export const collectUniqueDiKeys = (data: Oe000304Response): string[] => {
  const keys = new Set<string>();
  for (const row of oe000304Rows(data)) {
    const diKey = String(row.DI_KEY ?? '').trim();
    if (diKey) {
      keys.add(diKey);
    }
  }
  return Array.from(keys);
};

export const resolveGoodsCode = (row: TranstkdRow): string => {
  return String(row.GOODS_CODE ?? row.GOOD_CODE ?? '').trim();
};

export const TRANSTKD_SELL_AMOUNT_FIELD = 'TRD_G_SELL';

export const groupTranstkdByGoodsCode = (
  lines: TranstkdRow[],
): Map<string, number> => {
  const map = new Map<string, number>();
  for (const line of lines) {
    const goodsCode = resolveGoodsCode(line);
    if (!goodsCode) {
      continue;
    }
    const amount = Number(line[TRANSTKD_SELL_AMOUNT_FIELD] ?? 0);
    map.set(goodsCode, (map.get(goodsCode) ?? 0) + amount);
  }
  return map;
};

export const fetchGetInvoiceDocinfo = async ({
  urlser,
  serviceID,
  loginGuid,
  diKey,
}: GetInvoiceDocinfoParams): Promise<InvoiceDocinfoResponse> => {
  const key = String(diKey ?? '').trim().replace(/'/g, "''");
  return postBplus<InvoiceDocinfoResponse>(
    `${urlser}/UpdateErp`,
    buildBplusBody(
      serviceID,
      loginGuid,
      'GetInvoiceDocinfo',
      `{"DI_KEY":"${key}"}`,
      '',
    ),
  );
};

const toRecordRows = <T extends Record<string, unknown>>(
  raw: T[] | Record<string, T> | undefined,
): T[] => {
  if (!raw) {
    return [];
  }
  return Array.isArray(raw) ? raw : Object.values(raw);
};

const goodsMasterRows = (
  data: SkuInfoByGoodsCodeResponse,
): GoodsMasterRow[] => toRecordRows(data.GOODSMASTER);

const docInfoRow = (
  data: SkuInfoByGoodsCodeResponse,
): GoodsMasterRow | undefined => {
  const raw = data.DOCINFO;
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }
  if (Array.isArray(raw)) {
    return raw[0] as GoodsMasterRow | undefined;
  }
  return raw as GoodsMasterRow;
};

const icdeptMasterRows = (
  data: SkuInfoByGoodsCodeResponse,
): GoodsMasterRow[] => {
  for (const key of ['ICDEPT', 'ICDEPTMASTER', 'SHOWICDEPT'] as const) {
    const rows = toRecordRows(
      data[key] as GoodsMasterRow[] | Record<string, GoodsMasterRow> | undefined,
    );
    if (rows.length > 0) {
      return rows;
    }
  }
  return [];
};

const pickNestedString = (
  value: unknown,
  fieldName: string,
  maxDepth = 5,
  depth = 0,
): string => {
  if (depth > maxDepth || value == null) {
    return '';
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = pickNestedString(item, fieldName, maxDepth, depth + 1);
      if (found) {
        return found;
      }
    }
    return '';
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const direct = record[fieldName];
    if (direct != null && String(direct).trim()) {
      return String(direct).trim();
    }
    for (const child of Object.values(record)) {
      const found = pickNestedString(child, fieldName, maxDepth, depth + 1);
      if (found) {
        return found;
      }
    }
  }
  return '';
};

const firstNonEmptyString = (...values: unknown[]): string => {
  for (const value of values) {
    const text = String(value ?? '').trim();
    if (text) {
      return text;
    }
  }
  return '';
};

const preferIcDeptThaiDesc = (
  current: string,
  next: string,
  icdeptCode: string,
): string => {
  const normalizedCurrent = String(current ?? '').trim();
  const normalizedNext = String(next ?? '').trim();
  if (
    normalizedNext &&
    normalizedNext !== icdeptCode &&
    normalizedNext !== '0' &&
    (normalizedCurrent === icdeptCode ||
      normalizedCurrent === '0' ||
      !normalizedCurrent)
  ) {
    return normalizedNext;
  }
  return normalizedCurrent || normalizedNext || icdeptCode;
};

export const resolveIcDeptInfoFromSkuInfo = (
  data: SkuInfoByGoodsCodeResponse,
): IcDeptInfo => {
  const goodsRows = goodsMasterRows(data);
  const goodsRow =
    goodsRows.find(row => String(row?.ICDEPT_CODE ?? '').trim()) ?? goodsRows[0];
  const docRow = docInfoRow(data);

  const icdeptCode =
    firstNonEmptyString(
      goodsRow?.ICDEPT_CODE,
      docRow?.ICDEPT_CODE,
      data.ICDEPT_CODE,
      pickNestedString(data, 'ICDEPT_CODE'),
    ) || '0';

  const icdeptMasterMatch = icdeptMasterRows(data).find(
    row => String(row?.ICDEPT_CODE ?? '').trim() === icdeptCode,
  );

  const icdeptThaiDesc =
    firstNonEmptyString(
      goodsRow?.ICDEPT_THAIDESC,
      docRow?.ICDEPT_THAIDESC,
      icdeptMasterMatch?.ICDEPT_THAIDESC,
      data.ICDEPT_THAIDESC,
      pickNestedString(data, 'ICDEPT_THAIDESC'),
    ) || icdeptCode;

  if (icdeptThaiDesc === icdeptCode) {
    console.warn('[GETSKUINFOBYGOODSCODE] ICDEPT_THAIDESC not found', {
      icdeptCode,
      goodsRowKeys: goodsRow ? Object.keys(goodsRow) : [],
      topLevelKeys: Object.keys(data),
    });
  }

  return { icdeptCode, icdeptThaiDesc };
};

export const resolveIcDeptCodeFromSkuInfo = (
  data: SkuInfoByGoodsCodeResponse,
): string => resolveIcDeptInfoFromSkuInfo(data).icdeptCode;

export const fetchGetSkuInfoByGoodsCode = async ({
  urlser,
  serviceID,
  loginGuid,
  goodsCode,
}: GetSkuInfoByGoodsCodeParams): Promise<SkuInfoByGoodsCodeResponse> => {
  const code = String(goodsCode ?? '')
    .trim()
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
  const requestBody = buildBplusBody(
    serviceID,
    loginGuid,
    'GETSKUINFOBYGOODSCODE',
    `{"GOODS_CODE": "${code}"}`,
    '',
  );
  console.log('[GETSKUINFOBYGOODSCODE] request', {
    url: `${urlser}/SetupErp`,
    goodsCode,
    body: requestBody,
  });
  const response = await postBplus<SkuInfoByGoodsCodeResponse>(
    `${urlser}/SetupErp`,
    requestBody,
  );
  console.log('[GETSKUINFOBYGOODSCODE] response full', {
    goodsCode,
    response,
  });
  return response;
};

export const buildGoodsCodeToIcDeptMap = async (
  params: BplusRequest,
  goodsCodes: string[],
): Promise<Map<string, IcDeptInfo>> => {
  const uniqueCodes = [
    ...new Set(goodsCodes.map(code => String(code ?? '').trim()).filter(Boolean)),
  ];
  const map = new Map<string, IcDeptInfo>();

  const pairs = await mapWithConcurrency(
    uniqueCodes,
    INVOICE_DOCINFO_CONCURRENCY,
    async goodsCode => {
      const response = await fetchGetSkuInfoByGoodsCode({
        ...params,
        goodsCode,
      });
      const icdeptInfo = resolveIcDeptInfoFromSkuInfo(response);
      if (!icdeptInfo.icdeptCode || icdeptInfo.icdeptCode === '0') {
        console.warn('[GETSKUINFOBYGOODSCODE] missing ICDEPT_CODE', {
          goodsCode,
        });
      }
      console.log('[GETSKUINFOBYGOODSCODE]', {
        goodsCode,
        icdeptCode: icdeptInfo.icdeptCode,
        icdeptThaiDesc: icdeptInfo.icdeptThaiDesc,
      });
      return { goodsCode, icdeptInfo };
    },
  );

  for (const pair of pairs) {
    map.set(pair.goodsCode, pair.icdeptInfo);
  }
  return map;
};

const rollUpGoodsTotalsByIcDept = (
  groupedByGoods: Map<string, number>,
  goodsToIcDept: Map<string, IcDeptInfo>,
): Map<string, IcDeptSalesRow> => {
  const icdeptRows = new Map<string, IcDeptSalesRow>();
  for (const [goodsCode, sellAmount] of groupedByGoods) {
    const info = goodsToIcDept.get(goodsCode) ?? {
      icdeptCode: '0',
      icdeptThaiDesc: '0',
    };
    const existing = icdeptRows.get(info.icdeptCode);
    if (existing) {
      existing.sellAmount += sellAmount;
      existing.icdeptThaiDesc = preferIcDeptThaiDesc(
        existing.icdeptThaiDesc,
        info.icdeptThaiDesc,
        info.icdeptCode,
      );
    } else {
      icdeptRows.set(info.icdeptCode, {
        icdeptCode: info.icdeptCode,
        icdeptThaiDesc: info.icdeptThaiDesc,
        sellAmount,
      });
    }
  }
  return icdeptRows;
};

const INVOICE_DOCINFO_CONCURRENCY = 5;

const mapWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let index = 0;

  const worker = async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current]);
    }
  };

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
};

const buildDiKeyToDiDateMap = (
  data: Oe000304Response,
): Map<string, unknown> => {
  const map = new Map<string, unknown>();
  for (const row of oe000304Rows(data)) {
    const diKey = String(row.DI_KEY ?? '').trim();
    if (diKey) {
      map.set(diKey, row.DI_DATE);
    }
  }
  return map;
};

type Oe000304TrdGSellGroupMode = 'yearMonth' | 'date';

type Oe000304TrdGSellGroupResult = {
  amountMap: Map<string, number>;
  totalSum: number;
  diKeyCount: number;
  lineCount: number;
};

const resolveOe000304TrdGSellGroupKey = (
  diDate: unknown,
  mode: Oe000304TrdGSellGroupMode,
): string | null => {
  if (mode === 'yearMonth') {
    const ym = parseYearMonthFromDiDate(diDate);
    return ym ? `${ym.year}-${ym.month}` : null;
  }
  return parseDiDateKey(diDate);
};

type Oe000304TrdGSellRound = 'primary' | 'secondary';

const fetchGetInvoiceDocinfoWithLog = async (
  params: GetInvoiceDocinfoParams,
  logLabel: string,
  round?: Oe000304TrdGSellRound,
): Promise<InvoiceDocinfoResponse> => {
  const response = await fetchGetInvoiceDocinfo(params);
  const roundSuffix = round ? ` ${round}` : '';
  console.log(`${logLabel} GetInvoiceDocinfo response full${roundSuffix}`, {
    diKey: params.diKey,
    response,
  });
  return response;
};

const groupOe000304ByTrdGSell = async (
  params: BplusRequest,
  oe304Data: Oe000304Response,
  mode: Oe000304TrdGSellGroupMode,
  logLabel: string,
  round?: Oe000304TrdGSellRound,
): Promise<Oe000304TrdGSellGroupResult> => {
  const diKeys = collectUniqueDiKeys(oe304Data);
  const diKeyToDate = buildDiKeyToDiDateMap(oe304Data);
  const amountMap = new Map<string, number>();

  if (diKeys.length === 0) {
    return {
      amountMap,
      totalSum: 0,
      diKeyCount: 0,
      lineCount: 0,
    };
  }

  const results = await mapWithConcurrency(
    diKeys,
    INVOICE_DOCINFO_CONCURRENCY,
    async diKey => {
      const response = await fetchGetInvoiceDocinfoWithLog(
        {
          urlser: params.urlser,
          serviceID: params.serviceID,
          loginGuid: params.loginGuid,
          diKey,
        },
        logLabel,
        round,
      );
      const lines = transtkdRows(response);
      const invoiceTotal = sumTranstkdField(lines, TRANSTKD_SELL_AMOUNT_FIELD);
      const groupKey = resolveOe000304TrdGSellGroupKey(
        diKeyToDate.get(diKey),
        mode,
      );
      return { invoiceTotal, groupKey, lineCount: lines.length };
    },
  );

  let totalSum = 0;
  let lineCount = 0;
  for (const result of results) {
    totalSum += result.invoiceTotal;
    lineCount += result.lineCount;
    if (result.groupKey) {
      amountMap.set(
        result.groupKey,
        (amountMap.get(result.groupKey) ?? 0) + result.invoiceTotal,
      );
    }
  }

  return {
    amountMap,
    totalSum,
    diKeyCount: diKeys.length,
    lineCount,
  };
};

const groupOe000304YearMonthByTrdGSell = (
  params: BplusRequest,
  oe304Data: Oe000304Response,
): Promise<Oe000304TrdGSellGroupResult> =>
  groupOe000304ByTrdGSell(params, oe304Data, 'yearMonth', '[ShowInCome]');

const groupOe000304DateByTrdGSell = (
  params: BplusRequest,
  oe304Data: Oe000304Response,
  round: Oe000304TrdGSellRound,
): Promise<Oe000304TrdGSellGroupResult> =>
  groupOe000304ByTrdGSell(
    params,
    oe304Data,
    'date',
    '[ShowSellBook]',
    round,
  );

export const calculateArSalesByGoodsCode = async (
  params: Omit<Oe000304ByArParams, 'dtProperties'>,
): Promise<ArSalesByGoodsResult> => {
  const arKey = String(params.arKey ?? '').trim();

  const primaryData = await fetchOe000304ByAr({
    ...params,
    arKey,
    dtProperties: OE000304_PRIMARY_PROPERTIES,
  });

  const diKeys = collectUniqueDiKeys(primaryData);
  console.log('[calculateArSalesByGoodsCode] Oe000304 diKeys', {
    arKey,
    count: diKeys.length,
    sample: diKeys.slice(0, 5),
  });
  if (diKeys.length === 0) {
    return {
      arKey,
      rows: [],
      diKeyCount: 0,
      lineCount: 0,
      hasOe304Data: false,
    };
  }

  const snapshotLogCount = { value: 0 };
  const docinfoResults = await mapWithConcurrency(
    diKeys,
    INVOICE_DOCINFO_CONCURRENCY,
    async diKey => {
      const response = await fetchGetInvoiceDocinfo({
        urlser: params.urlser,
        serviceID: params.serviceID,
        loginGuid: params.loginGuid,
        diKey,
      });
      const lines = transtkdRows(response);
      logTranstkdAmountSnapshot(diKey, lines, snapshotLogCount);
      return { diKey, lines };
    },
  );

  const allLines: TranstkdRow[] = [];
  for (const result of docinfoResults) {
    allLines.push(...result.lines);
  }

  const fieldCompare = Object.fromEntries(
    TRANSTKD_AMOUNT_FIELDS.map(field => [
      field,
      sumTranstkdField(allLines, field),
    ]),
  );
  console.log('[calculateArSalesByGoodsCode] field compare totals', fieldCompare);

  const groupedByGoods = groupTranstkdByGoodsCode(allLines);
  const groupedGoodsRows = Array.from(groupedByGoods.entries()).map(
    ([goodsCode, sellAmount]) => ({ goodsCode, sellAmount }),
  );
  console.log(
    `[calculateArSalesByGoodsCode] grouped by goods ${TRANSTKD_SELL_AMOUNT_FIELD}`,
    groupedGoodsRows,
  );

  const goodsToIcDept = await buildGoodsCodeToIcDeptMap(
    {
      urlser: params.urlser,
      serviceID: params.serviceID,
      loginGuid: params.loginGuid,
    },
    Array.from(groupedByGoods.keys()),
  );
  console.log('[calculateArSalesByGoodsCode] goods→icdept map sample', {
    count: goodsToIcDept.size,
    sample: Array.from(goodsToIcDept.entries()).slice(0, 10),
  });

  const icdeptRows = rollUpGoodsTotalsByIcDept(groupedByGoods, goodsToIcDept);
  const rows: IcDeptSalesRow[] = Array.from(icdeptRows.values()).sort((a, b) =>
    a.icdeptCode !== b.icdeptCode
      ? a.icdeptCode.localeCompare(b.icdeptCode)
      : b.sellAmount - a.sellAmount,
  );
  console.log('[calculateArSalesByGoodsCode] grouped by ICDEPT_CODE', rows);

  return {
    arKey,
    rows,
    diKeyCount: diKeys.length,
    lineCount: allLines.length,
    hasOe304Data: rows.length > 0,
  };
};
