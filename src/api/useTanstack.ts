import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  calculateArNetSalesByMonth,
  calculateArSalesByGoodsCode,
  calculateGlobalNetSalesByDay,
  calculateGlobalNetSalesByMonth,
  calculateSalesmanNetSales,
  calculateTeamNetSales,
  OE000304_PRIMARY_PROPERTIES,
  OE000304_SECONDARY_PROPERTIES,
  resolveFinanceRatioDateRanges,
  getNetForMonthRange,
} from './until';

export type TeamRef = {
  sltCode: string;
  sltName: string;
};

export type FetchTeamsInvoicesParams = {
  urlser: string;
  serviceID: string;
  loginGuid: string;
  fromDate: string;
  toDate: string;
  teams: TeamRef[];
};

export type TeamInvoiceResult = {
  team: TeamRef;
  sumPrimary: number;
  sumSecondary: number;
  netAmount: number;
  primaryCount: number;
  secondaryCount: number;
  hasOe304Data: boolean;
};

export function useFetchOe000304ByTeams() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const fetchTeamsInvoices = useCallback(
    async ({
      urlser,
      serviceID,
      loginGuid,
      fromDate,
      toDate,
      teams,
    }: FetchTeamsInvoicesParams): Promise<TeamInvoiceResult[]> => {
      setIsPending(true);
      const results: TeamInvoiceResult[] = [];
      try {
        for (const team of teams) {
          const sltCode = String(team.sltCode ?? '').trim();
          const netSales = await queryClient.fetchQuery({
            queryKey: [
              'oe000304',
              'net',
              team.sltCode,
              fromDate,
              toDate,
              loginGuid,
              OE000304_PRIMARY_PROPERTIES.join('-'),
              OE000304_SECONDARY_PROPERTIES.join('-'),
            ],
            queryFn: () =>
              calculateTeamNetSales({
                urlser,
                serviceID,
                loginGuid,
                sltCode,
                fromDate,
                toDate,
              }),
          });

          if (!netSales.hasOe304Data) {
            continue;
          }

          results.push({
            team,
            sumPrimary: netSales.sumPrimary,
            sumSecondary: netSales.sumSecondary,
            netAmount: netSales.netAmount,
            primaryCount: netSales.primaryCount,
            secondaryCount: netSales.secondaryCount,
            hasOe304Data: netSales.hasOe304Data,
          });
        }
        return results;
      } finally {
        setIsPending(false);
      }
    },
    [queryClient],
  );

  return { fetchTeamsInvoices, isPending };
}

export type SalesmanRef = {
  slmnKey: string;
  slmnCode: string;
  slmnName: string;
};

export type FetchSalesmenInvoicesParams = {
  urlser: string;
  serviceID: string;
  loginGuid: string;
  fromDate: string;
  toDate: string;
  salesmen: SalesmanRef[];
};

export type SalesmanInvoiceResult = {
  salesman: SalesmanRef;
  sumPrimary: number;
  sumSecondary: number;
  netAmount: number;
  primaryCount: number;
  secondaryCount: number;
  hasOe304Data: boolean;
};

export function useFetchOe000304BySalesmen() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const fetchSalesmenInvoices = useCallback(
    async ({
      urlser,
      serviceID,
      loginGuid,
      fromDate,
      toDate,
      salesmen,
    }: FetchSalesmenInvoicesParams): Promise<SalesmanInvoiceResult[]> => {
      setIsPending(true);
      const results: SalesmanInvoiceResult[] = [];
      try {
        for (const salesman of salesmen) {
          const slmnKey = String(salesman.slmnKey ?? '').trim();
          const slmnCode = String(salesman.slmnCode ?? '').trim();
          const netSales = await queryClient.fetchQuery({
            queryKey: [
              'oe000304',
              'salesman',
              'net',
              slmnKey || slmnCode,
              fromDate,
              toDate,
              loginGuid,
              OE000304_PRIMARY_PROPERTIES.join('-'),
              OE000304_SECONDARY_PROPERTIES.join('-'),
            ],
            queryFn: () =>
              calculateSalesmanNetSales({
                urlser,
                serviceID,
                loginGuid,
                slmnKey: slmnKey || undefined,
                slmnCode: slmnCode || undefined,
                fromDate,
                toDate,
              }),
          });

          if (!netSales.hasOe304Data) {
            continue;
          }

          results.push({
            salesman,
            sumPrimary: netSales.sumPrimary,
            sumSecondary: netSales.sumSecondary,
            netAmount: netSales.netAmount,
            primaryCount: netSales.primaryCount,
            secondaryCount: netSales.secondaryCount,
            hasOe304Data: netSales.hasOe304Data,
          });
        }
        return results;
      } finally {
        setIsPending(false);
      }
    },
    [queryClient],
  );

  return { fetchSalesmenInvoices, isPending };
}

export type FetchArMonthlySalesParams = {
  urlser: string;
  serviceID: string;
  loginGuid: string;
  arKey: string;
  fromDate: string;
  toDate: string;
};

export function useFetchOe000304ByAr() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const fetchArMonthlySales = useCallback(
    async ({
      urlser,
      serviceID,
      loginGuid,
      arKey,
      fromDate,
      toDate,
    }: FetchArMonthlySalesParams) => {
      setIsPending(true);
      try {
        return await queryClient.fetchQuery({
          queryKey: [
            'oe000304',
            'ar',
            'monthly',
            arKey,
            fromDate,
            toDate,
            loginGuid,
            OE000304_PRIMARY_PROPERTIES.join('-'),
            OE000304_SECONDARY_PROPERTIES.join('-'),
          ],
          queryFn: () =>
            calculateArNetSalesByMonth({
              urlser,
              serviceID,
              loginGuid,
              arKey,
              fromDate,
              toDate,
            }),
        });
      } finally {
        setIsPending(false);
      }
    },
    [queryClient],
  );

  return { fetchArMonthlySales, isPending };
}

export type FetchGlobalMonthlySalesParams = {
  urlser: string;
  serviceID: string;
  loginGuid: string;
  fromDate: string;
  toDate: string;
};

export function useFetchOe000304Global() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const fetchGlobalMonthlySales = useCallback(
    async ({
      urlser,
      serviceID,
      loginGuid,
      fromDate,
      toDate,
    }: FetchGlobalMonthlySalesParams) => {
      setIsPending(true);
      try {
        return await queryClient.fetchQuery({
          queryKey: [
            'oe000304',
            'global',
            'monthly',
            'trd-g-sell-v2',
            fromDate,
            toDate,
            loginGuid,
            OE000304_PRIMARY_PROPERTIES.join('-'),
            OE000304_SECONDARY_PROPERTIES.join('-'),
          ],
          queryFn: () =>
            calculateGlobalNetSalesByMonth({
              urlser,
              serviceID,
              loginGuid,
              fromDate,
              toDate,
            }),
        });
      } finally {
        setIsPending(false);
      }
    },
    [queryClient],
  );

  return { fetchGlobalMonthlySales, isPending };
}

export function useFetchOe000304GlobalDaily() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const fetchGlobalDailySales = useCallback(
    async ({
      urlser,
      serviceID,
      loginGuid,
      fromDate,
      toDate,
    }: FetchGlobalMonthlySalesParams) => {
      setIsPending(true);
      try {
        return await queryClient.fetchQuery({
          queryKey: [
            'oe000304',
            'global',
            'daily',
            'trd-g-sell-v3',
            fromDate,
            toDate,
            loginGuid,
            OE000304_PRIMARY_PROPERTIES.join('-'),
            OE000304_SECONDARY_PROPERTIES.join('-'),
          ],
          queryFn: () =>
            calculateGlobalNetSalesByDay({
              urlser,
              serviceID,
              loginGuid,
              fromDate,
              toDate,
            }),
        });
      } finally {
        setIsPending(false);
      }
    },
    [queryClient],
  );

  return { fetchGlobalDailySales, isPending };
}

export type FetchArSalesByGoodsParams = {
  urlser: string;
  serviceID: string;
  loginGuid: string;
  arKey: string;
  fromDate: string;
  toDate: string;
};

export function useFetchArSalesByGoods() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const fetchArSalesByGoods = useCallback(
    async ({
      urlser,
      serviceID,
      loginGuid,
      arKey,
      fromDate,
      toDate,
    }: FetchArSalesByGoodsParams) => {
      setIsPending(true);
      console.log('[useFetchArSalesByGoods] start', {
        arKey,
        fromDate,
        toDate,
      });
      try {
        const result = await queryClient.fetchQuery({
          queryKey: [
            'oe000304',
            'ar',
            'goods',
            'icdept-thaidesc',
            arKey,
            fromDate,
            toDate,
            loginGuid,
            OE000304_PRIMARY_PROPERTIES.join('-'),
          ],
          queryFn: () =>
            calculateArSalesByGoodsCode({
              urlser,
              serviceID,
              loginGuid,
              arKey,
              fromDate,
              toDate,
            }),
        });
        console.log('[useFetchArSalesByGoods] done', {
          arKey,
          rowCount: result.rows.length,
          diKeyCount: result.diKeyCount,
          lineCount: result.lineCount,
          sampleRow: result.rows[0],
        });
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [queryClient],
  );

  return { fetchArSalesByGoods, isPending };
}

export type FetchCurrentStatusNetIncomeParams = {
  urlser: string;
  serviceID: string;
  loginGuid: string;
  toDate: string;
};

export type CurrentStatusNetIncomeResult = {
  lastMonth: number;
  thisYear: number;
  lastYear: number;
};

export function useFetchCurrentStatusNetIncome() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const fetchCurrentStatusNetIncome = useCallback(
    async ({
      urlser,
      serviceID,
      loginGuid,
      toDate,
    }: FetchCurrentStatusNetIncomeParams): Promise<CurrentStatusNetIncomeResult> => {
      setIsPending(true);
      try {
        const ranges = resolveFinanceRatioDateRanges(toDate);
        const baseParams = { urlser, serviceID, loginGuid };

        const fetchRangeNet = (rangeKey: keyof typeof ranges) => {
          const { fromDate, toDate: rangeToDate } = ranges[rangeKey];
          return queryClient
            .fetchQuery({
              queryKey: [
                'oe000304',
                'global',
                'monthly',
                'trd-g-sell-v2',
                fromDate,
                rangeToDate,
                loginGuid,
                OE000304_PRIMARY_PROPERTIES.join('-'),
                OE000304_SECONDARY_PROPERTIES.join('-'),
              ],
              queryFn: () =>
                calculateGlobalNetSalesByMonth({
                  ...baseParams,
                  fromDate,
                  toDate: rangeToDate,
                }),
            })
            .then(result => getNetForMonthRange(result, fromDate, rangeToDate));
        };

        const [lastMonth, thisYear, lastYear] = await Promise.all([
          fetchRangeNet('lastMonth'),
          fetchRangeNet('thisYear'),
          fetchRangeNet('lastYear'),
        ]);

        return {
          lastMonth,
          thisYear,
          lastYear,
        };
      } finally {
        setIsPending(false);
      }
    },
    [queryClient],
  );

  return { fetchCurrentStatusNetIncome, isPending };
}
