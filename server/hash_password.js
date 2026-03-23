import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
    console.log("Usage: node hash_password.js <your_password>");
    process.exit(1);
}

const saltRounds = 10;
bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }
    console.log("-----------------------------------------");
    console.log("Password:", password);
    console.log("Hashed Password:", hash);
    console.log("-----------------------------------------");
    console.log("\nYou can now insert this hash into the 'utilisateurs' table in your database.");
});
