<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Pagina de autentificare</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f4f4f4;
        }

        .login-container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            width: 300px;
            text-align: center;
        }

        input[type="email"], input[type="password"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        input[type="submit"] {
            width: 100%;
            padding: 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        input[type="submit"]:hover {
            background-color: #45a049;
        }

        .message {
            margin-top: 10px;
        }
    </style>
</head>
<body>

    <div class="login-container">
        <h2>Autentificare</h2>
        <form method="POST" action="login.php">
            <input type="email" name="email" placeholder="Adresa de email" required><br>
            <input type="password" name="password" placeholder="Parola" required><br>
            <input type="submit" value="Logare">
        </form>
        <div class="message">
            <p>Nu ai cont? <a href="#">Înregistrează-te aici</a></p>
        </div>
    </div>
</body>
</html>