import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  calculateSalesmanNetSales,
  calculateTeamNetSales,
  OE000304_PRIMARY_PROPERTIES,
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
  netAmount: number;
  primaryCount: number;
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

          console.log('[ShowInComeTeam] Oe000304', {
            sltCode: team.sltCode,
            sltName: team.sltName,
            sum302307: netSales.sumPrimary,
            netAmount: netSales.netAmount,
            primaryCount: netSales.primaryCount,
            hasOe304Data: netSales.hasOe304Data,
          });

          results.push({
            team,
            sumPrimary: netSales.sumPrimary,
            netAmount: netSales.netAmount,
            primaryCount: netSales.primaryCount,
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
  netAmount: number;
  primaryCount: number;
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

          console.log('[IncomeBySlmn] Oe000304', {
            slmnKey: salesman.slmnKey,
            slmnCode: salesman.slmnCode,
            slmnName: salesman.slmnName,
            sum302307: netSales.sumPrimary,
            netAmount: netSales.netAmount,
            primaryCount: netSales.primaryCount,
            hasOe304Data: netSales.hasOe304Data,
          });

          results.push({
            salesman,
            sumPrimary: netSales.sumPrimary,
            netAmount: netSales.netAmount,
            primaryCount: netSales.primaryCount,
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
