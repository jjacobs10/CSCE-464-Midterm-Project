<?php
session_start();

$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "peak_pursuit";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$userEmail = $_COOKIE['userEmail'] ?? '';

if ($userEmail) {
    $stmt = $conn->prepare("SELECT product_id, quantity FROM CartItems WHERE auth_token = (SELECT auth_token FROM Customers WHERE email = ?)");
    $stmt->bind_param("s", $userEmail);
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $cart = array();
        while ($row = $result->fetch_assoc()) {
            $cart[$row['product_id']] = $row['quantity'];
        }
        echo json_encode($cart);
    } else {
        echo "Error retrieving cart: " . $conn->error;
    }
} else {
    echo json_encode([]);
}

$conn->close();
?>