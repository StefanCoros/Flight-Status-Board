import type { ReactElement } from 'react';

import { FlightBoard } from './components/FlightBoard';

import styles from './App.module.scss';

export const App = (): ReactElement => (
  <div className={styles.app}>
    <FlightBoard />
  </div>
);
