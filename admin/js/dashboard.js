const API_URL = (function () {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        return 'http://localhost:3002/api';
    }
    return 'https://endless-kevina-central-celulares-8eb37001.koyeb.app/api';
})();

async function getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
}

// Dashboard is now a simple navigation hub; no product list is loaded here.
