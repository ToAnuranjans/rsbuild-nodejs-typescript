import React, { useMemo } from 'react';
import './app.css';

const App = () => {
  const [counter, setCounter] = React.useState(0);
  var a = 0;
  const resource = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.__APP_RESOURCE__ ?? null;
  }, []);

  return (
    <div>
      <h1 className="text-5xl text-green-600 italic underline">Hello world!</h1>
      <h1>App 10 {counter}</h1>
      <button
        className="rounded bg-blue-500 px-4 py-2 text-white"
        onClick={() => setCounter(counter + 1)}
      >
        Count: {counter}
      </button>
      <pre>{JSON.stringify(resource, null, 2)}</pre>
    </div>
  );
};

export default App;
