# Project Architecture Rules

- Keep ALFA Brain graph data in a typed local module and render it through a dedicated D3 component, because source provenance and visualization behavior must remain independently maintainable.
- Model external automation such as n8n as protected graph topology only until a real connection is authorized, because visualization must never imply live execution.
- Keep Golden Orb examples browser-local, deterministic, and explicitly labeled as simulation, because audit demonstrations must never trigger agents or external actions.
- Scope Gold-Black design tokens to the ALFA Brain page, because the existing portfolio pages retain their current theme.