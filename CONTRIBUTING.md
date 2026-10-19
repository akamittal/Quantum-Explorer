# 🤝 Contributing to Quantum Explorer

We love community engagement. To maintain structural integrity, all contributors must adhere to our engineering guidelines.

---

## 🌿 Branch Naming Specifications

We enforce a strict prefix-based branch architecture. Choose the exact category that describes your update:

*   `feature/` : Deploying a new algorithm sandbox or visual framework (e.g., `feature/grovers-3d-vector`).
*   `fix/`     : Addressing mathematical anomalies, computational drifts, or visual rendering lag.
*   `docs/`    : Modifying explicit derivation write-ups or platform operational guides.
*   `chore/`   : Housekeeping, configuration upgrades, or version dependency changes.

*Formatting:* Use low-case alphanumeric letters separating terms with hyphens (e.g., `feature/vqe-energy-landscape`).

---

## 💾 Commit Message Directives

We implement **Conventional Commits** to keep our version history readable:

```text
<type>(<scope>): <short, imperative description>

[optional body details]
```

**Permitted Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
*Example:* `feat(frontend): implement real-time 3D rotation trajectories on Bloch vector`

---

## 📬 Pull Request (PR) Mandates

1. Always branch off the latest state of the upstream `main` node.
2. Ensure your code contains zero linting errors, no dead logic blocks, and handles float precision drift gracefully.
3. Every PR must clearly outline the problem it solves and attach validation screenshots of any 3D rendering updates.
4. Direct pushes to `main` are strictly locked out by governance policies. All additions require at least one authorized reviewer sign-off.
