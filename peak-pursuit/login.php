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

// check if email already exists
$stmt = $conn->prepare("SELECT email, auth_token FROM Customers WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) { // email exists
    $row = $result->fetch_assoc();
    $token = $row['auth_token'];

    setcookie("userToken", $token, time() + 86400 * 30, "/");
    setcookie("userEmail", $email, time() + 86400 * 30, "/");

    $_SESSION['userEmail'] = $email; // store user email in session

    // load cart from database
    $cartSql = "SELECT product_id, quantity FROM CartItems WHERE auth_token = (SELECT auth_token FROM Customers WHERE email = ?)";
    $cartStmt = $conn->prepare($cartSql);
    if ($cartStmt) {
        $cartStmt->bind_param("s", $email);
        $cartStmt->execute();
        $cartResult = $cartStmt->get_result();
        $cart = array();
        while ($row = $cartResult->fetch_assoc()) {
            $cart[$row['product_id']] = $row['quantity'];
        }
        $_SESSION['cart'] = $cart; // update cart in session
    } else {
        echo "Error preparing cart query: " . $conn->error;
    }

    echo "Logged in successfully";
    echo "<br>";
    echo '<button onclick="window.location.href=\'/index.html\';">Return to Home</button>';
} else {
    echo "Email not registered. Please check your email or register.";
    echo "<br>";
    echo '<button onclick="window.history.back();">Go Back</button>';
}

$conn->close();
?>