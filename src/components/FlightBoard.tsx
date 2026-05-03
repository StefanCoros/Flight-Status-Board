import { Divider, Empty, Input, Segmented, Select } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { FlightGroup } from "./FlightGroup";
import { RefreshControls } from "./RefreshControls";
import { StatusIndicator } from "./StatusIndicator";
import { useDebounce } from "../hooks/useDebounce";
import { useFlightData } from "../hooks/useFlightData";
import {
  FlightStatus,
  type GroupKey,
  type StatusFilter,
} from "../types/flight";
import { filterFlights } from "../utils/filterFlights";
import { groupBy } from "../utils/groupBy";
import {
  compareGroupNames,
  groupingStrategies,
} from "../utils/groupingStrategies";
import { toggleCollapsedForKeys } from "../utils/toggleGroupExpansion";

import styles from "./FlightBoard.module.scss";

interface StatusOptionConfig {
  labelKey: string;
  value: StatusFilter;
}

const statusOptionsConfig: StatusOptionConfig[] = [
  { labelKey: "filter.all", value: "all" },
  { labelKey: "status.on-time", value: FlightStatus.OnTime },
  { labelKey: "status.delayed", value: FlightStatus.Delayed },
  { labelKey: "status.cancelled", value: FlightStatus.Cancelled },
];

interface GroupOptionConfig {
  labelKey: string;
  value: GroupKey;
}

const groupOptionsConfig: GroupOptionConfig[] = [
  { labelKey: "group.byTerminal", value: "terminal" },
  { labelKey: "group.byGate", value: "gate" },
];

type StatTone = "total" | "on-time" | "delayed" | "cancelled";

interface StatCardConfig {
  tone: StatTone;
  filter: StatusFilter;
}

const statCards: StatCardConfig[] = [
  { tone: "total", filter: "all" },
  { tone: "on-time", filter: FlightStatus.OnTime },
  { tone: "delayed", filter: FlightStatus.Delayed },
  { tone: "cancelled", filter: FlightStatus.Cancelled },
];

const SEARCH_DEBOUNCE_MS = 3000;

export const FlightBoard = (): ReactElement => {
  const { t } = useTranslation();
  const { flights, dataState, refresh } = useFlightData();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [groupKey, setGroupKey] = useState<GroupKey>("terminal");
  const [search, setSearch] = useState<string>("");
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [expandSearchValue, setExpandSearchValue] = useState<string>("");

  const [debouncedSearch, flushSearch] = useDebounce(
    search,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setCollapsedKeys(new Set());
  }, [groupKey]);

  const now = useMemo(() => new Date(), [dataState]);

  const searchFiltered = useMemo(
    () => filterFlights(flights, "all", debouncedSearch),
    [flights, debouncedSearch],
  );

  const filtered = useMemo(
    () => filterFlights(searchFiltered, statusFilter, ""),
    [searchFiltered, statusFilter],
  );

  const grouped = useMemo(
    () => groupBy(filtered, groupingStrategies[groupKey]),
    [filtered, groupKey],
  );

  const sortedGroups = useMemo(
    () =>
      Object.entries(grouped)
        .sort(([a], [b]) => compareGroupNames(a, b))
        .map(([name, items]) => {
          const sortedFlights = [...items].sort(
            (x, y) => x.departureTime.getTime() - y.departureTime.getTime(),
          );
          const first = sortedFlights[0];
          const identifier =
            groupKey === "terminal"
              ? String(first?.terminal ?? "")
              : (first?.gate ?? "");
          return {
            key: name,
            kind: groupKey,
            identifier,
            flights: sortedFlights,
          };
        }),
    [grouped, groupKey],
  );

  const handleStatusChange = useCallback((value: string | number) => {
    setStatusFilter(value as StatusFilter);
  }, []);

  const handleGroupChange = useCallback((value: GroupKey) => {
    setGroupKey(value);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    [],
  );

  const handleGroupToggle = useCallback((key: string) => {
    setCollapsedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const isInitialLoading = dataState.phase === "initialLoading";
  const isInitialError = dataState.phase === "initialError";
  const showBoard = !isInitialLoading && !isInitialError;

  const stats = useMemo<Record<StatTone, number>>(() => {
    let onTime = 0;
    let delayed = 0;
    let cancelled = 0;
    for (const f of searchFiltered) {
      if (f.status === FlightStatus.OnTime) onTime += 1;
      else if (f.status === FlightStatus.Delayed) delayed += 1;
      else if (f.status === FlightStatus.Cancelled) cancelled += 1;
    }
    return {
      total: searchFiltered.length,
      "on-time": onTime,
      delayed,
      cancelled,
    };
  }, [searchFiltered]);

  const handleStatCardClick = useCallback((filter: StatusFilter) => {
    setStatusFilter(filter);
  }, []);

  const statusOptions = useMemo(
    () =>
      statusOptionsConfig.map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      })),
    [t],
  );

  const groupOptions = useMemo(
    () =>
      groupOptionsConfig.map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      })),
    [t],
  );

  const expandOptions = useMemo(
    () =>
      sortedGroups.map((group) => ({
        value: group.key,
        label: t(`group.${group.kind}`, { value: group.identifier }),
      })),
    [sortedGroups, t],
  );

  const expandedGroupKeys = useMemo(
    () => sortedGroups.map((g) => g.key).filter((k) => !collapsedKeys.has(k)),
    [sortedGroups, collapsedKeys],
  );

  const handleExpandedChange = useCallback(
    (selected: string[]) => {
      const selectedSet = new Set(selected);
      const allKeys = sortedGroups.map((g) => g.key);
      setCollapsedKeys(new Set(allKeys.filter((k) => !selectedSet.has(k))));
    },
    [sortedGroups],
  );

  const matchesExpandSearch = useCallback(
    (label: string, query: string): boolean => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return label.toLowerCase().includes(q);
    },
    [],
  );

  const visibleExpandOptions = useMemo(
    () =>
      expandOptions.filter((option) =>
        matchesExpandSearch(option.label, expandSearchValue),
      ),
    [expandOptions, expandSearchValue, matchesExpandSearch],
  );

  const allVisibleGroupsSelected =
    visibleExpandOptions.length > 0 &&
    visibleExpandOptions.every((option) => !collapsedKeys.has(option.value));

  const handleToggleVisibleGroups = useCallback(() => {
    const visibleKeys = visibleExpandOptions.map((o) => o.value);
    setCollapsedKeys((prev) => toggleCollapsedForKeys(prev, visibleKeys));
  }, [visibleExpandOptions]);

  const filterExpandOption = useCallback(
    (input: string, option?: { label?: ReactNode }) => {
      const label = typeof option?.label === "string" ? option.label : "";
      return matchesExpandSearch(label, input);
    },
    [matchesExpandSearch],
  );

  const renderExpandDropdown = useCallback(
    (menu: ReactNode) => (
      <>
        <button
          type="button"
          className={styles.selectAllOption}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleToggleVisibleGroups}
          disabled={visibleExpandOptions.length === 0}
        >
          {allVisibleGroupsSelected
            ? t("filter.unselectAll")
            : t("filter.selectAll")}
        </button>
        <Divider className={styles.selectAllDivider} />
        {menu}
      </>
    ),
    [
      allVisibleGroupsSelected,
      handleToggleVisibleGroups,
      t,
      visibleExpandOptions.length,
    ],
  );

  const expandLabel =
    groupKey === "terminal" ? t("filter.terminals") : t("filter.gates");

  return (
    <div className={styles.board}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{t("appTitle")}</h1>
          <p className={styles.subtitle}>{t("appSubtitle")}</p>
        </div>
        <RefreshControls dataState={dataState} onRefresh={refresh} now={now} />
      </header>

      {showBoard && (
        <div className={styles.statsRow}>
          {statCards.map((card) => {
            const isActive = statusFilter === card.filter;
            const label = t(`stats.${card.tone}`);
            return (
              <button
                key={card.tone}
                type="button"
                className={styles.statCard}
                data-tone={card.tone}
                aria-pressed={isActive}
                aria-label={t("filter.filterBy", { label })}
                onClick={() => handleStatCardClick(card.filter)}
              >
                <span className={styles.statValue}>{stats[card.tone]}</span>
                <span className={styles.statLabel}>{label}</span>
              </button>
            );
          })}
        </div>
      )}

      <StatusIndicator dataState={dataState} onRetry={refresh} now={now} />

      {showBoard && (
        <>
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <Input.Search
                allowClear
                placeholder={t("search.placeholder")}
                value={search}
                onChange={handleSearchChange}
                onSearch={flushSearch}
                className={styles.search}
              />
              <Segmented
                options={statusOptions}
                value={statusFilter}
                onChange={handleStatusChange}
              />
            </div>

            <div className={styles.toolbarRight}>
              <span className={styles.toolbarLabel}>
                {t("filter.groupByLabel")}
              </span>
              <Select<GroupKey>
                options={groupOptions}
                value={groupKey}
                onChange={handleGroupChange}
                className={styles.groupSelect}
              />
              <span className={styles.toolbarLabel}>{expandLabel}</span>
              <Select<string[]>
                mode="multiple"
                allowClear
                options={expandOptions}
                value={expandedGroupKeys}
                onChange={handleExpandedChange}
                className={styles.expandSelect}
                maxTagCount="responsive"
                placeholder={t("filter.expandPlaceholder")}
                popupRender={renderExpandDropdown}
                searchValue={expandSearchValue}
                onSearch={setExpandSearchValue}
                filterOption={filterExpandOption}
              />
            </div>
          </div>

          <div className={styles.groups}>
            {sortedGroups.length === 0 ? (
              <Empty description={t("empty")} />
            ) : (
              sortedGroups.map((group) => (
                <FlightGroup
                  key={group.key}
                  kind={group.kind}
                  identifier={group.identifier}
                  flights={group.flights}
                  isExpanded={!collapsedKeys.has(group.key)}
                  onToggle={() => handleGroupToggle(group.key)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
