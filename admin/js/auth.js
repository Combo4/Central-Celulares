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
        showMessage('Verificando acceso...', 'info');

        try {
            // Step 1: Check if email is authorized as admin
            const { data: adminCheck, error: adminError } = await supabase
                .from('admin_users')
                .select('email, is_active')
                .eq('email', email)
                .eq('is_active', true)
                .single();

            if (adminError || !adminCheck) {
                throw new Error('Este correo no está autorizado para acceder al panel de administración.');
            }

            // Step 2: Email is authorized, send OTP
            showMessage('Enviando enlace y código...', 'info');
            
            const currentUrl = window.location.href.replace('login.html', 'dashboard.html');
            
            const { data, error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: currentUrl
                }
            });

            if (error) throw error;

            showMessage(
                `✅ ¡Correo enviado! Revisa tu correo: ${email}\n\nRecibirás un enlace de acceso y un código de 8 dígitos.`,
                'success'
            );
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Check if it's an admin authorization error
            if (error.message.includes('no está autorizado')) {
                showMessage(
                    `🚫 Acceso Denegado\n\nEste correo no está clasificado para iniciar sesión.\n\nSolo administradores autorizados pueden acceder al panel.`,
                    'error'
                );
            } else {
                showMessage(
                    `❌ Error: ${error.message}\n\nSi eres administrador, contacta al soporte técnico.`,
                    'error'
                );
            }
        } finally {
            setLoading(false);
        }
    });

    const verifyButton = document.getElementById('verifyButton');
    if (verifyButton) {
        verifyButton.addEventListener('click', async () => {
            const email = document.getElementById('email').value.trim();
            const code = document.getElementById('code').value.trim();

            if (!email) {
                showMessage('Primero ingresa tu correo electrónico', 'error');
                if (window.showToast) showToast('Primero ingresa tu correo electrónico', 'error');
                return;
            }

            if (!/^\d{8}$/.test(code)) {
                const msg = 'Ingresa el código de 8 dígitos que recibiste por correo';
                showMessage(msg, 'error');
                if (window.showToast) showToast(msg, 'error');
                return;
            }

            setLoading(true);
            showMessage('Verificando acceso...', 'info');

            try {
                // Step 1: Check if email is authorized as admin
                const { data: adminCheck, error: adminError } = await supabase
                    .from('admin_users')
                    .select('email, is_active')
                    .eq('email', email)
                    .eq('is_active', true)
                    .single();

                if (adminError || !adminCheck) {
                    throw new Error('Este correo no está autorizado para acceder al panel de administración.');
                }

                // Step 2: Email is authorized, verify code
                showMessage('Verificando código...', 'info');
                
                const { data, error } = await supabase.auth.verifyOtp({
                    email,
                    token: code,
                    type: 'email'
                });

                if (error) throw error;

                showMessage('✅ Código verificado, entrando al panel...', 'success');
                const target = window.location.href.replace('login.html', 'dashboard.html');
                window.location.href = target;

            } catch (error) {
                console.error('Code login error:', error);
                
                // Check if it's an admin authorization error
                if (error.message.includes('no está autorizado')) {
                    showMessage(
                        `🚫 Acceso Denegado\n\nEste correo no está clasificado para iniciar sesión.\n\nSolo administradores autorizados pueden acceder al panel.`,
                        'error'
                    );
                } else {
                    showMessage(
                        `❌ Código inválido o expirado: ${error.message}`,
                        'error'
                    );
                }
            } finally {
                setLoading(false);
            }
        });
    }
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
    
    // Additional check: Verify user is an active admin
    try {
        const { data: adminCheck, error } = await supabase
            .from('admin_users')
            .select('email, is_active')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single();
        
        if (error || !adminCheck) {
            // User is authenticated but not an active admin
            console.error('User is not an active admin');
            await supabase.auth.signOut();
            if (!window.location.pathname.includes('login.html')) {
                alert('Tu cuenta no tiene permisos de administrador. Contacta al soporte.');
                window.location.href = '/admin/login.html';
            }
            return null;
        }
    } catch (err) {
        console.error('Error checking admin status:', err);
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
