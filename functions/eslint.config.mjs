// See https://stackoverflow.com/a/79327789
import google from 'eslint-config-google';
delete google.rules['valid-jsdoc'];
delete google.rules['require-jsdoc'];

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	google,
	js.configs.recommended,
	...ts.configs.recommended,
	prettier,
	{
		languageOptions: {
			globals: { ...globals.node }
		}
	},
	{
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: fileURLToPath(new URL('../', import.meta.url))
			}
		}
	}
);
