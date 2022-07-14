import React from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import TrashCan16 from '@carbon/icons-react/es/trash-can/16';
import styles from './programs-overview.scss';
import { formatDate, formatDatetime, usePagination } from '@openmrs/esm-framework';
import {
  DataTable,
  DataTableSkeleton,
  Button,
  InlineLoading,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  InlineNotification,
} from 'carbon-components-react';
import filter from 'lodash-es/filter';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  PatientChartPagination,
  launchPatientWorkspace,
} from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useAvailablePrograms, useEnrollments, useKenyaEMRProgram } from './programs.resource';
import { launchFormEntry } from '../helpers/helper';
import { capitalize } from 'lodash';

interface ProgramsOverviewProps {
  basePath: string;
  patientUuid: string;
}

const ProgramsOverview: React.FC<ProgramsOverviewProps> = ({ basePath, patientUuid }) => {
  const programsCount = 5;
  const { t } = useTranslation();
  const displayText = t('programs', 'Program enrollments');
  const headerTitle = t('carePrograms', 'Care Programs');
  const urlLabel = t('seeAll', 'See all');
  const pageUrl = window.spaBase + basePath + '/programs';

  const { data: enrollments, isError, isLoading, isValidating } = useKenyaEMRProgram(patientUuid);

  const { data: availablePrograms } = useAvailablePrograms();

  const eligiblePrograms = filter(
    availablePrograms,
    (program) => !includes(map(enrollments, 'program.uuid'), program.uuid),
  );

  const { results: paginatedEnrollments, goTo, currentPage } = usePagination(enrollments ?? [], programsCount);

  const launchProgramsForm = React.useCallback(() => launchPatientWorkspace('programs-form-workspace'), []);

  const tableHeaders = [
    {
      key: 'display',
      header: t('activePrograms', 'programs'),
    },
    {
      key: 'status',
      header: t('status', 'Status'),
    },
    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
  ];

  const tableRows = React.useMemo(() => {
    return paginatedEnrollments?.map((enrollment) => ({
      id: enrollment.uuid,
      display: enrollment.display,
      status: capitalize(enrollment.enrollmentStatus),
      actions:
        enrollment.enrollmentStatus === 'active' ? (
          <Button renderIcon={TrashCan16} onClick={() => launchFormEntry(enrollment.discontinuationFormUuid, patientUuid)} kind="danger--tertiary">
            Discontinue
          </Button>
        ) : (
          <Button renderIcon={Add16} onClick={() => launchFormEntry(enrollment.enrollmentFormUuid, patientUuid)} kind="tertiary">
            Enroll
          </Button>
        ),
    }));
  }, [paginatedEnrollments, patientUuid]);

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (enrollments?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button
            kind="ghost"
            renderIcon={Add16}
            iconDescription="Add programs"
            onClick={launchProgramsForm}
            disabled={availablePrograms?.length && eligiblePrograms?.length === 0}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>
        <TableContainer>
          {availablePrograms?.length && eligiblePrograms?.length === 0 && (
            <InlineNotification
              style={{ minWidth: '100%', margin: '0rem', padding: '0rem' }}
              kind={'info'}
              lowContrast
              subtitle={t('noEligibleEnrollments', 'There are no more programs left to enroll this patient in')}
              title={t('fullyEnrolled', 'Enrolled in all programs')}
            />
          )}
          <DataTable rows={tableRows} headers={tableHeaders} isSortable={true} size="short">
            {({ rows, headers, getHeaderProps, getTableProps }) => (
              <Table {...getTableProps()} useZebraStyles>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        className={`${styles.productiveHeading01} ${styles.text02}`}
                        {...getHeaderProps({
                          header,
                          isSortable: header.isSortable,
                        })}
                      >
                        {header.header?.content ?? header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DataTable>
        </TableContainer>
        <PatientChartPagination
          currentItems={paginatedEnrollments.length}
          onPageNumberChange={({ page }) => goTo(page)}
          pageNumber={currentPage}
          pageSize={programsCount}
          totalItems={enrollments.length}
          dashboardLinkUrl={pageUrl}
          dashboardLinkLabel={urlLabel}
        />
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchProgramsForm} />;
};

export default ProgramsOverview;
