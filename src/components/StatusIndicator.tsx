import { Alert, Button, Spin } from 'antd';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { DataState } from '../types/flight';
import { formatRelativeTime } from '../utils/formatTime';

import styles from './StatusIndicator.module.scss';

export interface StatusIndicatorProps {
  dataState: DataState;
  onRetry: () => void;
  now: Date;
}

export const StatusIndicator = ({
  dataState,
  onRetry,
  now,
}: StatusIndicatorProps): ReactElement | null => {
  const { t } = useTranslation();

  switch (dataState.phase) {
    case 'initialLoading':
      return (
        <div className={styles.fullPage} role="status" aria-live="polite">
          <Spin size="large" />
          <p className={styles.loadingText}>{t('loading')}</p>
        </div>
      );

    case 'initialError':
      return (
        <Alert
          className={styles.banner}
          type="error"
          showIcon
          message={t('errors.couldNotLoad')}
          description={dataState.error}
          action={
            <Button size="small" type="primary" danger onClick={onRetry}>
              {t('errors.retry')}
            </Button>
          }
        />
      );

    case 'staleError': {
      const relative = formatRelativeTime(dataState.lastUpdated, now);
      const when = t(relative.key, { count: relative.count });
      return (
        <Alert
          className={styles.banner}
          type="warning"
          showIcon
          message={t('errors.stale')}
          description={t('errors.staleDescription', {
            error: dataState.error,
            when,
          })}
          action={
            <Button size="small" onClick={onRetry}>
              {t('errors.retry')}
            </Button>
          }
        />
      );
    }

    case 'loaded':
    case 'backgroundRefreshing':
    case 'idle':
    default:
      return null;
  }
};
