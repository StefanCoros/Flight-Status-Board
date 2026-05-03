import { SyncOutlined } from "@ant-design/icons";
import { Button, Switch, Tooltip, Typography } from "antd";
import { useCallback, useState } from "react";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { useLanguage } from "../hooks/useLanguage";
import { useTheme } from "../hooks/useTheme";
import { isErrorSimulationOn, toggleErrorSimulation } from "../services/api";
import type { DataState } from "../types/flight";
import { formatRelativeTime } from "../utils/formatTime";

import styles from "./RefreshControls.module.scss";

export interface RefreshControlsProps {
  dataState: DataState;
  onRefresh: () => void;
  now: Date;
}

const lastUpdatedFrom = (state: DataState): Date | null => {
  switch (state.phase) {
    case "loaded":
    case "backgroundRefreshing":
    case "staleError":
      return state.lastUpdated;
    default:
      return null;
  }
};

export const RefreshControls = ({
  dataState,
  onRefresh,
  now,
}: RefreshControlsProps): ReactElement => {
  const { t } = useTranslation();

  const lastUpdated = lastUpdatedFrom(dataState);
  const isRefreshing =
    dataState.phase === "backgroundRefreshing" ||
    dataState.phase === "initialLoading";

  const [theme, setTheme] = useTheme();
  const [language, setLanguage] = useLanguage();
  const [errorSim, setErrorSim] = useState<boolean>(isErrorSimulationOn());

  const isDark = theme === "dark";
  const isEnglish = language === "en";

  const handleErrorSimToggle = useCallback((checked: boolean) => {
    toggleErrorSimulation();
    setErrorSim(checked);
  }, []);

  const relative = lastUpdated ? formatRelativeTime(lastUpdated, now) : null;
  const lastUpdatedText = relative
    ? t("controls.lastUpdated", {
        when: t(relative.key, { count: relative.count }),
      })
    : "";

  return (
    <div className={styles.controls}>
      <Tooltip
        title={
          isDark
            ? t("controls.themeSwitchToLight")
            : t("controls.themeSwitchToDark")
        }
      >
        <span className={styles.toggle}>
          <label htmlFor="theme-switch" className={styles.toggleLabel}>
            {t("controls.themeLabel")}
          </label>
          <Switch
            id="theme-switch"
            checked={isDark}
            onChange={(checked) => setTheme(checked ? "dark" : "light")}
            checkedChildren={t("controls.themeDark")}
            unCheckedChildren={t("controls.themeLight")}
          />
        </span>
      </Tooltip>

      <Tooltip
        title={
          isEnglish
            ? t("controls.languageSwitchToRomanian")
            : t("controls.languageSwitchToEnglish")
        }
      >
        <span className={styles.toggle}>
          <label htmlFor="language-switch" className={styles.toggleLabel}>
            {t("controls.languageLabel")}
          </label>
          <Switch
            id="language-switch"
            checked={isEnglish}
            onChange={(checked) => setLanguage(checked ? "en" : "ro")}
            checkedChildren="EN"
            unCheckedChildren="RO"
          />
        </span>
      </Tooltip>
      <Tooltip title={t("controls.simulateErrorTooltip")}>
        <span className={styles.toggle}>
          <label htmlFor="error-sim-switch" className={styles.toggleLabel}>
            {t("controls.simulateError")}
          </label>
          <Switch
            id="error-sim-switch"
            checked={errorSim}
            onChange={handleErrorSimToggle}
          />
        </span>
      </Tooltip>
      {lastUpdated && (
        <Typography.Text className={styles.timestamp}>
          {lastUpdatedText}
        </Typography.Text>
      )}
      <Tooltip title={t("controls.refreshNow")}>
        <Button
          type="primary"
          ghost
          icon={<SyncOutlined spin={isRefreshing} />}
          onClick={onRefresh}
          loading={false}
        >
          {t("controls.refresh")}
        </Button>
      </Tooltip>
    </div>
  );
};
