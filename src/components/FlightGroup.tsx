import { RightOutlined } from '@ant-design/icons';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { FlightRow } from './FlightRow';
import type { Flight, GroupKey } from '../types/flight';

import styles from './FlightGroup.module.scss';

export interface FlightGroupProps {
  kind: GroupKey;
  identifier: string | number;
  flights: Flight[];
  isExpanded: boolean;
  onToggle: () => void;
}

export const FlightGroup = ({
  kind,
  identifier,
  flights,
  isExpanded,
  onToggle,
}: FlightGroupProps): ReactElement => {
  const { t } = useTranslation();

  const title = t(`group.${kind}`, { value: identifier });
  const countLabel = t('flightCount', { count: flights.length });

  return (
    <section className={styles.group} aria-label={title}>
      <button
        type="button"
        className={styles.header}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span className={styles.headerLeft}>
          <RightOutlined className={styles.caret} aria-hidden="true" />
          <span className={styles.title}>{title}</span>
        </span>
        <span className={styles.count}>{countLabel}</span>
      </button>

      {isExpanded && (
        <div className={styles.rows}>
          {flights.map((flight) => (
            <FlightRow key={flight.flightNumber} flight={flight} />
          ))}
        </div>
      )}
    </section>
  );
};
