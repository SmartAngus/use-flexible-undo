import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { Action, TimeTravelFn } from '../../src/index.types';

export const Stack: React.FC<{
  stack: { past: Action[]; future: Action[] };
  timeTravel: TimeTravelFn;
}> = ({ stack, timeTravel }) => {
  const [now, setNow] = useState(new Date());
  useInterval(() => setNow(new Date()), 10000);
  return (
    <Root>
      {stack.future.map((action, index) => (
        <div
          key={index}
          style={{ cursor: 'pointer' }}
          onClick={() => timeTravel('future', index)}
        >
          <StackItem action={action} now={now} />
        </div>
      ))}
      <Present>
        undoable past &darr; &uarr; redoable future - click on an item to time
        travel
      </Present>
      {stack.past.map((action, index) => (
        <div
          key={index}
          style={{ cursor: 'pointer' }}
          onClick={() => timeTravel('past', index)}
        >
          <StackItem action={action} now={now} />
        </div>
      ))}
    </Root>
  );
};

const Root = styled.div`
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-size: 12px;
`;

const Present = styled.div`
  color: #bbb;
  padding: 8px 0px;
`;

const StackItem: React.FC<{ action: Action; now: Date }> = ({
  action: { type, payload, created },
  now,
}) => (
  <StackItemRoot>
    {Boolean(created) && (
      <div style={{ color: '#BBB', width: '100px' }}>
        {formatTime(created!, now)}
      </div>
    )}
    <div style={{ flex: 1 }}>{JSON.stringify({ type, payload })}</div>
  </StackItemRoot>
);

const StackItemRoot = styled.div`
  padding: 8px 0px;
  display: flex;
  &:hover {
    background: #eee;
  }
`;

// From: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
const useInterval = (callback: (...args: any[]) => any, delay: number) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
    return undefined;
  }, [delay]);
};

const formatTime = (created: Date, now: Date): string => {
  const diffSecs = (now.getTime() - created.getTime()) / 1000;
  if (diffSecs < 10) {
    return `a moment ago`;
  }
  if (diffSecs < 55) {
    return `${Math.round(diffSecs / 10) * 10} seconds ago`;
  }
  const diffMinutes = diffSecs / 60;
  if (diffMinutes < 60) {
    const d = Math.round(diffMinutes);
    return `${d} minute${getPluralString(d)} ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  return `${diffHours} hour${getPluralString(diffHours)} ago`;
};

const getPluralString = (amount: number) => (amount === 1 ? '' : 's');