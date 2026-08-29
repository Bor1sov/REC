export default {
    input: "scripts/script.source.js",
    plugins: [
        {
            name: "strip-cache-query",
            resolveId(source, importer) {
                if (!source.includes("?v=")) return null;

                return this.resolve(source.split("?")[0], importer, {
                    skipSelf: true
                });
            }
        }
    ],
    output: {
        file: "scripts/script.js",
        format: "es",
        inlineDynamicImports: true
    }
};