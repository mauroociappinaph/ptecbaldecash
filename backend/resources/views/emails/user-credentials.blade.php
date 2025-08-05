<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="format-detection" content="telephone=no">
    <title>Welcome to User Management System</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 28px;
        }
        .content {
            margin-bottom: 30px;
        }
        .credentials {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #007bff;
            margin: 20px 0;
        }
        .credentials h3 {
            margin-top: 0;
            color: #495057;
        }
        .credential-item {
            margin: 10px 0;
            padding: 8px 0;
        }
        .credential-label {
            font-weight: bold;
            color: #6c757d;
            display: inline-block;
            width: 80px;
        }
        .credential-value {
            color: #212529;
            font-family: 'Courier New', monospace;
            background-color: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .warning strong {
            display: block;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to User Management System</h1>
        </div>

        <div class="content">
            <p>Hello <strong>{!! $user->name !!} {!! $user->last_name !!}</strong>,</p>

            <p>Your account has been successfully created in the User Management System. Below are your login credentials:</p>

            <div class="credentials">
                <h3>Your Login Credentials</h3>
                <div class="credential-item">
                    <span class="credential-label">Email:</span>
                    <span class="credential-value">{{ $user->email }}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Password:</span>
                    <span class="credential-value">{{ $password }}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Role:</span>
                    <span class="credential-value">{{ $user->role->label() }}</span>
                </div>
            </div>

            <div class="warning">
                <strong>Important Security Notice:</strong>
                Please change your password after your first login for security purposes. Keep your credentials secure and do not share them with anyone.
            </div>

            <p>You can now log in to the system using these credentials. If you have any questions or need assistance, please contact your system administrator.</p>

            <p>Best regards,<br>
            <strong>User Management System Team</strong></p>
        </div>

        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; {{ date('Y') }} User Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
