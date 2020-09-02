export const create = (context) => {
    const starts = new Map();
    return {
        'Program': () => {
            const filename = context.getFilename();
            starts.set(filename, process.hrtime());
        },
        'Program:exit': () => {
            const filename = context.getFilename();
            const start = starts.get(filename);
            const [s, ns] = process.hrtime(start);
            const elapsed = s === 0
            ? `${(ns / 1e6).toFixed(3)}ms`
            : `${(s + ns / 1e6).toFixed(3)}s`;
            console.log(`${filename} (${elapsed})`);
        },
    };
};
