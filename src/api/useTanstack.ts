import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchOe000304ByTeam } from './until';

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
    }: FetchTeamsInvoicesParams) => {
      setIsPending(true);
      const results = [];
      try {
        for (const team of teams) {
          const data = await queryClient.fetchQuery({
            queryKey: ['oe000304', team.sltCode, fromDate, toDate, loginGuid],
            queryFn: () =>
              fetchOe000304ByTeam({
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
            response: data,
          });
          results.push({ team, data });
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
