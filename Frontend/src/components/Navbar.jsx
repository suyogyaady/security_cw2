import React from "react";
import AdminNavbar from "./Navbar/AdminNavbar";
import UserNavbar from "./Navbar/UserNavbar";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return user && user.isAdmin ? (
    <>
      <AdminNavbar></AdminNavbar>
    </>
  ) : (
    <>
      <UserNavbar></UserNavbar>
    </>
  );
};

export default Navbar;
