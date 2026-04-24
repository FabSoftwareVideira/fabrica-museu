const OFFLINE_HTML = `<!doctype html>
<html lang="pt-BR">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Museu do Vinho - Offline</title>
        <style>
            body { margin: 0; font-family: Georgia, serif; background: #f8f4f1; color: #2e2220; }
            main { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
            article { max-width: 560px; background: #fff; border: 1px solid #d8c7bc; border-radius: 12px; padding: 24px; }
            h1 { margin: 0 0 12px; color: #6d1623; font-size: 1.5rem; }
            p { margin: 0 0 10px; line-height: 1.5; }
        </style>
    </head>
    <body>
        <main>
            <article>
                <h1>Voce esta offline</h1>
                <p>Nao foi possivel carregar esta pagina sem conexao com a internet.</p>
                <p>Assim que a rede voltar, recarregue para continuar navegando no acervo.</p>
            </article>
        </main>
    </body>
</html>`;

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            if (event.request.mode === 'navigate') {
                return new Response(OFFLINE_HTML, {
                    status: 200,
                    headers: {
                        'content-type': 'text/html; charset=utf-8',
                        'cache-control': 'no-store',
                    },
                });
            }

            return Response.error();
        })
    );
});
