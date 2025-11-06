import React, { useMemo } from "react";

const App = () => {
    const [counter, setCounter] = React.useState(0);
    const resource = useMemo(() => {
        if (typeof window === 'undefined') {
            return null;
        }

        return window.__FPNAP_RESOURCE__ ?? null;
    }, []);

    return (
        <div>
            <h1>App 10 {counter}</h1>
            <button onClick={() => setCounter(counter + 1)}>Count: {counter}</button>
            <pre>{JSON.stringify(resource, null, 2)}</pre>

        </div>
    );
};

export default App;
