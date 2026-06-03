import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { platform } from 'node:os';
import { resolve } from 'node:path';

const isWindows = platform() === 'win32';
const rootDir = isWindows ? 'C:/' : '/';
const executable = resolve(
    rootDir,
    'Zimmermann',
    'dependency-check',
    'bin',
    isWindows ? 'dependency-check.bat' : 'dependency-check',
);

if (!existsSync(executable)) {
    console.error(
        `OWASP Dependency Check nicht gefunden: ${executable}. Details werden in Issue #17 dokumentiert.`,
    );
    process.exitCode = 1;
} else {
    const nvdApiKey = process.env['NVD_API_KEY'];
    const args = [
        '--project',
        'gebrauchtwagen-ts',
        '--scan',
        '.',
        '--out',
        'reports',
        '--data',
        resolve(rootDir, 'Zimmermann', 'dependency-check-data'),
        '--exclude',
        '**/node_modules/**',
        '--exclude',
        '**/reports/**',
        '--exclude',
        '**/src/generated/**',
        '--nodeAuditSkipDevDependencies',
        '--nodePackageSkipDevDependencies',
        '--disableArchive',
        '--disableAssembly',
        '--disableYarnAudit',
    ];

    if (nvdApiKey !== undefined && nvdApiKey.length > 0) {
        args.unshift('--nvdApiKey', nvdApiKey);
    }

    console.log(`script=${executable}`);
    const child = spawn(executable, args, {
        shell: isWindows,
        stdio: 'inherit',
    });
    child.on('exit', (code) => {
        process.exitCode = code ?? 1;
    });
}
