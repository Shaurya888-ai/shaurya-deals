"use strict";

(function () {

  // 🔐 YAHAN APNA ADMIN EMAIL DAALO
  const ADMIN_EMAILS = [
    "babushaurya888@gmail.com"
  ];

  function isAdmin(user) {
    return user && user.email && ADMIN_EMAILS.includes(user.email);
  }

  function attachSecurity(auth) {

    auth.onAuthStateChanged(user => {

      if (!user) return;

      if (!isAdmin(user)) {
        auth.signOut();
        alert("Access Denied ❌ You are not admin");
        console.log("Blocked user:", user.email);
      }

    });

  }

  window.AdminSecurity = {
    attachSecurity
  };

})();
