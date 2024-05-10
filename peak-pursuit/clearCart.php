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

$userToken = $_COOKIE['userToken'];

$sql = "DELETE FROM CartItems WHERE auth_token = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $userToken);

if ($stmt->execute()) {
    echo "Cart cleared";
} else {
    echo "Error clearing cart";
}

$conn->close();
?>