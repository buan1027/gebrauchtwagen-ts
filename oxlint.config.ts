// Copyright (C) 2026 - current Juergen Zimmermann
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

import { defineConfig } from 'oxlint';

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
    categories: {
        correctness: 'error',
        suspicious: 'error',
    },

    env: {
        es2026: true,
        node: true,
    },

    ignorePatterns: ['dist/**', 'coverage/**', 'src/generated/**'],

    options: {
        denyWarnings: true,
        reportUnusedDisableDirectives: 'off',
        typeAware: true,
        typeCheck: true,
    },

    rules: {
        // Direkte undefined-Vergleiche bleiben bewusst erlaubt; ESLint
        // Unicorn und SonarQube bevorzugen value === undefined.
        'no-undefined': 'off',
        // JSON-Parsing in Integrationstests und Brand-Types werden weiterhin
        // durch TypeScript und ESLint begrenzt.
        'typescript/no-unsafe-type-assertion': 'off',
    },
});
