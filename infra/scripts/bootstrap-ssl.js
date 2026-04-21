const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..', '..');

const parseArgs = () => {
    const raw = process.argv.slice(2);
    const options = {};

    for (let i = 0; i < raw.length; i += 1) {
        const arg = raw[i];
        if (!arg.startsWith('--')) {
            continue;
        }

        const key = arg.slice(2);
        const next = raw[i + 1];
        if (!next || next.startsWith('--')) {
            options[key] = 'true';
        } else {
            options[key] = next;
            i += 1;
        }
    }

    return options;
};

const run = (command, args, context) => {
    const result = spawnSync(command, args, {
        cwd: rootDir,
        stdio: 'inherit',
    });

    if (result.status !== 0) {
        throw new Error(`${context} falhou (exit code ${result.status ?? 'desconhecido'}).`);
    }
};

const getLocalIPv4List = () => {
    const interfaces = os.networkInterfaces();
    const ips = [];

    for (const list of Object.values(interfaces)) {
        for (const info of list || []) {
            if (info.family === 'IPv4' && !info.internal) {
                ips.push(info.address);
            }
        }
    }

    return Array.from(new Set(ips));
};

const main = () => {
    const options = parseArgs();
    const profile = (options.profile || 'dev').toLowerCase();

    if (profile !== 'dev' && profile !== 'prod') {
        throw new Error('Perfil invalido. Use --profile dev ou --profile prod.');
    }

    const certDir = path.join(rootDir, 'infra', 'certs', profile);
    const carootDir = path.join(certDir, '.caroot');

    fs.mkdirSync(certDir, { recursive: true });
    fs.mkdirSync(carootDir, { recursive: true });

    const fromArg = (options.domains || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    const baseDomains = ['localhost', '127.0.0.1', '::1'];
    const lanIps = profile === 'dev' ? getLocalIPv4List() : [];
    const domains = Array.from(new Set([...baseDomains, ...lanIps, ...fromArg]));

    const imageTag = 'fabrica-museu-mkcert:local';

    console.log('>> Construindo imagem local de mkcert...');
    run('docker', ['build', '-f', 'infra/mkcert/Dockerfile', '-t', imageTag, '.'], 'Build da imagem mkcert');

    console.log('>> Gerando certificado TLS com mkcert via Docker...');
    run(
        'docker',
        [
            'run',
            '--rm',
            '-e',
            'CAROOT=/work/certs/.caroot',
            '-v',
            `${certDir}:/work/certs`,
            imageTag,
            '-cert-file',
            '/work/certs/tls.crt',
            '-key-file',
            '/work/certs/tls.key',
            ...domains,
        ],
        'Geracao do certificado TLS'
    );

    console.log('>> Subindo stack Docker no perfil selecionado...');
    run('docker', ['compose', '--profile', profile, 'up', '-d'], `docker compose --profile ${profile} up -d`);

    // Recria o nginx para garantir que ele releia o fallback HTTP/HTTPS apos gerar certificados.
    const nginxService = profile === 'dev' ? 'nginx-dev' : 'nginx-prod';
    run(
        'docker',
        ['compose', '--profile', profile, 'up', '-d', '--force-recreate', '--no-deps', nginxService],
        `docker compose --profile ${profile} up -d --force-recreate --no-deps ${nginxService}`
    );

    console.log('');
    console.log(`OK: Certificados gerados em infra/certs/${profile}/tls.crt e infra/certs/${profile}/tls.key`);
    console.log(`CA local do mkcert em infra/certs/${profile}/.caroot/rootCA.pem`);
    console.log(`Perfil inicializado: ${profile}`);

    if (profile === 'dev') {
        console.log('Dev URLs:');
        console.log('- http://localhost:8080');
        console.log('- https://localhost:8443');
    }
};

try {
    main();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
