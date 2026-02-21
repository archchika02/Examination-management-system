const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const validateEmail = (email, role) => {
    // Allow specific test email 
    if (email === 'archchika27@gmail.com') return true;

    if (email === 'nacow76709@gxuzi.com') return true; //faculty staff

    if (email === 'wevaw72949@gxuzi.com') return true; // hall atta

    if (email === 'bagivi1341@gxuzi.com') return true; //dept staff

    if (email === 'yihobat906@gxuzi.com') return true; // faculty staff

    if (email === 'lihij13980@gamening.com') return true; //batch rep

    if (email === 'wevaw72949@gxuzi.com') return true; // for AS


    if (email === 'hemoyev878@gamening.com') return true;

    if (email === 'thavashikalaxi@gmail.com') return true;

    if (email === 'archchika.t@gmail.com') return true;

    if (role === 'Student' || role === 'BatchRepresentative') {
        return email.endsWith('@stu.kln.ac.lk');
    }
    else {
        // For other roles, assume staff domain
        return email.endsWith('@kln.ac.lk');
    }
};




// Helper for sending emails
const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: html
    };

    try {
        console.log(`Attempting to send email to ${to}`);
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SENT] Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('FATAL EMAIL ERROR:', error);
        return false;
    }
};

exports.register = async (req, res) => {
    let { email, password, role, name, mobile, student_number, level } = req.body;

    try {
        // 1. Validation
        if (!validateEmail(email, role)) {
            return res.status(400).json({ message: 'Invalid email domain for the selected role.' });
        }

        const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        if (role === 'Dean' || role === 'AcademicSupervisor') {
            const [existingRole] = await pool.execute('SELECT * FROM users WHERE role = ?', [role]);
            if (existingRole.length > 0) {
                return res.status(400).json({ message: `${role} account already exists. Only one is allowed.` });
            }
        }

        // Map BatchRepresentative to BatchRep for database storage
        if (role === 'BatchRepresentative') {
            role = 'BatchRep';
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [userResult] = await connection.execute(
                'INSERT INTO users (email, password_hash, role, name, mobile) VALUES (?, ?, ?, ?, ?)',
                [email, hashedPassword, role, name, mobile]
            );
            const userId = userResult.insertId;

            if (role === 'Student' || role === 'BatchRep') {
                if (!student_number) throw new Error('Student number is required');
                // Ensure level is not undefined, default to 1 if not provided
                const studentLevel = level || 1;
                await connection.execute(
                    'INSERT INTO student_details (user_id, student_number, level) VALUES (?, ?, ?)',
                    [userId, student_number, studentLevel]
                );
            }

            // Create Verification Token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            await connection.execute(
                'INSERT INTO email_verifications (email, token, expires_at) VALUES (?, ?, ?)',
                [email, verificationToken, verificationExpires]
            );

            await connection.commit();

            // Send Email
            const verifyUrl = `http://localhost:5173/verify-email?token=${verificationToken}&email=${email}`;
            const emailHtml = `
                    <h1>Verify Your Email</h1>
                    <p>Please click the link below to verify your account:</p>
                    <a href="${verifyUrl}">${verifyUrl}</a>
                `;

            await sendEmail(email, 'EMS Account Verification', emailHtml);

            res.status(201).json({
                message: 'Registration successful. A verification email has been sent. Please check your inbox (and spam).',
                requiresVerification: true
            });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        if (!user.is_verified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }

        if ((user.role === 'FacultyStaff' || user.role === 'DeptStaff') && user.approval_status !== 'Approved') {
            return res.status(403).json({ message: 'Your account is waiting for approval.' });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Map BatchRep back to BatchRepresentative for frontend
        let role = user.role;
        if (role === 'BatchRep') {
            role = 'BatchRepresentative';
        }

        const payload = {
            user_id: user.user_id,
            email: user.email,
            role: role,
            name: user.name
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: payload });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate Token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        await pool.execute(
            'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
            [email, token, expiresAt]
        );

        // Send Email
        const resetUrl = `http://localhost:5173/reset-password?token=${token}&email=${email}`;
        const emailHtml = `
            <h1>Password Reset</h1>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 1 hour.</p>
        `;

        await sendEmail(email, 'EMS Password Reset', emailHtml);

        res.json({ message: 'Password reset link sent to email (check inbox/spam)' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;
    try {
        // Validate Token
        const [resets] = await pool.execute(
            'SELECT * FROM password_resets WHERE email = ? AND token = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, token]
        );

        if (resets.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Update Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);

        // Cleanup tokens
        await pool.execute('DELETE FROM password_resets WHERE email = ?', [email]);

        res.json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.checkRoles = async (req, res) => {
    try {
        const [dean] = await pool.execute("SELECT 1 FROM users WHERE role = 'Dean' LIMIT 1");
        const [supervisor] = await pool.execute("SELECT 1 FROM users WHERE role = 'AcademicSupervisor' LIMIT 1");

        res.json({
            deanExists: dean.length > 0,
            supervisorExists: supervisor.length > 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error checkRoles' });
    }
};

exports.verifyEmail = async (req, res) => {
    const { email, token } = req.body;

    try {
        const [verifications] = await pool.execute(
            'SELECT * FROM email_verifications WHERE email = ? AND token = ? AND expires_at > NOW()',
            [email, token]
        );

        if (verifications.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification token.' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Update user status
            await connection.execute('UPDATE users SET is_verified = TRUE WHERE email = ?', [email]);

            // Delete verification record
            await connection.execute('DELETE FROM email_verifications WHERE email = ?', [email]);

            await connection.commit();
            res.json({ message: 'Email verified successfully. You can now login.' });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error verifying email' });
    }
};

exports.resendVerification = async (req, res) => {
    const { email } = req.body;

    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        if (user.is_verified) {
            return res.status(400).json({ message: 'Email is already verified.' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Delete existing tokens for this email to prevent spam/confusion
            await connection.execute('DELETE FROM email_verifications WHERE email = ?', [email]);

            // Create new Verification Token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            await connection.execute(
                'INSERT INTO email_verifications (email, token, expires_at) VALUES (?, ?, ?)',
                [email, verificationToken, verificationExpires]
            );

            await connection.commit();

            // Send Email
            const verifyUrl = `http://localhost:5173/verify-email?token=${verificationToken}&email=${email}`;
            const emailHtml = `
                    <h1>Verify Your Email</h1>
                    <p>You requested a new verification link. Please click the link below to verify your account:</p>
                    <a href="${verifyUrl}">${verifyUrl}</a>
                    <p>This link will expire in 5 minutes.</p>
                `;

            await sendEmail(email, 'EMS Account Verification - Resend', emailHtml);

            res.json({ message: 'A new verification email has been sent. Please check your inbox (and spam).' });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error resending verification email' });
    }
};
