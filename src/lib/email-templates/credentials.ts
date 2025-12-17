
export const getCredentialsEmailTemplate = ({
    email,
    password,
    name = "User"
}: {
    email: string;
    password: string;
    name?: string;
}) => {
    // GraduationCap SVG path for email embedding
    const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Account Credentials</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; text-align: left; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 0 40px; text-align: center;">
                            <div style="display: inline-block; padding: 16px; background-color: #eff6ff; border-radius: 50%; margin-bottom: 24px;">
                                ${logoSvg}
                            </div>
                            <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 800;">Account Credentials</h1>
                            <p style="margin: 8px 0 0; color: #6b7280; font-size: 16px;">Government Graduate College Satiana Road Faisalabad</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0; color: #374151; font-size: 16px; line-height: 24px;">
                                Hello <strong>${name}</strong>,
                            </p>
                            <p style="margin: 16px 0 0; color: #374151; font-size: 16px; line-height: 24px;">
                                Your account has been created. Please use the credentials below to log in after verifying your email address.
                            </p>

                            <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 32px 0;">
                                <div style="margin-bottom: 16px;">
                                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Email Address</p>
                                    <p style="margin: 4px 0 0; color: #111827; font-size: 16px; font-weight: 500;">${email}</p>
                                </div>
                                <div>
                                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Temporary Password</p>
                                    <p style="margin: 8px 0 0; color: #111827; font-size: 24px; font-weight: 700; font-family: monospace; letter-spacing: 2px;">${password}</p>
                                </div>
                            </div>

                            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                                For your security, please change your password after your first login.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 16px;">
                                This email was sent securely from the Student Portal System.
                                <br>
                                If you did not request this account, please ignore this email.
                            </p>
                            <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px; font-weight: 600;">
                                &copy; ${new Date().getFullYear()} Government Graduate College Satiana Road Faisalabad
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};
