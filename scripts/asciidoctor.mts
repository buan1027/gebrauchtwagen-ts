import asciidoctor from '@asciidoctor/core';
import kroki from 'asciidoctor-kroki';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const sourceFile = join('docs', 'projekthandbuch.adoc');
const plantumlJar = join('C:', 'Zimmermann', 'plantuml', 'plantuml.jar');
const plantumlSourceDir = join('docs', 'diagramme', 'src');
const plantumlOutputDir = join('docs', 'html', 'diagramme', 'generated');
const envWithHasOwnProperty = process.env as NodeJS.ProcessEnv & {
    hasOwnProperty?: (key: string) => boolean;
};

if (envWithHasOwnProperty.hasOwnProperty === undefined) {
    Object.defineProperty(envWithHasOwnProperty, 'hasOwnProperty', {
        configurable: true,
        value: Object.prototype.hasOwnProperty.bind(process.env),
    });
}

if (!existsSync(sourceFile)) {
    console.error(
        `Projekthandbuch fehlt noch: ${sourceFile}. Umsetzung erfolgt in Issue #14.`,
    );
    process.exitCode = 1;
} else {
    if (!existsSync(plantumlJar)) {
        console.error(`PlantUML nicht gefunden: ${plantumlJar}`);
        process.exitCode = 1;
        process.exit();
    }

    mkdirSync(plantumlOutputDir, { recursive: true });
    const plantuml = spawnSync(
        'java',
        [
            '-jar',
            plantumlJar,
            '-tsvg',
            '-o',
            join('..', '..', 'html', 'diagramme', 'generated'),
            '*.plantuml',
        ],
        { cwd: plantumlSourceDir, shell: true, stdio: 'inherit' },
    );

    if (plantuml.status !== 0) {
        process.exitCode = plantuml.status ?? 1;
        process.exit();
    }

    const adoc = asciidoctor();
    console.log(`Asciidoctor.js ${adoc.getVersion()}`);

    if (process.env['ALLOW_REMOTE_KROKI'] === 'true') {
        kroki.register(adoc.Extensions);
    }

    adoc.convertFile(sourceFile, {
        safe: 'safe',
        attributes: { linkcss: true },
        base_dir: 'docs',
        to_dir: 'html',
        mkdirs: true,
    });

    console.log(`HTML-Datei ${join('docs', 'html', 'projekthandbuch.html')}`);
}
