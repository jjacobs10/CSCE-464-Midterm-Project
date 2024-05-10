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

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("UPDATE CartItems SET quantity = quantity - 1 WHERE auth_token = ? AND product_id = ? AND quantity > 1");
    $stmt->bind_param("si", $userToken, $productId);
    $stmt->execute();

    $stmt = $conn->prepare("DELETE FROM CartItems WHERE auth_token = ? AND product_id = ? AND quantity <= 1");
    $stmt->bind_param("si", $userToken, $productId);
    $stmt->execute();

    $conn->commit();
    echo "Item updated or removed successfully";
} catch (Exception $e) {
    $conn->rollback();
    echo "Error: " . $e->getMessage();
}

$conn->close();
?>
