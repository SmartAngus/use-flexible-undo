import React, { FC } from 'react';
import {
  makeUnducer,
  PayloadFromTo,
  invertHandlers,
  makeUndoableFTHandler,
  makeUndoableUpdater,
  useUndoableReducer,
} from '../../src';
import { merge, addUpdater, subtractUpdater } from '../examples-util';
import { topUIStyle, rootStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { ActionList } from '../components/action-list';
import { BranchNav } from '../components/branch-nav';
import { makeUndoableReducer } from '../../src/make-undoable-reducer';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: void;
  subtract: void;
  updateAmount: PayloadFromTo<Nullber>;
}

const undoableAddHandler = makeUndoableUpdater(
  (state: State) => state.count,
  count => merge({ count })
)(() => state => state.amount || 0)(addUpdater, subtractUpdater);

const { reducer, actionCreators } = makeUnducer<State, PayloadByType>({
  add: undoableAddHandler,
  subtract: invertHandlers(undoableAddHandler),
  updateAmount: makeUndoableFTHandler(amount => merge({ amount })),
});

const undoableReducer = makeUndoableReducer(reducer);

export const UseUndoableUnducerExample: FC = () => {
  const {
    state,
    history,
    undoables,
    undo,
    redo,
    timeTravel,
    switchToBranch,
  } = useUndoableReducer({
    reducer: undoableReducer,
    initialState: {
      count: 0,
      amount: 1,
    },
    actionCreators,
  });

  const { count, amount } = state;

  const { add, subtract, updateAmount } = undoables;

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count &nbsp;= &nbsp;{count}</div>
        <div className={actionsStyle}>
          <label>
            amount =&nbsp;
            <NumberInput
              value={amount}
              onChange={value =>
                updateAmount({
                  from: amount,
                  to: value,
                })
              }
            />
          </label>
          <button disabled={!amount} onClick={() => add()}>
            add
          </button>
          <button disabled={!amount} onClick={() => subtract()}>
            subtract
          </button>
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