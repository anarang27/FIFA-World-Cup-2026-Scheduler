/* ───────────────────────────────────────────────
   Auth Routes — signup, login, password change
   ─────────────────────────────────────────────── */

const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const supabase = require('../supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const SALT_ROUNDS = 10;

/* ── Helper: sign a JWT ───────────────────────── */
function signToken(user) {
    return jwt.sign(
        { userid: user.userid, email: user.email, role: user.rolename || 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

/* ── POST /api/auth/signup ────────────────────── */
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, firstname, lastname } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Check if user already exists
        const { data: existing } = await supabase
            .from('User')
            .select('userid')
            .or(`email.eq.${email},username.eq.${username}`)
            .limit(1);

        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'User with this email or username already exists' });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, SALT_ROUNDS);

        // Get default 'user' role id
        const { data: roles } = await supabase
            .from('role')
            .select('roleid')
            .eq('rolename', 'user')
            .limit(1);

        const roleid = roles && roles.length > 0 ? roles[0].roleid : null;

        // Insert user
        const { data: newUser, error } = await supabase
            .from('User')
            .insert({
                username,
                email,
                password: hashed,
                firstname: firstname || null,
                lastname: lastname || null,
                registrationdate: new Date().toISOString().split('T')[0],
                roleid
            })
            .select('userid, username, email')
            .single();

        if (error) throw error;

        const token = signToken({ ...newUser, rolename: 'user' });
        res.status(201).json({ token, user: { userid: newUser.userid, username: newUser.username, email: newUser.email, role: 'user' } });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

/* ── POST /api/auth/login ─────────────────────── */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Fetch user with role
        const { data: users, error } = await supabase
            .from('User')
            .select('userid, username, email, password, firstname, lastname, roleid')
            .eq('email', email)
            .limit(1);

        if (error) throw error;
        if (!users || users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

        // Verify password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Get role name
        let rolename = 'user';
        if (user.roleid) {
            const { data: roleData } = await supabase
                .from('role')
                .select('rolename')
                .eq('roleid', user.roleid)
                .single();
            if (roleData) rolename = roleData.rolename;
        }

        const token = signToken({ ...user, rolename });
        res.json({
            token,
            user: {
                userid: user.userid,
                username: user.username,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                role: rolename
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

/* ── PUT /api/auth/password ───────────────────── */
router.put('/password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        // Fetch current hashed password
        const { data: users } = await supabase
            .from('User')
            .select('password')
            .eq('userid', req.user.userid)
            .single();

        if (!users) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const valid = await bcrypt.compare(currentPassword, users.password);
        if (!valid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash and update
        const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
        const { error } = await supabase
            .from('User')
            .update({ password: hashed })
            .eq('userid', req.user.userid);

        if (error) throw error;

        res.json({ message: 'Password updated successfully' });

    } catch (err) {
        console.error('Password change error:', err);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

/* ── GET /api/auth/me — current user info ─────── */
router.get('/me', requireAuth, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('User')
            .select('userid, username, email, firstname, lastname, roleid')
            .eq('userid', req.user.userid)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let rolename = 'user';
        if (user.roleid) {
            const { data: roleData } = await supabase
                .from('role')
                .select('rolename')
                .eq('roleid', user.roleid)
                .single();
            if (roleData) rolename = roleData.rolename;
        }

        res.json({ ...user, role: rolename });
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

/* ── POST /api/auth/create-user — admin only ──── */
router.post('/create-user', requireAdmin, async (req, res) => {
    try {
        const { username, email, password, firstname, lastname, roleid } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);

        const { data: newUser, error } = await supabase
            .from('User')
            .insert({
                username,
                email,
                password: hashed,
                firstname: firstname || null,
                lastname: lastname || null,
                registrationdate: new Date().toISOString().split('T')[0],
                roleid: roleid || null
            })
            .select('userid, username, email')
            .single();

        if (error) throw error;

        res.status(201).json(newUser);
    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

/* ── GET /api/auth/users — admin only ─────────── */
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('User')
            .select('userid, username, email, firstname, lastname, registrationdate, roleid')
            .order('userid', { ascending: true });

        if (error) throw error;

        // Get all roles for mapping
        const { data: roles } = await supabase.from('role').select('*');
        const roleMap = {};
        if (roles) roles.forEach(r => roleMap[r.roleid] = r.rolename);

        const users = data.map(u => ({
            ...u,
            role: roleMap[u.roleid] || 'user'
        }));

        res.json(users);
    } catch (err) {
        console.error('List users error:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;
