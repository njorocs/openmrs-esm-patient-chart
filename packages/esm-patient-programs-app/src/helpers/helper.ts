import { navigate } from '@openmrs/esm-framework';
import { formEntrySub, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

export function launchFormEntry(formUuid: string, patientUuid: string, encounterUuid?: string, formName?: string) {
  formEntrySub.next({ formUuid, encounterUuid });
  launchPatientWorkspace('patient-form-entry-workspace', { workspaceTitle: formName });
  navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart` });
}
