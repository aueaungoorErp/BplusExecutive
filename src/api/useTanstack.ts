import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  calculateTeamNetSales,
  OE000304_PRIMARY_PROPERTIES,
  OE000304_SECONDARY_PROPERTIES,
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
                sltCode: team.sltCode,
                fromDate,
                toDate,
              }),
          });

          console.log('[ShowInComeTeam] Oe000304', {
            sltCode: team.sltCode,
            sltName: team.sltName,
            sum302307: netSales.sumPrimary,
            sum337308: netSales.sumSecondary,
            netAmount: netSales.netAmount,
          });

          results.push({
            team,
            sumPrimary: netSales.sumPrimary,
            sumSecondary: netSales.sumSecondary,
            netAmount: netSales.netAmount,
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
