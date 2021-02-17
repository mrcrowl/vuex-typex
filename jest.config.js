module.exports = {
    preset: "ts-jest",
    testRegex: "tests/.*\\.spec.ts$",
    moduleNameMapper: {
    },
    globals: {
        "ts-jest": {
            diagnostics: false,
        },
    },
    setupFiles: ["<rootDir>/jest-setup.ts"],
};
