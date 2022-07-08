import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Program } from '../types';
import { useMemo } from 'react';

export const useEligiblePrograms = (patientUuid: string) => {
  const eligibleProgramsUrl = `/ws/rest/v1/kenyaemr/eligiblePrograms?patientUuid=${patientUuid}`;
  const { data, error, mutate, isValidating } = useSWR<{ data: Array<Program> }>(eligibleProgramsUrl, openmrsFetch);

  const eligiblePrograms = useMemo(() => data?.data ?? [], [data]);
  return { eligiblePrograms: eligiblePrograms, isLoading: !data && !error, error, mutate, isValidating };
};
