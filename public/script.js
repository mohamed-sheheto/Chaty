(function () {
  // Minimal, refactored frontend logic for auth UI
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  const loginForm = qs("#loginForm");
  const signupForm = qs("#signupForm");
  const homePage = qs("#homePage");
  const loginFormElement = qs("#loginFormElement");
  const signupFormElement = qs("#signupFormElement");
  const showSignupLink = qs("#showSignup");
  const showLoginLink = qs("#showLogin");
  const googleLoginBtn = qs("#googleLogin");
  const logoutBtn = qs("#logoutBtn");
  const userNameSpan = qs("#userName");
  const loginErrorDiv = qs("#loginError");
  const signupErrorDiv = qs("#signupError");

  const setActive = (which) => {
    loginErrorDiv.textContent = "";
    signupErrorDiv.textContent = "";
    if (which === "login") {
      loginForm.classList.add("active");
      signupForm.classList.remove("active");
    } else if (which === "signup") {
      signupForm.classList.add("active");
      loginForm.classList.remove("active");
    }
  };

  const showHome = (user) => {
    loginForm.classList.remove("active");
    signupForm.classList.remove("active");
    if (homePage) homePage.classList.remove("hidden");
    if (userNameSpan)
      userNameSpan.textContent = user.username || user.email || "";
  };

  async function postJson(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  }

  if (showSignupLink)
    showSignupLink.addEventListener("click", (e) => {
      e.preventDefault();
      setActive("signup");
    });
  if (showLoginLink)
    showLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      setActive("login");
    });

  if (loginFormElement) {
    loginFormElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      const original = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Logging in...";
      }

      const email = (qs("#loginEmail") || {}).value || "";
      const password = (qs("#loginPassword") || {}).value || "";

      try {
        const { ok, data } = await postJson("/api/v1/auth/login", {
          email,
          password,
        });
        if (ok) showHome(data.user || {});
        else loginErrorDiv.textContent = data.message || "Login failed";
      } catch (err) {
        loginErrorDiv.textContent = "Network error. Please try again.";
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = original;
        }
      }
    });
  }

  if (signupFormElement) {
    signupFormElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      const original = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Signing up...";
      }

      const username = (qs("#signupUsername") || {}).value || "";
      const email = (qs("#signupEmail") || {}).value || "";
      const password = (qs("#signupPassword") || {}).value || "";

      try {
        const { ok, data } = await postJson("/api/v1/auth/signup", {
          username,
          email,
          password,
        });
        if (ok) showHome(data.user || {});
        else signupErrorDiv.textContent = data.message || "Signup failed";
      } catch (err) {
        signupErrorDiv.textContent = "Network error. Please try again.";
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = original;
        }
      }
    });
  }

  if (googleLoginBtn)
    googleLoginBtn.addEventListener("click", () => {
      window.location.href = "/api/v1/auth/google";
    });

  if (logoutBtn)
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("/api/v1/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        setActive("login");
        if (homePage) homePage.classList.add("hidden");
      } catch (_) {
        /* ignore */
      }
    });

  async function checkAuthStatus() {
    try {
      const res = await fetch("/api/v1/auth/", { credentials: "include" });
      if (!res.ok) return setActive("login");
      const data = await res.json().catch(() => ({}));
      if (data.user) return showHome(data.user);
      setActive("login");
    } catch (_) {
      setActive("login");
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    setActive("login");
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get("auth");
    const error = params.get("error");
    if (authStatus === "success") checkAuthStatus();
    else if (error) {
      loginErrorDiv.textContent = error;
      setActive("login");
    } else checkAuthStatus();
  });
})();
