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

$data = json_decode(file_get_contents('php://input'), true);

$userToken = $data['userToken'];  
$productId =  $data['productId'];
$quantity =  $data['quantity'];

// using the userToken, get the customer_id
$sql = "INSERT INTO CartItems (auth_token, product_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)"; 

$stmt = $conn->prepare($sql);
$stmt->bind_param("sii", $userToken, $productId, $quantity); // bind userToken

if ($stmt->execute() === TRUE) {
    echo "Item added to cart successfully";
} else {
    echo "Error adding item to cart: " . $conn->error;
}

$conn->close();
?>
