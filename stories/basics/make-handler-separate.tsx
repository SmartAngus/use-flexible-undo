import React, { FC, useState } from 'react';
import { useUndoableEffects, makeHandler } from 'use-flexible-undo';
import { rootStyle, topUIStyle, actionsStyle, countStyle } from '../styles';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';
import { addUpdater, subtractUpdater } from '../examples-util';

export const SeparateDrdoAndUndoHandlersExample: FC = () => {
  const [count, setCount] = useState(0);

  const countHandler = makeHandler(setCount);
  const addHandler = countHandler(addUpdater);
  const subHandler = countHandler(subtractUpdater);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
    drdoHandlers: {
      add: addHandler,
      subtract: subHandler,
    },
    undoHandlers: {
      add: subHandler,
      subtract: addHandler,
    },
  });

  const { add, subtract } = undoables;

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count = {count}</div>
        <div className={actionsStyle}>
          <button onClick={() => add(2)}>add 2</button>
          <button onClick={() => subtract(1)}>subtract 1</button>
        </div>
        <BranchNav
          history={history}
          switchToBranch={switchToBranch}
          undo={undo}
          redo={redo}
        />
      </div>
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};
