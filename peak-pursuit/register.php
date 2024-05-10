<?php
session_start();

$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "peak_pursuit";

// create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$email = $_POST['email'];
$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$phone = $_POST['phone'];
$address = $_POST['address'];

// check if email already exists
$sql = "SELECT email FROM Customers WHERE email = '$email'";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    echo "Email already registered.";
    echo "<br>";
    echo '<button onclick="window.history.back();">Go Back</button>';
} else {
    $sql = "INSERT INTO Customers (email, first_name, last_name, phone, address)
            VALUES ('$email', '$firstName', '$lastName', '$phone', '$address')";

    if ($conn->query($sql) === TRUE) {
        // generate a token
        $token = bin2hex(random_bytes(16));

        // update the user record with the new token
        $updateTokenSql = "UPDATE Customers SET auth_token = '$token' WHERE email = '$email'";
        $conn->query($updateTokenSql);

        // set cookie with the token
        setcookie("userToken", $token, time() + 86400 * 30, "/"); // token valid for 30 days
        setcookie("userEmail", $email, time() + 86400 * 30, "/"); // token valid for 30 days

        $_SESSION['userEmail'] = $email; // store user email in session

        // save session cart to database
        if (isset($_SESSION['cart'])) {
            foreach ($_SESSION['cart'] as $product_id => $quantity) {
                $insertCartSql = "INSERT INTO CartItems (user_id, product_id, quantity) VALUES ((SELECT id FROM Customers WHERE email = '$email'), $product_id, $quantity)";
                $conn->query($insertCartSql);
            }
        }

        echo "New record created successfully";
        echo "<br>";
        echo '<button onclick="window.location.href=\'/index.html\';">Return to Home</button>';
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
        echo "<br>";
        echo '<button onclick="window.history.back();">Go Back</button>';
    }
}

$conn->close();
?>