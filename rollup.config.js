import typescript from 'rollup-plugin-typescript2';
import cleaner from 'rollup-plugin-cleaner';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [
    typescript({
      tsconfig: "tsconfig-src.json"
    }),
    cleaner({
        targets: [
          './dist/'
        ]
      })
  ],
  external: [ 'vuex' ] // <-- suppresses the warning
};