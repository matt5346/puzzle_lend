import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { RootStore, storesContext } from '@src/stores';
import { loadState, saveState } from '@src/common/utils/localStorage';
import { autorun } from 'mobx';

import './index.scss';
import App from './App';

const initState = loadState();

const mobxStore = new RootStore(initState);
autorun(
  () => {
    saveState(mobxStore.serialize());
  },
  { delay: 1000 }
);

ReactDOM.render(
  <storesContext.Provider value={mobxStore}>
    <Router>
      <App />
    </Router>
  </storesContext.Provider>,
  document.getElementById('root')
);
