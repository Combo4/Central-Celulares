// TEMPORARY: Disable auth for testing
const DISABLE_AUTH_CHECK = false;

const SUPABASE_URL = 'https://ovmuoyboouodqgxvpxsq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zOo4vGgMgAt4wZXpJgci7A_hK-F_3_A';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 10000);
    }
}

function setLoading(isLoading) {
    const button = document.getElementById('loginButton');
    const buttonText = document.getElementById('buttonText');
    const spinner = document.getElementById('buttonSpinner');
    
    button.disabled = isLoading;
    buttonText.style.display = isLoading ? 'none' : 'inline';
    spinner.style.display = isLoading ? 'inline' : 'none';
}

async function handleRedirectCallback() {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    
    if (accessToken) {
        const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });
        
        if (!error) {
            window.location.href = '/admin/dashboard.html';
        }
    }
}

if (window.location.hash.includes('access_token')) {
    handleRedirectCallback();
}

if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        
        if (!email) {
            showMessage('Por favor ingresa tu correo electrónico', 'error');
            return;
        }

        setLoading(true);
        showMessage('Enviando enlace mágico...', 'info');

        try {
            const currentUrl = window.location.href.replace('login.html', 'dashboard.html');
            
            const { data, error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: currentUrl
                }
            });

            if (error) throw error;

            showMessage(
                `✅ ¡Enlace enviado! Revisa tu correo: ${email}\n\nHaz clic en el enlace para acceder al panel.`,
                'success'
            );
            
            document.getElementById('email').value = '';
            
        } catch (error) {
            console.error('Login error:', error);
            showMessage(
                `❌ Error: ${error.message}\n\nVerifica que tu correo esté autorizado como administrador.`,
                'error'
            );
        } finally {
            setLoading(false);
        }
    });
}

async function checkAuth() {
    // Skip auth check if disabled
    if (DISABLE_AUTH_CHECK) {
        return { user: { email: 'test@example.com' } };
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/admin/login.html';
        }
        return null;
    }
    
    if (window.location.pathname.includes('login.html')) {
        window.location.href = '/admin/dashboard.html';
        return null;
    }
    
    return session;
}

async function logout() {
    try {
        await supabase.auth.signOut();
        window.location.href = '/admin/login.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error al cerrar sesión');
    }
}

if (window.location.pathname.includes('dashboard.html')) {
    checkAuth().then(session => {
        if (!session) return;
        
        const userEmailSpan = document.getElementById('userEmail');
        if (userEmailSpan) {
            userEmailSpan.textContent = session.user.email;
        }
    });
}

if (!DISABLE_AUTH_CHECK) {
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN') {
            if (window.location.pathname.includes('login.html')) {
                window.location.href = '/admin/dashboard.html';
            }
        } else if (event === 'SIGNED_OUT') {
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = '/admin/login.html';
            }
        }
    });
}
