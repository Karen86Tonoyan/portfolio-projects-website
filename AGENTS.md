# Project Architecture Rules

- Keep ALFA Brain graph data in a typed local module and render it through a dedicated D3 component, because source provenance and visualization behavior must remain independently maintainable.
- Scope Gold-Black design tokens to the ALFA Brain page, because the existing portfolio pages retain their current theme.