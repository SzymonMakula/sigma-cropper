import typescript from "@rollup/plugin-typescript";
import bundleSize from 'rollup-plugin-bundle-size';
import terser from '@rollup/plugin-terser';
import css from "rollup-plugin-import-css";

export default {
    input: "src/main.ts",
    output: {
        format: "iife",
        file: "dist/index.js",
    },
    plugins: [typescript(),
        bundleSize(),
        css({
            minify: true
        }),
        terser(),
    ],
};
