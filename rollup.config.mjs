import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import dotenv from 'rollup-plugin-dotenv';

export default [
  {
    input: 'sidepanel/index.js',
    output: {
      dir: 'dist/sidepanel',
      format: 'iife',
    },
    plugins: [
      commonjs(),
      nodeResolve(),
      json(),
      dotenv(),
      copy({
        targets: [
          {
            src: ['manifest.json', 'background.js', 'sidepanel', 'assets'],
            dest: 'dist'
          }
        ]
      })
    ]
  }
];