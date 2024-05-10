<?php
session_start();

// clear session variables
session_unset();

session_destroy();
echo "Logged out successfully";
?>