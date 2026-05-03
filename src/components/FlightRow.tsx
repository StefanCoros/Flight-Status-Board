import { Tag } from "antd";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { statusMeta } from "../utils/statusMeta";
import { formatClock } from "../utils/formatTime";
import type { Flight } from "../types/flight";

import styles from "./FlightRow.module.scss";

export interface FlightRowProps {
  flight: Flight;
}

export const FlightRow = ({ flight }: FlightRowProps): ReactElement => {
  const { t } = useTranslation();
  const meta = statusMeta[flight.status];

  return (
    <div className={styles.row} data-status={meta.tone}>
      <div className={styles.cell}>
        <span className={styles.label}>{t("row.flight")}</span>
        <span className={styles.flightNumber}>{flight.flightNumber}</span>
      </div>

      <div className={styles.cell}>
        <span className={styles.label}>{t("row.destination")}</span>
        <span className={styles.destination} title={flight.destination}>
          {flight.destination}
        </span>
      </div>

      <div className={styles.cell}>
        <span className={styles.label}>{t("row.departure")}</span>
        <span className={styles.time}>{formatClock(flight.departureTime)}</span>
      </div>

      <div className={styles.cell}>
        <span className={styles.label}>{t("row.terminal")}</span>
        <span className={styles.terminal}>{flight.terminal}</span>
      </div>

      <div className={styles.cell}>
        <span className={styles.label}>{t("row.gate")}</span>
        <span className={styles.gate}>{flight.gate}</span>
      </div>

      <div className={styles.cell}>
        <span className={styles.label}>{t("row.flightStatus")}</span>
        <Tag color={meta.color} className={styles.statusTag}>
          {t(`status.${meta.tone}`)}
        </Tag>
      </div>
    </div>
  );
};
